"""
VideoPipeline - Main pipeline for processing videos.
Emotion Classification + Intensity Hybrid architecture.
Script emotion classification + Audio intensity for dominant mood.
"""
from app.video.downloader import YouTubeDownloader
from app.video.audio_extractor import AudioExtractor
from app.video.transcriber import Transcriber
from app.video.emotion_analyzer import EmotionAnalyzer
from app.video.script_analyzer import ScriptAnalyzer
import os
import logging
import librosa

logger = logging.getLogger(__name__)


class VideoPipeline:
    """
    Main pipeline for processing uploaded videos and YouTube URLs.
    Emotion Classification + Intensity Hybrid architecture.
    
    Methods:
        process_uploaded_video(path: str) -> dict
        process_youtube(url: str) -> dict
    
    Returns:
        {
            "transcript": {...},
            "audio_emotion": {
                "intensity_level": "...",
                "dominant_mood": "...",
                "emotional_arc": [...]
            },
            "script_emotion": {
                "emotion_label": "...",
                "confidence": float,
                "dominant_mood": "...",
                "emotional_arc": [...]
            },
            "emotion_summary": "..."
        }
    """

    def __init__(self):
        """Initialize all pipeline components."""
        self.downloader = YouTubeDownloader()
        self.audio_extractor = AudioExtractor()
        self.transcriber = Transcriber()
        self.emotion_analyzer = EmotionAnalyzer()
        self.script_analyzer = ScriptAnalyzer()

    def process_uploaded_video(self, path: str) -> dict:
        """
        Process an uploaded video file.
        
        Args:
            path: Path to the video file
            
        Returns:
            dict with transcript, audio_emotion, script_emotion, and emotion_summary
            
        Raises:
            FileNotFoundError: If video file doesn't exist
            ValueError: If processing fails
        """
        if not os.path.exists(path):
            raise FileNotFoundError(f"Video file not found: {path}")
        
        try:
            # Extract audio
            audio_path = self.audio_extractor.extract_audio(path)
            
            # Transcribe first to get text for script analysis
            transcript = self.transcriber.transcribe(audio_path)
            
            # Analyze script emotion classification
            script_emotion = self.script_analyzer.analyze(transcript["full_text"])
            emotion_label = script_emotion.get("emotion_label", "neutral")
            
            # Analyze audio intensity
            audio_emotion = self.emotion_analyzer.analyze(audio_path)
            intensity_level = audio_emotion.get("intensity_level", "medium")
            
            # Map emotion_label to dominant_mood
            dominant_mood = self._map_emotion_to_mood(emotion_label)
            
            # Add dominant_mood to audio_emotion for backward compatibility
            audio_emotion["dominant_mood"] = dominant_mood
            
            # Add dominant_mood to script_emotion for backward compatibility with main.py
            script_emotion["dominant_mood"] = dominant_mood
            
            # Generate emotion summary
            emotion_summary = self._generate_emotion_summary(dominant_mood, intensity_level)
            
            return {
                "transcript": transcript,
                "audio_emotion": audio_emotion,
                "script_emotion": script_emotion,
                "emotion_summary": emotion_summary
            }
        except Exception as e:
            logger.error(f"Error processing uploaded video {path}: {str(e)}")
            raise ValueError(f"Failed to process video: {str(e)}")

    def process_youtube(self, url: str) -> dict:
        """
        Process a YouTube video URL.
        
        Args:
            url: YouTube video URL
            
        Returns:
            dict with transcript, audio_emotion, script_emotion, and emotion_summary
            
        Raises:
            ValueError: If URL is invalid or processing fails
        """
        if not url or not isinstance(url, str):
            raise ValueError("Invalid YouTube URL provided")
        
        try:
            # Download audio
            video_path = self.downloader.download_audio(url)
            
            # Extract audio
            audio_path = self.audio_extractor.extract_audio(video_path)
            
            # Transcribe first to get text for script analysis
            transcript = self.transcriber.transcribe(audio_path)
            
            # Analyze script emotion classification
            script_emotion = self.script_analyzer.analyze(transcript["full_text"])
            emotion_label = script_emotion.get("emotion_label", "neutral")
            
            # Analyze audio intensity
            audio_emotion = self.emotion_analyzer.analyze(audio_path)
            intensity_level = audio_emotion.get("intensity_level", "medium")
            
            # Map emotion_label to dominant_mood
            dominant_mood = self._map_emotion_to_mood(emotion_label)
            
            # Add dominant_mood to audio_emotion for backward compatibility
            audio_emotion["dominant_mood"] = dominant_mood
            
            # Add dominant_mood to script_emotion for backward compatibility with main.py
            script_emotion["dominant_mood"] = dominant_mood
            
            # Generate emotion summary
            emotion_summary = self._generate_emotion_summary(dominant_mood, intensity_level)
            
            return {
                "transcript": transcript,
                "audio_emotion": audio_emotion,
                "script_emotion": script_emotion,
                "emotion_summary": emotion_summary
            }
        except Exception as e:
            logger.error(f"Error processing YouTube URL {url}: {str(e)}")
            raise ValueError(f"Failed to process YouTube video: {str(e)}")

    def _map_emotion_to_mood(self, emotion_label: str) -> str:
        """
        Map emotion label from model to dominant mood.
        
        Mapping:
            sadness → "dark"
            anger → "intense"
            joy → "energetic"
            fear → "dramatic"
            surprise → "dramatic"
            disgust → "dark"
            neutral → "calm"
        
        Args:
            emotion_label: Emotion label from script analysis
            
        Returns:
            str: Dominant mood classification
        """
        # Normalize input
        emotion_label = emotion_label.lower() if emotion_label else "neutral"
        
        # Mapping table
        emotion_to_mood = {
            "sadness": "dark",
            "anger": "intense",
            "joy": "energetic",
            "fear": "dramatic",
            "surprise": "dramatic",
            "disgust": "dark",
            "neutral": "calm"
        }
        
        # Return mapped mood or default to calm
        return emotion_to_mood.get(emotion_label, "calm")

    def _generate_emotion_summary(self, dominant_mood: str, intensity_level: str) -> str:
        """
        Generate deterministic emotion summary.
        Format: "This video has a {dominant_mood} emotional tone delivered with {intensity_level} intensity."
        
        Args:
            dominant_mood: Dominant mood from emotion mapping
            intensity_level: Intensity level from audio analysis
            
        Returns:
            str: Emotion summary description
        """
        if not dominant_mood:
            dominant_mood = "neutral"
        
        if not intensity_level:
            intensity_level = "medium"
        
        return f"This video has a {dominant_mood} emotional tone delivered with {intensity_level} intensity."
