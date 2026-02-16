import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
if not API_KEY:
    raise RuntimeError("OPENAI_API_KEY nicht gefunden")

client = OpenAI(api_key=API_KEY)

def call_ai(system_role: str, user_text: str) -> str:
    try:
        print("🔌 OpenAI request gestartet")

        response = client.responses.create(
            model="gpt-4.1-mini",
            input=[
                {"role": "system", "content": system_role},
                {"role": "user", "content": user_text}
            ],
            temperature=0.2,
            timeout=30  # 🔥 WICHTIG
        )

        if not response.output or not response.output[0].content:
            return "❌ Keine gültige KI-Antwort."

        result = response.output[0].content[0].text.strip()

        print("✅ OpenAI response erhalten")
        return result

    except Exception as e:
        print("❌ OpenAI Fehler:", str(e))
        return f"❌ Fehler bei der KI-Verarbeitung: {str(e)}"

