"""
Transcriber - Transcribes audio using faster-whisper tiny model.
Optimized for ultra-fast demo mode.
"""
from faster_whisper import WhisperModel
import re
import logging
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

logger = logging.getLogger(__name__)


class Transcriber:
    """
    Transcribes audio using faster-whisper tiny model for ultra-fast processing.
    """

    def __init__(self):
        """Initialize transcriber with tiny model for speed."""
        try:
            # ULTRA FAST MODE - tiny model with int8 quantization
            self.model = WhisperModel(
                "tiny",              # smallest model for speed
                device="cpu",        # CPU for compatibility
                compute_type="int8"  # int8 for faster inference
            )
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
            # Fast transcription with minimal beam search
            segments, info = self.model.transcribe(
                audio_path,
                beam_size=1,           # faster (default is 5)
                best_of=1,             # faster (default is 5)
                vad_filter=True,       # Voice activity detection for better accuracy
                vad_parameters=dict(
                    min_silence_duration_ms=500
                )
            )
            
            # Collect all segments
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
            
            # Handle Urdu script conversion
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
