import logging
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.ollama_service import generate_questions
from app.models.question_model import QuestionItem

app = FastAPI(title='Ollama Question Generator', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Request / Response Models
class SkillRequest(BaseModel):
    skills: List[str]
    count: int = 5

class GenerateResponse(BaseModel):
    skills: List[str]
    questions: List[QuestionItem]

@app.get('/health')
async def health():
    return {'status': 'ok'}

@app.post('/generate-questions', response_model=GenerateResponse)
async def generate_questions_post(req: SkillRequest):
    try:
        skill_prompt = ', '.join(req.skills)
        items = await generate_questions(skills=skill_prompt, count=req.count)
    except Exception as e:
        logger.exception('Error generating questions')
        raise HTTPException(status_code=500, detail=str(e))

    return {'skills': req.skills, 'questions': items}
