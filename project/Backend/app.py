import os

from flask import Flask, jsonify, g, request
from flask_cors import CORS
from dotenv import load_dotenv

from auth import require_auth
from database import get_db
from models.user import upsert_user, get_user_by_clerk_id, update_user_profile, ensure_indexes

load_dotenv()

app = Flask(__name__)

# Allow requests from the Next.js frontend
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Create MongoDB indexes on startup
with app.app_context():
    ensure_indexes()


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


if __name__ == "__main__":
    app.run(debug=True)
