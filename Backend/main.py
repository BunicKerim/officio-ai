from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from ai_client import call_ai
from ai_config import ROLE

import os

app = FastAPI(title="Officio AI")

# ================= ROOT / HEALTH CHECK =================

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Officio AI"
    }

# ========= CORS =========
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # für MVP ok
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========= MODELS =========

class SummaryInput(BaseModel):
    text: str

class EmailReplyInput(BaseModel):
    original_email: str
    keywords: str
    style: str

# ========= ENDPOINTS =========

@app.post("/summarize")
def summarize(input: SummaryInput):
    prompt = f"""
Du bist ein sachlicher Büroassistent.

AUFGABE:
Fasse den folgenden Text sachlich zusammen.

FORMAT:
Klarer Fließtext ohne Zusatzinformationen.

TEXT:
{input.text}
""".strip()

    result = call_ai(ROLE, prompt)
    return {"result": result}


@app.post("/email-reply")
def email_reply(input: EmailReplyInput):
    prompt = f"""
Du sollst eine professionelle E-Mail-Antwort verfassen.

STIL:
{input.style}

STICHWORTE / HINWEISE:
{input.keywords}

ORIGINAL-E-MAIL:
{input.original_email}

Erstelle eine vollständige, gut formulierte Antwort in ganzen Sätzen.
Formatiere die E-Mail korrekt mit Anrede, Hauptteil und Grußformel.
Nutze Absätze für bessere Lesbarkeit.
""".strip()

    result = call_ai(ROLE, prompt)
    return {"result": result}


# ========= LOCAL / CLOUD START =========
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000))
    )
