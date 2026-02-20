"""
AudioExtractor - Extracts audio from video files using ffmpeg.
Optimized for fast processing with proper error handling.
"""
import subprocess
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class AudioExtractor:
    """
    Extracts audio from video files using ffmpeg.
    """

    def __init__(self, output_dir: str = "extracted_audio"):
        """
        Initialize audio extractor.
        
        Args:
            output_dir: Directory to save extracted audio files
        """
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Verify ffmpeg is available
        self._check_ffmpeg()

    def _check_ffmpeg(self) -> None:
        """
        Check if ffmpeg is available in the system.
        
        Raises:
            RuntimeError: If ffmpeg is not found
        """
        try:
            subprocess.run(
                ["ffmpeg", "-version"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=5
            )
        except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
            raise RuntimeError(
                "ffmpeg is not installed or not in PATH. "
                "Please install ffmpeg to use audio extraction."
            )

    def extract_audio(self, video_path: str) -> str:
        """
        Extract audio from video file.
        
        Args:
            video_path: Path to video file
            
        Returns:
            str: Path to extracted audio file
            
        Raises:
            FileNotFoundError: If video file doesn't exist
            ValueError: If extraction fails
        """
        if not video_path:
            raise ValueError("Video path is required")
        
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        try:
            # Generate output path
            video_name = Path(video_path).stem
            output_path = os.path.join(
                self.output_dir,
                f"{video_name}.wav"
            )
            
            # Ensure output directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Extract audio using ffmpeg
            # Optimized for speed: 16kHz mono PCM
            command = [
                "ffmpeg",
                "-i", video_path,
                "-vn",                    # No video
                "-acodec", "pcm_s16le",   # PCM 16-bit little-endian
                "-ar", "16000",           # 16kHz sample rate (faster processing)
                "-ac", "1",               # Mono channel
                "-y",                     # Overwrite output file
                output_path
            ]
            
            result = subprocess.run(
                command,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode != 0:
                error_msg = result.stderr.decode('utf-8', errors='ignore')
                logger.error(f"ffmpeg error: {error_msg}")
                raise ValueError(f"Failed to extract audio: ffmpeg returned code {result.returncode}")
            
            if not os.path.exists(output_path):
                raise ValueError("Audio extraction completed but output file not found")
            
            # Verify file is not empty
            if os.path.getsize(output_path) == 0:
                raise ValueError("Extracted audio file is empty")
            
            return output_path
        except subprocess.TimeoutExpired:
            logger.error(f"Audio extraction timed out for {video_path}")
            raise ValueError("Audio extraction timed out")
        except FileNotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error extracting audio from {video_path}: {str(e)}")
            raise ValueError(f"Failed to extract audio: {str(e)}")
