"""Speech-to-text adapter using OpenAI's hosted Whisper transcription model."""

import os
from openai import OpenAI


class SpeechToTextService:
    """Abstract service for transcribing consultation audio into text."""

    @staticmethod
    def transcribe(file_path: str, mime_type: str = "audio/webm") -> tuple[dict | None, str | None]:
        """
        Transcribes the audio file at file_path into a consultation transcript.

        Returns:
            (result_dict, error_string)
            result_dict format:
            {
                "transcript": "...",
                "language": "en",
                "duration": 42
            }
        """
        if not os.path.exists(file_path):
            return None, "Audio file not found"

        file_size = os.path.getsize(file_path)
        if file_size == 0:
            return None, "Audio file is empty"
        if file_size > 25 * 1024 * 1024:
            return None, "Audio file exceeds 25MB limit"

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return None, "OPENAI_API_KEY is not configured for transcription."

        try:
            client = OpenAI(api_key=api_key)
            with open(file_path, "rb") as audio:
                result = client.audio.transcriptions.create(
                    model=os.getenv("WHISPER_MODEL", "whisper-1"),
                    file=audio,
                    response_format="json",
                    prompt="Doctor-patient consultation. Preserve the spoken wording; do not summarize.",
                )
            raw_text = (result.text or "").strip()
            if not raw_text:
                return None, "Failed to extract transcript from audio"

            return {
                "transcript": raw_text,
                "language": "en",
                "duration": max(10, round(file_size / 32000))
            }, None

        except Exception as err:
            return None, f"Speech-to-text transcription failed: {str(err)}"
