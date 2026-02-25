"""
Embedding utility – generates text embeddings using SentenceTransformers.
The model is loaded lazily on first call and cached for subsequent use.
"""

from sentence_transformers import SentenceTransformer

_model = None


def _get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("✓ SentenceTransformer loaded")
    return _model


def generate_embedding(text: str) -> list[float]:
    """Generate a 384-dimensional embedding vector from the given text."""
    return _get_model().encode(text).tolist()
