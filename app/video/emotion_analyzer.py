"""
EmotionAnalyzer - Audio intensity analyzer for Script-Dominant + Audio-Intensity Hybrid architecture.
Audio analysis determines intensity_level only (low/medium/high), not emotion types.
"""
import librosa
import numpy as np
import logging

logger = logging.getLogger(__name__)


class EmotionAnalyzer:
    """
    Audio intensity analyzer - determines intensity levels only.
    Does NOT classify emotion types (that's script's job).
    """

    def __init__(self, chunk_duration: float = 5.0):
        """
        Initialize emotion analyzer.
        
        Args:
            chunk_duration: Legacy parameter (kept for compatibility, not used)
        """
        # Legacy parameter kept for compatibility but not used
        self.chunk_duration = chunk_duration

    def analyze(
        self,
        audio_path: str,
        transcript_info: dict = None,
        script_mood: str = None
    ) -> dict:
        """
        Analyze audio intensity level only.
        Does NOT classify emotion types - that's script's responsibility.
        
        Args:
            audio_path: Path to audio file
            transcript_info: Optional dict with 'word_count' and 'duration' (not used for intensity)
            script_mood: Optional script mood (not used for intensity classification)
            
        Returns:
            dict with intensity_level and emotional_arc (timeline with intensity levels)
            
        Raises:
            FileNotFoundError: If audio file doesn't exist
            ValueError: If analysis fails
        """
        if not audio_path:
            raise ValueError("Audio path is required")
        
        try:
            # Load full audio at 16kHz
            y, sr = librosa.load(audio_path, sr=16000, mono=True)
            
            if len(y) == 0:
                raise ValueError("Audio file is empty")
            
            total_duration = librosa.get_duration(y=y, sr=sr)
            
            # ============================================================
            # GLOBAL INTENSITY CLASSIFICATION
            # ============================================================
            intensity_level = self._classify_intensity(y, sr, total_duration)
            
            # ============================================================
            # TIMELINE GENERATION (Intensity levels only)
            # ============================================================
            emotional_arc = self._generate_intensity_timeline(y, sr, total_duration)
            
            return {
                "intensity_level": intensity_level,
                "emotional_arc": emotional_arc
            }
        except FileNotFoundError:
            logger.error(f"Audio file not found: {audio_path}")
            raise
        except Exception as e:
            logger.error(f"Error analyzing audio intensity: {str(e)}")
            raise ValueError(f"Failed to analyze audio intensity: {str(e)}")

    def _classify_intensity(
        self,
        y: np.ndarray,
        sr: int,
        duration: float
    ) -> str:
        """
        Classify global intensity level using full audio metrics.
        
        Args:
            y: Audio samples
            sr: Sample rate
            duration: Total duration in seconds
            
        Returns:
            str: Intensity level ("low", "medium", or "high")
        """
        # Compute RMS for sliding windows (small windows for accurate metrics)
        window_size_seconds = 2.0  # Small windows for accurate global metrics
        samples_per_window = int(window_size_seconds * sr)
        rms_values = []
        
        # Slide through audio with small windows
        for i in range(0, len(y), samples_per_window // 2):  # 50% overlap for smooth metrics
            chunk = y[i:i + samples_per_window]
            if len(chunk) >= samples_per_window * 0.5:  # At least 50% of window
                rms = np.mean(librosa.feature.rms(y=chunk))
                rms_values.append(rms)
        
        if not rms_values:
            # Fallback for very short audio
            rms_values = [np.mean(librosa.feature.rms(y=y))]
        
        # Compute global metrics
        rms_array = np.array(rms_values)
        mean_rms = np.mean(rms_array)
        std_rms = np.std(rms_array)
        peak_rms = np.max(rms_array)
        
        # Handle edge case where std is very small or zero
        if std_rms < 1e-6:
            std_rms = mean_rms * 0.1 if mean_rms > 0 else 0.01
        
        # Compute energy variation coefficient
        if mean_rms > 0:
            energy_variation = std_rms / mean_rms
        else:
            energy_variation = 0.0
        
        # ============================================================
        # INTENSITY CLASSIFICATION RULES
        # ============================================================
        
        # LOW INTENSITY: mean_rms low AND low variation
        if mean_rms < 0.03 and energy_variation < 0.25:
            return "low"
        
        # HIGH INTENSITY: high peak_rms OR high variation
        peak_ratio = peak_rms / mean_rms if mean_rms > 0 else 0
        if peak_ratio > 2.0 or energy_variation > 0.5 or mean_rms > 0.08:
            return "high"
        
        # MEDIUM INTENSITY: moderate rms + moderate variation
        # Everything else falls into medium
        if 0.03 <= mean_rms <= 0.08 and 0.25 <= energy_variation <= 0.5:
            return "medium"
        
        # Fallback classification
        if mean_rms < 0.02:
            return "low"
        elif mean_rms > 0.08:
            return "high"
        elif energy_variation > 0.5:
            return "high"
        elif energy_variation < 0.25:
            return "low"
        else:
            return "medium"

    def _generate_intensity_timeline(
        self,
        y: np.ndarray,
        sr: int,
        duration: float
    ) -> list:
        """
        Generate intensity timeline for visualization.
        Timeline shows intensity levels (low/medium/high), NOT emotion types.
        
        Args:
            y: Audio samples
            sr: Sample rate
            duration: Total duration in seconds
            
        Returns:
            list: Timeline entries with start, end, mood (intensity level)
        """
        # Use 10-second windows (as specified)
        window_size_seconds = 10.0
        
        samples_per_window = int(window_size_seconds * sr)
        timeline = []
        
        # Process audio in windows
        for i in range(0, len(y), samples_per_window):
            chunk = y[i:i + samples_per_window]
            
            # Skip windows that are too short (< 50% of window duration)
            if len(chunk) < samples_per_window * 0.5:
                break
            
            # Compute RMS for this window
            rms = np.mean(librosa.feature.rms(y=chunk))
            
            start_time = i / sr
            end_time = min((i + samples_per_window) / sr, duration)
            
            # Classify this window's intensity level
            intensity = self._classify_window_intensity(rms)
            
            timeline.append({
                "start": round(start_time, 2),
                "end": round(end_time, 2),
                "mood": intensity  # Using "mood" key for compatibility
            })
        
        if not timeline:
            # Fallback for very short audio
            rms = np.mean(librosa.feature.rms(y=y))
            intensity = self._classify_window_intensity(rms)
            timeline.append({
                "start": 0.0,
                "end": round(duration, 2),
                "mood": intensity  # Using "mood" key for compatibility
            })
        
        return timeline

    def _classify_window_intensity(self, rms: float) -> str:
        """
        Classify a timeline window's intensity level.
        
        Args:
            rms: RMS value for this window
            
        Returns:
            str: Intensity level ("low", "medium", or "high")
        """
        # Simple thresholds for timeline intensity classification
        if rms < 0.02:
            return "low"
        elif rms > 0.08:
            return "high"
        elif rms > 0.05:
            return "high"
        elif rms > 0.03:
            return "medium"
        else:
            return "low"

    def get_dominant_mood(self, timeline: list, script_mood: str = None) -> str:
        """
        Legacy method - kept for compatibility.
        Note: This method is deprecated. Dominant mood should come from script analysis.
        
        Args:
            timeline: List of intensity entries (not used)
            script_mood: Optional script mood (not used)
            
        Returns:
            str: Always returns "neutral" (deprecated method)
        """
        # This method is deprecated - dominant mood comes from script, not audio
        return "neutral"
