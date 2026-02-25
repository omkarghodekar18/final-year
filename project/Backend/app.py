import os
import uuid
from utils.nlp import get_skill_extractor
from flask import Flask, jsonify, g, request
from flask_cors import CORS
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
from pdfminer.high_level import extract_text

from auth import require_auth
from models.user import (
    upsert_user, get_user_by_clerk_id, update_user_profile,
    ensure_indexes, update_user_resume, get_user_resume_public_id,
)
from utils.embedding import generate_embedding
from utils.qdrant_store import upsert_resume_vector, ensure_collections

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
    except Exception as e:
        print(f"⚠ MongoDB index creation failed (is MongoDB reachable?): {e}")
    try:
        ensure_collections()
    except Exception as e:
        print(f"⚠ Qdrant collection setup failed (is Qdrant reachable?): {e}")


@app.route("/", methods=["GET"])
def hello_world():
    return {"message": "Hello, World!"}


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
            except Exception as e:
                print(f"Warning: could not delete old resume: {e}")

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
        print(f"Resume parse error: {e}")
        return jsonify({
            "status": "error",
            "message": str(e),
        }), 500

    finally:
        if os.path.exists(filepath):
            os.remove(filepath)


if __name__ == "__main__":
    app.run(debug=True)
