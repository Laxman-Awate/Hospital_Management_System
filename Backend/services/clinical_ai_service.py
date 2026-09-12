"""AI Clinical Documentation Service using Google Gemini."""

import json
import os
import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

CLINICAL_SYSTEM_PROMPT = """
You are a medical documentation assistant aiding a licensed physician by summarizing consultation transcripts into structured clinical documentation drafts.

CRITICAL SAFETY DIRECTIVES:
1. You are NOT a doctor and must NOT independently diagnose the patient or prescribe treatments.
2. Only extract and summarize medical facts that were EXPLICITLY spoken and discussed by the doctor and patient in the transcript.
3. If a particular field (such as diagnosis, recommended tests, treatment notes, or follow-up date) was NOT explicitly discussed in the conversation, leave that string field completely BLANK ("").
4. Do NOT invent medical symptoms, diagnoses, medications, dosages, or advice that were not stated in the transcript.
5. Produce JSON ONLY adhering strictly to the schema provided.

JSON Schema:
{
  "chief_complaint": "Primary reason for consultation stated by patient",
  "symptoms": "Reported symptoms discussed",
  "clinical_notes": "Clinical findings or history discussed",
  "diagnosis": "Diagnosis explicitly mentioned by doctor, else empty string",
  "recommended_tests": "Diagnostic tests requested by doctor, else empty string",
  "treatment_notes": "Treatment plan or advice stated by doctor, else empty string",
  "follow_up_date": "YYYY-MM-DD date if explicitly requested, else empty string",
  "remarks": "Additional notes or instructions discussed"
}
""".strip()


class ClinicalAIService:
    """Service to generate structured clinical draft documentation using Google Gemini."""

    @staticmethod
    def generate_draft(transcript: str, patient_info: dict = None) -> tuple[dict | None, str | None]:
        """
        Generates structured clinical draft JSON from consultation transcript text.
        """
        if not transcript or not transcript.strip():
            return None, "Transcript text is required to generate a clinical draft"

        if not GEMINI_API_KEY:
            return None, "Gemini API key is not configured for AI draft generation"

        info_context = ""
        if patient_info:
            info_context = f"\nPatient Context: Name: {patient_info.get('name', 'N/A')}, Age: {patient_info.get('age', 'N/A')}, Gender: {patient_info.get('gender', 'N/A')}"

        prompt = (
            f"Consultation Transcript:{info_context}\n\n"
            f"{transcript}\n\n"
            f"Please summarize the above transcript into a structured clinical JSON draft strictly according to the system rules. "
            f"Return ONLY valid JSON."
        )

        payload = {
            "systemInstruction": {"parts": [{"text": CLINICAL_SYSTEM_PROMPT}]},
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json",
                "maxOutputTokens": 1024
            }
        }

        url = f"{GEMINI_API_URL.format(model=GEMINI_MODEL)}?key={GEMINI_API_KEY}"
        request = Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urlopen(request, timeout=30) as response:
                res_data = json.loads(response.read().decode("utf-8"))

            content_text = res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
            
            # Clean markdown JSON block if present
            if content_text.startswith("```"):
                content_text = re.sub(r"^```(?:json)?\n?", "", content_text)
                content_text = re.sub(r"\n?```$", "", content_text).strip()

            parsed_draft = json.loads(content_text)
            
            # Validate response schema & fields
            expected_keys = [
                "chief_complaint", "symptoms", "clinical_notes",
                "diagnosis", "recommended_tests", "treatment_notes",
                "follow_up_date", "remarks"
            ]
            
            cleaned_draft = {}
            for key in expected_keys:
                val = parsed_draft.get(key, "")
                cleaned_draft[key] = str(val).strip() if val is not None else ""

            cleaned_draft["watermark"] = "AI-GENERATED DRAFT — REQUIRES DOCTOR REVIEW"
            return cleaned_draft, None

        except HTTPError as error:
            if error.code in (401, 403):
                return None, "Gemini API key is invalid or unauthorized."
            if error.code == 429:
                return None, "AI rate limit reached. Please try again shortly."
            return None, f"AI generation service HTTP error: {error.code}"
        except (URLError, TimeoutError, KeyError, IndexError, json.JSONDecodeError) as err:
            return None, f"Failed to generate AI clinical draft: {str(err)}"
        except Exception as err:
            return None, f"AI draft generation error: {str(err)}"
