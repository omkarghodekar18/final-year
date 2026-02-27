import sys, os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

import os
from qdrant_client import QdrantClient
from pymongo import MongoClient

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
MONGO_URI = os.getenv("MONGODB_URI")
MONGO_DB = os.getenv("MONGODB_DB_NAME", "skillsbridge")

print("=== Qdrant Diagnostics ===")
print(f"QDRANT_URL: {QDRANT_URL}")

try:
    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    print("Qdrant client created OK")

    collections = client.get_collections()
    print(f"Collections: {[c.name for c in collections.collections]}")

    for col_name in ["jobs", "resumes"]:
        try:
            info = client.get_collection(col_name)
            print(f"  '{col_name}' -> points_count={info.points_count}, vectors_count={info.vectors_count}")
        except Exception as e:
            print(f"  '{col_name}' -> ERROR: {e}")
except Exception as e:
    print(f"Qdrant connection FAILED: {e}")

print()
print("=== MongoDB Diagnostics ===")
try:
    mongo = MongoClient(MONGO_URI)
    db = mongo[MONGO_DB]
    jobs_count = db["jobs"].count_documents({})
    resumes_count = db["users"].count_documents({"resume_url": {"$exists": True}})
    print(f"MongoDB jobs collection count: {jobs_count}")
    print(f"MongoDB users with resume: {resumes_count}")
    # Show sample job
    sample = db["jobs"].find_one({})
    if sample:
        print(f"Sample job: job_id={sample.get('job_id')}, title={sample.get('title')}, desc_len={len(sample.get('description',''))}")
    else:
        print("No jobs in MongoDB!")
except Exception as e:
    print(f"MongoDB connection FAILED: {e}")
