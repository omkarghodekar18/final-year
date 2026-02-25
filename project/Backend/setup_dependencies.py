"""
Setup NLP dependencies required by the resume parser.
Run this once after `pip install -r requirements.txt`:
    python setup_dependencies.py
"""

import spacy
from spacy.cli import download

SPACY_MODEL = "en_core_web_lg"

print(f"Checking SpaCy model '{SPACY_MODEL}'...")

try:
    spacy.load(SPACY_MODEL)
    print(f"'{SPACY_MODEL}' already installed")
except OSError:
    print(f"Downloading '{SPACY_MODEL}' (this may take a few minutes)...")
    download(SPACY_MODEL)
    print(f"'{SPACY_MODEL}' installed successfully")

print("\nAll NLP dependencies ready!")