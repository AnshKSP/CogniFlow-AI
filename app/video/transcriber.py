"""
Transcriber - Transcribes audio using faster-whisper with translation-first strategy.
Optimized for better emotion-analysis compatibility.
"""
from faster_whisper import WhisperModel
import re
import logging
import os
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

logger = logging.getLogger(__name__)


class Transcriber:
    """
    Transcribes audio using faster-whisper.
    Uses English translation output for stronger downstream emotion analysis.
    """

    def __init__(self):
        """Initialize transcriber model."""
        try:
            model_size = os.getenv("WHISPER_MODEL_SIZE", "base").strip() or "base"
            compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8").strip() or "int8"

            self.model = WhisperModel(
                model_size,
                device="cpu",
                compute_type=compute_type
            )
            logger.info(f"Whisper model initialized (size={model_size}, compute_type={compute_type})")
        except Exception as e:
            logger.error(f"Failed to initialize Whisper model: {str(e)}")
            raise ValueError(f"Could not initialize transcription model: {str(e)}")

    def contains_urdu_script(self, text: str) -> bool:
        """
        Check if text contains Urdu script.
        
        Args:
            text: Input text
            
        Returns:
            bool: True if Urdu script detected
        """
        return bool(re.search(r'[\u0600-\u06FF]', text))

    def convert_urdu_to_hindi(self, text: str) -> str:
        """
        Convert Urdu script to Hindi (Devanagari).
        
        Args:
            text: Urdu text
            
        Returns:
            str: Hindi text
        """
        try:
            return transliterate(text, sanscript.ARABIC, sanscript.DEVANAGARI)
        except Exception as e:
            logger.warning(f"Failed to transliterate Urdu to Hindi: {str(e)}")
            return text

    def transcribe(self, audio_path: str) -> dict:
        """
        Transcribe audio file.
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            dict with full_text, language, and confidence
            
        Raises:
            FileNotFoundError: If audio file doesn't exist
            ValueError: If transcription fails
        """
        if not audio_path:
            raise ValueError("Audio path is required")
        
        try:
            # Translation-first for better compatibility with English-only emotion model.
            segments, info = self.model.transcribe(
                audio_path,
                task="translate",
                beam_size=3,
                best_of=3,
                vad_filter=True,
                vad_parameters={"min_silence_duration_ms": 500}
            )
            
            # Collect all segments
            full_text = ""
            for segment in segments:
                full_text += segment.text + " "
            
            full_text = full_text.strip()

            # Fallback to standard transcription when translation yields no usable text.
            if not full_text:
                segments, info = self.model.transcribe(
                    audio_path,
                    task="transcribe",
                    beam_size=2,
                    best_of=2,
                    vad_filter=True,
                    vad_parameters={"min_silence_duration_ms": 500}
                )

                full_text = ""
                for segment in segments:
                    full_text += segment.text + " "

                full_text = full_text.strip()
            
            if not full_text:
                logger.warning(f"No transcription generated for {audio_path}")
                return {
                    "full_text": "",
                    "language": "unknown",
                    "confidence": 0.0
                }
            
            # Keep this fallback for cases where translation was not applied.
            if self.contains_urdu_script(full_text):
                full_text = self.convert_urdu_to_hindi(full_text)
                detected_language = "hi (normalized)"
            else:
                detected_language = info.language if hasattr(info, 'language') else "unknown"
            
            confidence = info.language_probability if hasattr(info, 'language_probability') else None
            
            return {
                "full_text": full_text,
                "language": detected_language,
                "confidence": confidence
            }
        except FileNotFoundError:
            logger.error(f"Audio file not found: {audio_path}")
            raise
        except Exception as e:
            logger.error(f"Error transcribing audio: {str(e)}")
            raise ValueError(f"Failed to transcribe audio: {str(e)}")
