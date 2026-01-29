from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_client import call_ai
from ai_config import ROLE

import re
import io
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

    contents = await file.read()
    filename = file.filename.lower()
    text = ""

    try:
        if filename.endswith(".docx"):
            doc = Document(io.BytesIO(contents))
            text = "\n".join(p.text for p in doc.paragraphs)

        elif filename.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(contents))
            text = "\n".join(
                p.extract_text() for p in reader.pages if p.extract_text()
            )

        else:
            return {"result": "❌ Dateityp nicht unterstützt."}

        if not text.strip():
            return {"result": "❌ Datei enthält keinen lesbaren Text."}

        focus_block = f"\nBENUTZER-VORGABEN:\n{focus}" if focus else ""

        prompt = f"""
Du bist ein sachlicher, präziser Büroassistent.

AUFGABE:
Fasse den folgenden Text zusammen.
{focus_block}

TEXT:
{text}
""".strip()

        result = call_ai(ROLE, prompt)
        return {"result": result}

    except Exception as e:
        print("❌ summarize-file:", e)
        return {"result": "❌ Fehler bei der Datei-Zusammenfassung."}

# ================= EMAIL =================

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

# ================= SMART TRANSLATE =================

@app.post("/translate")
def translate(input: TranslateInput):
    print("📥 /translate")

    prompt = f"""
Du bist ein professioneller Übersetzer für Büro- und Geschäftstexte.

AUFGABE:
Übersetze den folgenden Text vollständig und korrekt in folgende Sprache:
{input.target_lang}

STIL:
{input.style}

KONTEXT:
{input.context or "Kein zusätzlicher Kontext"}

WICHTIG:
- Ausgangssprache automatisch erkennen
- Keine Erklärungen
- Keine Kommentare
- Nur den übersetzten Text zurückgeben

TEXT:
{input.text}
""".strip()

    try:
        result = call_ai(ROLE, prompt)
        return {"result": result}
    except Exception as e:
        print("❌ translate:", e)
        return {"result": "❌ Fehler bei der Übersetzung."}

# ================= EMAIL FILE REPLY (APPEND-ONLY) =================

@app.post("/email-reply-file")
async def email_reply_file(
    file: UploadFile = File(...),
    keywords: str = Form(""),
    style: str = Form("neutral")
):
    print("📥 /email-reply-file")

    contents = await file.read()
    filename = file.filename.lower()
    text = ""

    try:
        # ---------- OUTLOOK .MSG ----------
        if filename.endswith(".msg"):
            import extract_msg
            msg = extract_msg.Message(io.BytesIO(contents))
            msg.process()
            text = msg.body or ""

        # ---------- .EML ----------
        elif filename.endswith(".eml"):
            from email import policy
            from email.parser import BytesParser
            msg = BytesParser(policy=policy.default).parsebytes(contents)
            body = msg.get_body(preferencelist=("plain", "html"))
            if body:
                text = body.get_content()

        # ---------- HTML MAIL ----------
        elif filename.endswith(".html") or filename.endswith(".htm"):
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(contents, "html.parser")
            text = soup.get_text(separator="\n")

        else:
            return {"result": "❌ Dateityp nicht unterstützt."}

        if not text.strip():
            return {"result": "❌ Keine lesbaren Inhalte in der E-Mail gefunden."}

        prompt = f"""
Du sollst eine professionelle E-Mail-Antwort verfassen.

STIL:
{style}

STICHWORTE:
{keywords or "Keine"}

EMPFANGENE E-MAIL (extrahiert):
{text}
""".strip()

        result = call_ai(ROLE, prompt)
        return {"result": result}

    except Exception as e:
        print("❌ email-file:", e)
        return {"result": "❌ Fehler bei der Verarbeitung der E-Mail-Datei."}