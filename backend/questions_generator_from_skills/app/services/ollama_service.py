import json
import subprocess
from typing import List
from app.models.question_model import QuestionItem

async def generate_questions(skills: str, count: int = 5) -> List[QuestionItem]:
    """
    Calls Ollama CLI locally to generate skill-based questions.
    """
    # Prompt for LLM
    prompt = f"Generate {count} multiple-choice interview questions for skills: {skills}. Return as JSON array with fields: question, options, answer."

    # Call Ollama CLI
    try:
        result = subprocess.run(
            ["ollama", "run", "mistral", "--prompt", prompt, "--json"],
            capture_output=True,
            text=True,
            check=True
        )
    except subprocess.CalledProcessError as e:
        raise Exception(f"Ollama call failed: {e.stderr}")

    try:
        questions_json = json.loads(result.stdout)
    except json.JSONDecodeError:
        raise Exception(f"Failed to parse Ollama output: {result.stdout}")

    # Convert to QuestionItem objects
    items = [QuestionItem(**q) for q in questions_json]
    return items
