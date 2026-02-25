import os
import functools

import requests
import jwt
from flask import request, jsonify, g


# ── Fetch Clerk JWKS public keys ────────────────────────────────────────────

_jwks_client = None


def _get_jwks_client():
    """Lazily create and cache the PyJWKClient."""
    global _jwks_client
    if _jwks_client is None:
        jwks_url = os.getenv("CLERK_JWKS_URL")
        if not jwks_url:
            raise RuntimeError("CLERK_JWKS_URL is not set in .env")
        _jwks_client = jwt.PyJWKClient(jwks_url)
    return _jwks_client


# ── Decorator ────────────────────────────────────────────────────────────────

def require_auth(f):
    """Decorator that verifies a Clerk-issued JWT Bearer token.

    On success it sets ``g.user`` to the decoded token payload.
    On failure it returns a 401 JSON response.
    """

    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        token = auth_header.split(" ", 1)[1]

        try:
            signing_key = _get_jwks_client().get_signing_key_from_jwt(token)

            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                issuer=os.getenv("CLERK_ISSUER"),
                options={"require": ["exp", "iss", "sub"]},
            )

            g.user = payload

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidIssuerError:
            return jsonify({"error": "Invalid token issuer"}), 401
        except jwt.PyJWTError as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401
        except Exception as e:
            return jsonify({"error": f"Authentication failed: {str(e)}"}), 401

        return f(*args, **kwargs)

    return decorated
