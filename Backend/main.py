from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from ai_client import call_ai
from ai_config import ROLE

import os
import re
import io
from docx import Document
from pypdf import PdfReader

# 🔥 BEWEIS: Datei wird geladen
print("🔥 MAIN.PY GELADEN")

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========= MODELS =========

class SummaryInput(BaseModel):
    text: str
    focus: str | None = None

class EmailReplyInput(BaseModel):
    original_email: str
    keywords: str
    style: str

# ========= TEXT ZUSAMMENFASSEN =========

@app.post("/summarize")
def summarize(input: SummaryInput):
    print("📥 /summarize AUFGERUFEN")

    focus_block = ""
    technical_rules = ""

    if input.focus and input.focus.strip():
        focus_block = f"""
BENUTZER-VORGABEN (STRIKT):
{input.focus}
"""

        match = re.search(r'(\d+)\s*satz', input.focus.lower())
        if match:
            max_sentences = match.group(1)
            technical_rules += f"""
TECHNISCHE REGEL:
Maximal {max_sentences} vollständige Sätze.
"""

        if "bullet" in input.focus.lower() or "stichpunkt" in input.focus.lower():
            technical_rules += """
FORMAT-REGEL:
Nur Bulletpoints.
"""

    prompt = f"""
Du bist ein sachlicher, präziser Büroassistent.

AUFGABE:
Fasse den folgenden Text zusammen.

{focus_block}
{technical_rules}

TEXT:
{input.text}
""".strip()

    try:
        print("🤖 OpenAI REQUEST (TEXT)")
        result = call_ai(ROLE, prompt)
        print("✅ OpenAI RESPONSE ERHALTEN")
        return {"result": result}
    except Exception as e:
        print("❌ FEHLER summarize:", e)
        return {"result": "❌ Fehler bei der Text-Zusammenfassung."}

# ========= DATEI ZUSAMMENFASSEN =========

@app.post("/summarize-file")
async def summarize_file(
    file: UploadFile = File(...),
    focus: str = Form("")
):
    print("📥 /summarize-file AUFGERUFEN")

    filename = file.filename.lower()
    contents = await file.read()
    text = ""

    try:
        if filename.endswith(".docx"):
            doc = Document(io.BytesIO(contents))
            text = "\n".join(p.text for p in doc.paragraphs)

        elif filename.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(contents))
            pages = [p.extract_text() for p in reader.pages if p.extract_text()]
            text = "\n".join(pages)

        else:
            return {"result": "❌ Dateityp nicht unterstützt."}

        if not text.strip():
            return {"result": "❌ Datei enthält keinen lesbaren Text."}

        focus_block = ""
        technical_rules = ""

        if focus.strip():
            focus_block = f"\nBENUTZER-VORGABEN:\n{focus}"

            match = re.search(r'(\d+)\s*satz', focus.lower())
            if match:
                technical_rules += f"\nMaximal {match.group(1)} Sätze."

            if "bullet" in focus.lower() or "stichpunkt" in focus.lower():
                technical_rules += "\nNur Bulletpoints."

        prompt = f"""
Du bist ein sachlicher, präziser Büroassistent.

AUFGABE:
Fasse den folgenden Text zusammen.
{focus_block}
{technical_rules}

TEXT:
{text}
""".strip()

        print("🤖 OpenAI REQUEST (DATEI)")
        result = call_ai(ROLE, prompt)
        print("✅ OpenAI RESPONSE ERHALTEN")

        return {"result": result}

    except Exception as e:
        print("❌ FEHLER summarize-file:", e)
        return {"result": "❌ Fehler bei der Datei-Zusammenfassung."}

# ========= EMAIL =========

@app.post("/email-reply")
def email_reply(input: EmailReplyInput):
    print("📥 /email-reply AUFGERUFEN")

    prompt = f"""
Du sollst eine professionelle E-Mail-Antwort verfassen.

STIL:
{input.style}

STICHWORTE:
{input.keywords}

ORIGINAL-E-MAIL:
{input.original_email}
""".strip()

    try:
        print("🤖 OpenAI REQUEST (EMAIL)")
        result = call_ai(ROLE, prompt)
        print("✅ OpenAI RESPONSE ERHALTEN")
        return {"result": result}
    except Exception as e:
        print("❌ FEHLER email:", e)
        return {"result": "❌ Fehler bei der E-Mail-Erstellung."}

# ========= START =========
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000))
    )