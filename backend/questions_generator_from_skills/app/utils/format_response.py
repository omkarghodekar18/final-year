# Helpers to sanitize/normalize model output
import json
from typing import Any

def safe_parse_json(text: str) -> Any:
    """Try to parse JSON-like text that the model returns. Return parsed object or raise ValueError."""
    text = text.strip()

    # If code block is present, strip it
    if text.startswith('```'):
        parts = text.split('```')
        if len(parts) >= 2:
            text = parts[1].strip()

    # Extract first JSON-like section
    first_idx = None
    for i, c in enumerate(text):
        if c in ('{', '['):
            first_idx = i
            break
    if first_idx is not None:
        candidate = text[first_idx:]
    else:
        candidate = text

    try:
        return json.loads(candidate)
    except Exception as e:
        try:
            candidate2 = candidate.replace("'", '"')
            return json.loads(candidate2)
        except Exception:
            raise ValueError('Could not parse model output as JSON: ' + str(e))
