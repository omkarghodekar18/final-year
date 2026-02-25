"""
Qdrant vector database client – manages collections and vector operations.
"""

import os
import hashlib
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 output size

_client = None


def get_qdrant() -> QdrantClient:
    """Return a singleton Qdrant client."""
    global _client
    if _client is None:
        url = os.getenv("QDRANT_URL")
        api_key = os.getenv("QDRANT_API_KEY")
        if not url:
            raise RuntimeError("QDRANT_URL is not set in .env")
        _client = QdrantClient(url=url, api_key=api_key)
        print("✓ Qdrant connected")
    return _client


def ensure_collections():
    """Create Qdrant collections if they don't already exist."""
    client = get_qdrant()

    for name in ("resumes", "jobs"):
        if not client.collection_exists(name):
            client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(
                    size=EMBEDDING_DIM,
                    distance=Distance.COSINE,
                ),
            )
            print(f"  Created Qdrant collection: {name}")


def upsert_resume_vector(clerk_id: str, embedding: list[float]):
    """Store or update a user's resume embedding in Qdrant."""
    client = get_qdrant()
    client.upsert(
        collection_name="resumes",
        points=[
            PointStruct(
                id=_stable_int_id(clerk_id),
                vector=embedding,
                payload={"clerk_id": clerk_id},
            )
        ],
    )


def upsert_job_vector(job_id: str, embedding: list[float], title: str = ""):
    """Store or update a job's embedding in Qdrant."""
    client = get_qdrant()
    client.upsert(
        collection_name="jobs",
        points=[
            PointStruct(
                id=_stable_int_id(job_id),
                vector=embedding,
                payload={"job_id": job_id, "title": title},
            )
        ],
    )


def search_similar_jobs(embedding: list[float], limit: int = 10):
    """Find jobs most similar to the given embedding vector."""
    client = get_qdrant()
    results = client.query_points(
        collection_name="jobs",
        query=embedding,
        limit=limit,
    )
    return results.points


def _stable_int_id(string_id: str) -> int:
    """Convert a string ID to a stable positive integer for Qdrant point IDs."""
    return int(hashlib.sha256(string_id.encode()).hexdigest()[:15], 16)
