from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_client import call_ai
from ai_config import ROLE

import re
import io
import tempfile
import os

from docx import Document
from pypdf import PdfReader

# 🔥 DEBUG
print("🔥 MAIN.PY GELADEN")

app = FastAPI(title="Officio AI")

# ================= ROOT / HEALTH =================

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Officio AI"
    }

# ================= CORS =================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= MODELS =================

class SummaryInput(BaseModel):
    text: str
    focus: str | None = None

class EmailReplyInput(BaseModel):
    original_email: str
    keywords: str
    style: str

class TranslateInput(BaseModel):
    text: str
    target_lang: str
    style: str
    context: str | None = None

# =================================================
# UNIVERSAL FILE TEXT EXTRACTION
# =================================================

async def extract_text_from_file(file: UploadFile) -> str:
    filename = file.filename.lower()

    # ---------- MSG ----------
    if filename.endswith(".msg"):
        import extract_msg

        with tempfile.NamedTemporaryFile(delete=False, suffix=".msg") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        try:
            msg = extract_msg.Message(tmp_path)
            return f"""
From: {msg.sender}
To: {msg.to}
Subject: {msg.subject}

{msg.body}
""".strip()
        finally:
            os.unlink(tmp_path)

    # ---------- PDF ----------
    if filename.endswith(".pdf"):
        reader = PdfReader(file.file)
        return "\n".join(
            page.extract_text() or "" for page in reader.pages
        )

    # ---------- DOCX ----------
    if filename.endswith(".docx"):
        doc = Document(file.file)
        return "\n".join(p.text for p in doc.paragraphs)

    # ---------- TXT ----------
    if filename.endswith(".txt"):
        return (await file.read()).decode("utf-8", errors="ignore")

    raise HTTPException(status_code=400, detail="Dateiformat nicht unterstützt")

# ================= TEXT SUMMARY =================

@app.post("/summarize")
def summarize(input: SummaryInput):
    print("📥 /summarize")

    focus_block = ""
    rules = ""

    if input.focus:
        focus_block = f"\nBENUTZER-VORGABEN:\n{input.focus}"

        match = re.search(r"(\d+)\s*satz", input.focus.lower())
        if match:
            rules += f"\nMaximal {match.group(1)} vollständige Sätze."

        if "bullet" in input.focus.lower() or "stichpunkt" in input.focus.lower():
            rules += "\nNur Bulletpoints."

    prompt = f"""
Du bist ein sachlicher, präziser Büroassistent.

AUFGABE:
Fasse den folgenden Text zusammen.
{focus_block}
{rules}

TEXT:
{input.text}
""".strip()

    try:
        result = call_ai(ROLE, prompt)
        return {"result": result}
    except Exception as e:
        print("❌ summarize:", e)
        return {"result": "❌ Fehler bei der Text-Zusammenfassung."}

# ================= FILE SUMMARY =================

@app.post("/summarize-file")
async def summarize_file(
    file: UploadFile = File(...),
    focus: str = Form("")
):
    print("📥 /summarize-file")

    try:
        text = await extract_text_from_file(file)
    except Exception as e:
        print("❌ Datei-Extraktion fehlgeschlagen:", repr(e))
        raise HTTPException(status_code=400, detail="Datei konnte nicht gelesen werden")

    if not text or not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Datei enthält keinen lesbaren Text"
        )

    # 🔒 HARTES LIMIT – extrem wichtig für Stabilität
    MAX_CHARS = 12000
    if len(text) > MAX_CHARS:
        print(f"⚠️ Text gekürzt: {len(text)} → {MAX_CHARS}")
        text = text[:MAX_CHARS]

    prompt = f"""
Du bist ein sachlicher, präziser Büroassistent.

AUFGABE:
Fasse den folgenden Text zusammen.

BENUTZER-VORGABEN:
{focus or "Keine"}

TEXT:
{text}
""".strip()

    try:
        result = call_ai(ROLE, prompt)
        return {"result": result}

    except Exception as e:
        print("❌ summarize-file OPENAI ERROR:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="KI-Zusammenfassung fehlgeschlagen"
        )


# ================= EMAIL (TEXT) =================

@app.post("/email-reply")
def email_reply(input: EmailReplyInput):
    print("📥 /email-reply")

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
        result = call_ai(ROLE, prompt)
        return {"result": result}
    except Exception as e:
        print("❌ email:", e)
        return {"result": "❌ Fehler bei der E-Mail-Erstellung."}

# ================= EMAIL (FILE-FIRST) =================

@app.post("/email-reply-file")
async def email_reply_file(
    file: UploadFile = File(...),
    keywords: str = Form(""),
    style: str = Form("neutral")
):
    print("📥 /email-reply-file")

    text = await extract_text_from_file(file)

    if not text.strip():
        raise HTTPException(status_code=400, detail="E-Mail-Datei enthält keinen Text")

    prompt = f"""
Du sollst eine professionelle E-Mail-Antwort verfassen.

STIL:
{style}

STICHWORTE:
{keywords or "Keine"}

ORIGINAL-E-MAIL (aus Datei):
{text}
""".strip()

    try:
        result = call_ai(ROLE, prompt)
        return {"result": result}
    except Exception as e:
        print("❌ email-file:", e)
        return {"result": "❌ Fehler bei der E-Mail-Erstellung."}

# ================= SMART TRANSLATE (TEXT) =================

@app.post("/translate")
def translate(input: TranslateInput):
    print("📥 /translate")

    prompt = f"""
Du bist ein professioneller Übersetzer für Büro- und Geschäftstexte.

AUFGABE:
Übersetze den folgenden Text nach {input.target_lang}

STIL:
{input.style}

KONTEXT:
{input.context or "Kein zusätzlicher Kontext"}

TEXT:
{input.text}
""".strip()

    try:
        result = call_ai(ROLE, prompt)
        return {"result": result}
    except Exception as e:
        print("❌ translate:", e)
        return {"result": "❌ Fehler bei der Übersetzung."}

# ================= SMART TRANSLATE (FILE-FIRST) =================

@app.post("/translate-file")
async def translate_file(
    file: UploadFile = File(...),
    target_lang: str = Form("DE"),
    style: str = Form("neutral"),
    context: str = Form("")
):
    print("📥 /translate-file")

    text = await extract_text_from_file(file)

    if not text.strip():
        raise HTTPException(status_code=400, detail="Datei enthält keinen Text")

    prompt = f"""
Du bist ein professioneller Übersetzer.

AUFGABE:
Übersetze den folgenden Text nach {target_lang}

STIL:
{style}

KONTEXT:
{context or "Kein zusätzlicher Kontext"}

TEXT:
{text}
""".strip()

    try:
        result = call_ai(ROLE, prompt)
        return {"result": result}
    except Exception as e:
        print("❌ translate-file:", e)
        return {"result": "❌ Fehler bei der Datei-Übersetzung."}
