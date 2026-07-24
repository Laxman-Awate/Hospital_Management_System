"""Gemini-backed, non-diagnostic hospital information assistant."""

import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

# This project already has a top-level config.py module, which shadows the
# config/ directory when Flask is started from Backend. Keep AI settings local
# to this service to avoid importing config.ai_config through that collision.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


SYSTEM_PROMPT = """
You are the Hospital Management System's health-information assistant.
Be polite, empathetic, concise, and easy to understand. You are not a doctor.
Provide general educational information only: hospital services, department suggestions,
appointment guidance, general medicine explanations, and medication-reminder habits.
Never confirm a diagnosis, prescribe medicines, give dosages, or tell a user to stop or
start treatment. Encourage users to consult a qualified doctor for personal advice.
For severe chest pain, trouble breathing, stroke symptoms, severe bleeding, loss of
consciousness, or other potentially life-threatening symptoms, tell the user to seek
immediate emergency medical attention or call local emergency services.
Always end every response with: "This information is for educational purposes only."
""".strip()


class AIService:

    @staticmethod
    def get_chat_reply(message):
        if not GEMINI_API_KEY:
            return None, "AI assistant is not configured. Set GEMINI_API_KEY and try again."

        payload = {
            "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": [{"role": "user", "parts": [{"text": message}]}],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 500},
        }
        url = f"{GEMINI_API_URL.format(model=GEMINI_MODEL)}?key={GEMINI_API_KEY}"
        request = Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urlopen(request, timeout=20) as response:
                data = json.loads(response.read().decode("utf-8"))
            reply = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            if not reply:
                return None, "The AI assistant did not return a response."
            return reply, None
        except HTTPError as error:
            if error.code in (401, 403):
                return None, "AI assistant authentication failed. Check the Gemini API key."
            if error.code == 429:
                return None, "AI assistant is busy. Please try again shortly."
            return None, "AI assistant is temporarily unavailable. Please try again later."
        except (URLError, TimeoutError, KeyError, IndexError, json.JSONDecodeError):
            return None, "AI assistant is temporarily unavailable. Please try again later."
