"""
Job Fetcher – pulls job listings from the JSearch API,
generates embeddings, stores vectors in Qdrant and metadata in MongoDB.
"""

import os
import requests
from database import get_db
from utils.embedding import generate_embedding
from utils.qdrant_store import upsert_job_vector, ensure_collections

JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY", "")
JSEARCH_URL = "https://jsearch.p.rapidapi.com/search"

COLLECTION = "jobs"


def _collection():
    return get_db()[COLLECTION]


def fetch_jobs(query: str = "software engineer india", page: int = 1):
    """Fetch jobs from JSearch API, embed descriptions, and store in MongoDB.

    Args:
        query: Search query string (e.g. "react developer india")
        page: Page number for pagination

    Returns:
        Number of jobs upserted.
    """
    if not JSEARCH_API_KEY:
        raise RuntimeError("JSEARCH_API_KEY is not set in .env")

    response = requests.get(
        JSEARCH_URL,
        headers={"X-RapidAPI-Key": JSEARCH_API_KEY},
        params={"query": query, "page": str(page)},
    )
    response.raise_for_status()

    jobs = response.json().get("data", [])
    col = _collection()
    count = 0

    for job in jobs:
        description = job.get("job_description", "")
        job_id = job["job_id"]

        # Store metadata in MongoDB
        col.update_one(
            {"job_id": job_id},
            {"$set": {
                "title": job.get("job_title", ""),
                "company": job.get("employer_name", ""),
                "location": job.get("job_city", ""),
                "country": job.get("job_country", ""),
                "description": description,
                "apply_link": job.get("job_apply_link", ""),
                "employment_type": job.get("job_employment_type", ""),
                "posted_at": job.get("job_posted_at_datetime_utc", ""),
            }},
            upsert=True,
        )

        # Store embedding in Qdrant
        if description:
            embedding = generate_embedding(description)
            upsert_job_vector(job_id, embedding, title=job.get("job_title", ""))

        count += 1

    print(f"✓ Upserted {count} jobs for query '{query}'")
    return count


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    ensure_collections()
    fetch_jobs()
