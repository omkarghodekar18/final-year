from fastapi import FastAPI, Request
import requests

app = FastAPI()

OLLAMA_API_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "llama3.1"  # or "mistral", "phi3", etc. (make sure it's downloaded via `ollama pull`)

@app.post("/generate-questions/")
async def generate_questions(request: Request):
    data = await request.json()
    skills = data.get("skills", [])

    if not skills:
        return {"error": "No skills provided"}

    prompt = f"Generate 5 interview questions for these skills: {', '.join(skills)}"

    payload = {"model": MODEL, "prompt": prompt}
    response = requests.post(OLLAMA_API_URL, json=payload, stream=True)

    if response.status_code != 200:
        return {"error": f"Ollama server error: {response.text}"}

    output = ""
    for line in response.iter_lines():
        if line:
            try:
                json_line = line.decode("utf-8")
                if "response" in json_line:
                    output += json_line
            except:
                continue

    return {"questions": output}
