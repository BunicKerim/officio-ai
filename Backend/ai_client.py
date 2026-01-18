import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")

if not API_KEY:
    raise RuntimeError("OPENAI_API_KEY nicht gefunden")

client = OpenAI(api_key=API_KEY)

def call_ai(system_role: str, user_text: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_role},
            {"role": "user", "content": user_text}
        ],
        temperature=0.2
    )

    return response.choices[0].message.content.strip()

