import os
from pymongo import MongoClient

_client = None
_db = None


def get_db():
    """Return the MongoDB database instance, creating the connection lazily."""
    global _client, _db
    if _db is None:
        uri = os.getenv("MONGODB_URI")
        db_name = os.getenv("MONGODB_DB_NAME", "skillsbridge")
        if not uri:
            raise RuntimeError("MONGODB_URI is not set in .env")
        _client = MongoClient(uri)
        _db = _client[db_name]
    return _db
