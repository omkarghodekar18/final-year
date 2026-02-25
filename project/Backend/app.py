import os
import uuid
import json
import requests
from urllib.parse import unquote
from utils.nlp import get_skill_extractor
from flask import Flask, jsonify, g, request
from flask_cors import CORS
from dotenv import load_dotenv
from utils.tts_service import generate_speech_bytes
from flask import Response
from utils.scheduler import start_scheduler
import cloudinary
from database import get_db
from bson.objectid import ObjectId
from bson.errors import InvalidId
import cloudinary.uploader
from pdfminer.high_level import extract_text
from auth import require_auth
from models.user import (
    upsert_user, get_user_by_clerk_id, update_user_profile,
    ensure_indexes, update_user_resume, get_user_resume_public_id,
)
from utils.embedding import generate_embedding
from utils.qdrant_store import (
    upsert_resume_vector, ensure_collections,
    get_resume_embedding, search_similar_jobs,
)

load_dotenv()

app = Flask(__name__)

# Allow requests from the Next.js frontend
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
CORS(app, origins=cors_origins, supports_credentials=True)

# ── Resume uploads folder ────────────────────────────────────────────────────
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "resumes")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5 MB max upload size
ALLOWED_EXTENSIONS = {".pdf"}

# ── Cloudinary config ────────────────────────────────────────────────────────
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

skill_extractor = get_skill_extractor()

# Create MongoDB indexes and Qdrant collections on startup
with app.app_context():
    try:
        ensure_indexes()
    except Exception:
        pass
    try:
        ensure_collections()
    except Exception:
        pass

# ── Start background job-fetch scheduler (runs at midnight in a daemon thread) ──
start_scheduler()


@app.route("/", methods=["GET"])
def hello_world():
    return "hello world"


@app.route("/api/jobs", methods=["GET"])
@require_auth
def get_matched_jobs():
    """Return top 10 jobs matched to the user's resume embedding.
    If the user hasn't uploaded a resume yet, return has_resume=false."""
    clerk_id = g.user.get("sub")
    user = get_user_by_clerk_id(clerk_id)

    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
    except ValueError:
        page = 1
        limit = 10

    offset = (page - 1) * limit

    if not user or not user.get("resume_url"):
        return jsonify({"has_resume": False, "jobs": [], "page": page, "has_more": False})

    # Retrieve the resume embedding from Qdrant
    embedding = get_resume_embedding(clerk_id)
    if not embedding:
        return jsonify({"has_resume": True, "jobs": [], "page": page, "has_more": False})

    # Find similar jobs in Qdrant.
    # Fetch up to (offset + limit + 1) from the top, then slice the page.
    # This avoids Qdrant's offset capping issue where it silently returns fewer results.
    fetch_count = offset + limit + 1
    all_matches = search_similar_jobs(embedding, limit=fetch_count)
    
    page_matches = all_matches[offset:offset + limit]
    has_more = len(all_matches) > offset + limit
    matches = page_matches

    # Look up full metadata from MongoDB
    from database import get_db
    jobs_col = get_db()["jobs"]

    results = []
    
    # User's current skills to compute missing skills
    user_skills_set = set(user.get("skills", []))
    
    for match in matches:
        job_id = match.payload.get("job_id")
        if not job_id:
            continue
        job_doc = jobs_col.find_one({"job_id": job_id})
        if not job_doc:
            continue
            
        full_desc = job_doc.get("description", "")
        
        # Calculate missing skills
        missing_skills = []
        job_skills = job_doc.get("skills")
        
        if job_skills is not None:
            # New format: skills are pre-computed in MongoDB
            job_skills_set = set(job_skills)
            missing_skills = sorted(list(job_skills_set - user_skills_set))
        elif skill_extractor and full_desc:
            # Fallback for old jobs without 'skills' field
            try:
                annotations = skill_extractor.annotate(full_desc)
                full_matches = annotations.get("results", {}).get("full_matches", [])
                ngram_matches = annotations.get("results", {}).get("ngram_scored", [])
                job_skills_set = set(
                    [s["doc_node_value"] for s in full_matches] +
                    [s["doc_node_value"] for s in ngram_matches]
                )
                
                # Missing skills = skills needed for job - user's existing skills
                missing_skills = sorted(list(job_skills_set - user_skills_set))
            except Exception:
                pass
                
        results.append({
            "job_id": job_id,
            "title": job_doc.get("title"),
            "company": job_doc.get("company"),
            "location": job_doc.get("location"),
            "country": job_doc.get("country"),
            "description": full_desc[:300],
            "apply_link": job_doc.get("apply_link"),
            "employment_type": job_doc.get("employment_type"),
            "posted_at": job_doc.get("posted_at"),
            "match_score": round(match.score * 100, 1),
            "missing_skills": missing_skills[:7],  # Suggest up to 7 missing skills
        })

    return jsonify({
        "has_resume": True,
        "jobs": results,
        "page": page,
        "has_more": has_more,
    })


@app.route("/api/auth/sync", methods=["POST"])
@require_auth
def sync_user():
    """Called by the frontend after sign-in.
    Checks if the user exists in MongoDB; if not, creates them."""
    claims = g.user
    body = request.get_json(silent=True) or {}

    user = upsert_user(
        clerk_id=claims.get("sub"),
        email=body.get("email", ""),
        first_name=body.get("first_name"),
        last_name=body.get("last_name"),
        profile_image_url=body.get("profile_image_url"),
    )

    return jsonify(user)


@app.route("/api/me", methods=["GET"])
@require_auth
def get_me():
    """Protected route – returns the user profile from MongoDB."""
    user = get_user_by_clerk_id(g.user.get("sub"))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)


