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
        print("Qrant url ", url)

        api_key = os.getenv("QDRANT_API_KEY")
        print("Qrant url ", api_key)

        if not url:
            raise RuntimeError("QDRANT_URL is not set in .env")
        _client = QdrantClient(url=url, api_key=api_key)
        print("Qdrant connected")
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
            print(f"Created Qdrant collection: {name}")


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


def get_resume_embedding(clerk_id: str) -> list[float] | None:
    """Retrieve a user's resume embedding from Qdrant. Returns None if not found."""
    client = get_qdrant()
    point_id = _stable_int_id(clerk_id)
    try:
        points = client.retrieve(
            collection_name="resumes",
            ids=[point_id],
            with_vectors=True,
        )
        if points:
            return points[0].vector
    except Exception:
        pass
    return None


def flush_all_jobs():
    """Delete ALL points from the jobs collection (used before a fresh fetch)."""
    client = get_qdrant()
    # Recreate the collection to clear all points efficiently
    if client.collection_exists("jobs"):
        client.delete_collection("jobs")
    client.create_collection(
        collection_name="jobs",
        vectors_config=VectorParams(
            size=EMBEDDING_DIM,
            distance=Distance.COSINE,
        ),
    )
    print("Flushed Qdrant 'jobs' collection")


def search_similar_jobs(embedding: list[float], limit: int = 10):
    """Find jobs most similar to the given embedding vector.
    
    Always searches from offset=0. Pagination is handled in the caller
    by slicing the returned list, which avoids Qdrant's offset-capping issue.
    """
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
