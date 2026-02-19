from faster_whisper import WhisperModel
import re
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate


class Transcriber:

    def __init__(self, model_size="base"):
        self.model = WhisperModel(
            model_size,
            device="cpu",
            compute_type="int8"
        )

    def contains_urdu_script(self, text: str) -> bool:
        return bool(re.search(r'[\u0600-\u06FF]', text))

    def convert_urdu_to_hindi(self, text: str) -> str:
        try:
            return transliterate(text, sanscript.ARABIC, sanscript.DEVANAGARI)
        except Exception:
            return text

    def transcribe(self, audio_path: str):

        segments, info = self.model.transcribe(audio_path)

        full_text = ""
        for segment in segments:
            full_text += segment.text + " "

        full_text = full_text.strip()

        # If Urdu script detected → convert to Hindi script
        if self.contains_urdu_script(full_text):
            full_text = self.convert_urdu_to_hindi(full_text)
            detected_language = "hi (normalized)"
        else:
            detected_language = info.language

        return {
            "full_text": full_text,
            "language": detected_language,
            "confidence": info.language_probability
        }