@app.route("/api/me", methods=["PUT"])
@require_auth
def update_me():
    """Update the authenticated user's profile fields."""
    body = request.get_json(silent=True) or {}
    clerk_id = g.user.get("sub")

    user = update_user_profile(
        clerk_id,
        first_name=body.get("first_name"),
        last_name=body.get("last_name"),
        email=body.get("email"),
        phone=body.get("phone"),
        location=body.get("location"),
        job_title=body.get("job_title"),
        bio=body.get("bio"),
    )

    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)


@app.route("/api/parse-resume", methods=["POST"])
@require_auth
def parse_resume():
    """Accept a PDF resume, extract skills, upload to Cloudinary, and persist."""
    if skill_extractor is None:
        return jsonify({"error": "Resume parsing is not available. Run setup_dependencies.py first."}), 503

    if "resume" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["resume"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Validate file type
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({"error": f"Invalid file type '{ext}'. Only PDF files are accepted."}), 400

    clerk_id = g.user.get("sub")

    # Save temporarily for parsing
    filename = f"{uuid.uuid4()}.pdf"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    try:
        # ── Extract skills ──────────────────────────────────────────────
        text = extract_text(filepath)
        annotations = skill_extractor.annotate(text)
        full_matches = annotations["results"]["full_matches"]
        ngram_matches = annotations["results"]["ngram_scored"]
        skills = sorted(set(
            [s["doc_node_value"] for s in full_matches] +
            [s["doc_node_value"] for s in ngram_matches]
        ))

        # ── Delete old resume from Cloudinary (if any) ──────────────────
        old_public_id = get_user_resume_public_id(clerk_id)
        if old_public_id:
            try:
                cloudinary.uploader.destroy(old_public_id, resource_type="raw")
            except Exception:
                pass

        # ── Upload new resume to Cloudinary ─────────────────────────────
        upload_result = cloudinary.uploader.upload(
            filepath,
            resource_type="raw",
            folder="skillsbridge/resumes",
            public_id=filename.replace(".pdf", ""),
            format="pdf",
            access_mode="public",
            type="upload",
        )
        resume_url = upload_result["secure_url"]
        resume_public_id = upload_result["public_id"]

        # ── Save to user profile ────────────────────────────────────────
        resume_embedding = generate_embedding(text)
        update_user_resume(clerk_id, resume_url, resume_public_id, skills)

        # Store vector in Qdrant for similarity search
        upsert_resume_vector(clerk_id, resume_embedding)

        return jsonify({
            "status": "success",
            "resume_url": resume_url,
            "skills": skills,
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    finally:
        if os.path.exists(filepath):
            os.remove(filepath)


# ── Text-to-Speech ───────────────────────────────────────────────────────────
@app.route("/api/tts/speak", methods=["POST", "OPTIONS"])
def tts_speak():
    """POST {"text": "..."} → streams a WAV audio file."""
    if request.method == "OPTIONS":
        return "", 204

    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400

    try:
        wav_bytes = generate_speech_bytes(text)
        return Response(
            wav_bytes,
            mimetype="audio/mpeg",
            headers={
                "Cache-Control": "no-store",
                "Access-Control-Allow-Origin": "*",
            },
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── OpenRouter Generate Questions ────────────────────────────────────────────
@app.route('/api/ask', methods=['POST', 'OPTIONS'])
@require_auth
def ask_gemma():
    if request.method == 'OPTIONS':
        return "", 204

    data = request.get_json(silent=True) or {}
    raw_job_id = data.get('job_id')
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

    job_id = unquote(raw_job_id) if raw_job_id else None

    if not job_id:
        return jsonify({"error": "job_id is required"}), 400

    # 1. Fetch User Profile & Skills
    clerk_id = g.user.get("sub")
    user = get_user_by_clerk_id(clerk_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    skills = user.get("skills", [])
    resume_context = f"Candidate Skills: {', '.join(skills)}"

    # 2. Fetch Job Description from DB
    jobs_col = get_db()["jobs"]
    job_doc = jobs_col.find_one({"job_id": job_id})

    if not job_doc:
        try:
            job_doc = jobs_col.find_one({"_id": ObjectId(job_id)})
        except InvalidId:
            pass

    if not job_doc:
        return jsonify({"error": "Job not found"}), 404

    jd = job_doc.get("description", "")
    job_title = job_doc.get("title", "this role")

    # 3. Construct Prompt
    prompt = f"""Analyze this candidate's profile against the Job Description and generate exactly 5 relevant interview questions for the role of {job_title}.
Return the output strictly as a JSON array of strings, with no markdown formatting and no extra text.
Example format:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]

Job Description:
{jd}

Candidate Profile:
{resume_context}"""

    if not OPENROUTER_API_KEY:
        return jsonify({"error": "OPENROUTER_API_KEY not configured"}), 500

    # Gemma: merge system instruction into user turn (no system role support)
    messages = [
        {
            "role": "user",
            "content": f"""You are an expert HR recruiter. Only output a valid JSON array of strings.\n\n{prompt}"""
        }
    ]

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "google/gemma-3-4b-it:free",
                "messages": messages
            }),
            timeout=30
        )

        if response.status_code == 429:
            return jsonify({"error": "rate_limited", "message": "AI model is temporarily rate-limited."}), 503

        if response.status_code != 200:
            return jsonify({"error": "API Error"}), 500

        content = response.json()['choices'][0]['message']['content'].strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        questions = json.loads(content)
        if not isinstance(questions, list) or len(questions) == 0:
            raise ValueError("AI did not return a valid list")

        return jsonify({"questions": questions[:10]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
