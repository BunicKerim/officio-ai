import os
from dotenv import load_dotenv

from pathlib import Path
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")
API_KEY = os.getenv("OPENAI_API_KEY")


from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .ai_client import call_ai
from .ai_config import ROLE

import re
from datetime import datetime
import io
import tempfile
import os

from docx import Document
from pypdf import PdfReader

# ===============================
# SWISS DATE CONVERTER
# ===============================

def convert_to_swiss_date(text: str) -> str:
    """
    Konvertiert englische Datumsformate automatisch in Schweizer Format (DD.MM.YYYY)
    """

    patterns = [
        r"(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})",
        r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})"
    ]

    months = {
        "January":1,"February":2,"March":3,"April":4,"May":5,"June":6,
        "July":7,"August":8,"September":9,"October":10,"November":11,"December":12
    }

    for pattern in patterns:
        matches = re.findall(pattern, text)
        for match in matches:

            if match[0].isdigit():
                day = int(match[0])
                month = months[match[1]]
                year = int(match[2])
            else:
                month = months[match[0]]
                day = int(match[1])
                year = int(match[2])

            swiss = f"{day:02d}.{month:02d}.{year}"
            text = text.replace(" ".join(match), swiss)

    return text


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
        ...
        return ...

    # ---------- EML ----------
    if filename.endswith(".eml"):
        import email
        from bs4 import BeautifulSoup

        raw_bytes = await file.read()
        msg = email.message_from_bytes(raw_bytes)

        body = ""

        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                if content_type == "text/plain":
                    body += part.get_payload(decode=True).decode(errors="ignore")
                elif content_type == "text/html":
                    html = part.get_payload(decode=True).decode(errors="ignore")
                    soup = BeautifulSoup(html, "html.parser")
                    body += soup.get_text()
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                body += payload.decode(errors="ignore")

        return body.strip()

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
        result = convert_to_swiss_date(result)
        result = result.replace("ß", "ss")
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
        result = convert_to_swiss_date(result)
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
Du bist ein professioneller Büroassistent.

AUFGABE:
Erstelle eine vollständige, sendefertige E-Mail-Antwort.

WICHTIGE FORMATIERUNGSREGELN:
- Beginne mit einer passenden Anrede (z.B. "Sehr geehrte Frau Müller," oder "Hallo Herr Meier,")
- Schreibe in klar strukturierten Absätzen (keine Textwand)
- Jeder Gedankengang eigener Absatz
- Verwende eine passende Grußformel (z.B. "Freundliche Grüsse" oder "Beste Grüsse")
- KEINE Erklärung, KEIN Meta-Kommentar
- Nur die fertige E-Mail ausgeben

STIL:
{input.style}

STICHWORTE:
{input.keywords}

ORIGINAL-E-MAIL:
{input.original_email}
""".strip()

    try:
        result = call_ai(ROLE, prompt)
        result = convert_to_swiss_date(result)
        result = result.replace("ß", "ss")
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

    # ---------- Datei lesen ----------
    try:
        text = await extract_text_from_file(file)
    except Exception as e:
        print("❌ Datei-Extraktion fehlgeschlagen:", repr(e))
        raise HTTPException(
            status_code=400,
            detail="E-Mail-Datei konnte nicht gelesen werden"
        )

    if not text or not text.strip():
        raise HTTPException(
            status_code=400,
            detail="E-Mail-Datei enthält keinen lesbaren Inhalt"
        )

    # ---------- Sicherheits-Limit (Render / OpenAI safe) ----------
    MAX_CHARS = 12000
    if len(text) > MAX_CHARS:
        print(f"⚠️ E-Mail Text gekürzt: {len(text)} → {MAX_CHARS}")
        text = text[:MAX_CHARS]

    # ---------- Prompt ----------
    prompt = f"""
Du bist ein professioneller Büroassistent.

AUFGABE:
Analysiere die folgende E-Mail und verfasse eine passende Antwort.

WICHTIG:
- Die Antwort MUSS sich konkret auf den Inhalt der E-Mail beziehen
- Keine Zusammenfassung der Original-Mail
- Schreibe eine vollständige, sendefertige Antwort
- Kein Meta-Kommentar, kein Hinweis auf Analyse
- Natürlicher, menschlicher Ton
- Verwende ausschliessliche Schweizer Datumsformate (z.B. 24.12.2024)
- verwende ausschliesslich Schweizer Rechtsschreibung (z.B. "Grüsse" statt "Grüße")

STIL:
{style}

STICHWORTE / VORGABEN:
{keywords or "Keine"}

ORIGINAL-E-MAIL (aus Datei):
{text}
""".strip()

    # ---------- KI ----------
    try:
        result = call_ai(ROLE, prompt)
        result = convert_to_swiss_date(result)
        result = result.replace("ß", "ss")
        return {"result": result}

    except Exception as e:
        print("❌ email-reply-file OpenAI Fehler:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="KI-E-Mail-Antwort konnte nicht erstellt werden"
        )


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
        result = convert_to_swiss_date(result)
        result = result.replace("ß", "ss")
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
        result = convert_to_swiss_date(result)
        result = result.replace("ß", "ss")
        return {"result": result}
    except Exception as e:
        print("❌ translate-file:", e)
        return {"result": "❌ Fehler bei der Datei-Übersetzung."}