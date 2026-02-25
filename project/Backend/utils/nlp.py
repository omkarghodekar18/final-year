import spacy
from spacy.matcher import PhraseMatcher

nlp = None
skill_extractor = None


def get_skill_extractor():
    global nlp, skill_extractor

    if skill_extractor is not None:
        return skill_extractor

    SPACY_MODEL = "en_core_web_lg"

    try:
        nlp = spacy.load(SPACY_MODEL)

        from skillNer.general_params import SKILL_DB
        from skillNer.skill_extractor_class import SkillExtractor

        skill_extractor = SkillExtractor(nlp, SKILL_DB, PhraseMatcher)
        print("✓ SkillNer initialized")
    except OSError:
        print(f"⚠ SpaCy model '{SPACY_MODEL}' not found. Run setup_dependencies.py first.")
        return None

    return skill_extractor