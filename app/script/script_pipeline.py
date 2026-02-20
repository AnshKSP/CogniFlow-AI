"""
Script Pipeline - Advanced script analysis pipeline with timeline generation.
Wraps ScriptAnalyzer for enhanced functionality.
"""
import logging
from app.video.script_analyzer import ScriptAnalyzer

logger = logging.getLogger(__name__)


class ScriptPipeline:
    """
    Advanced script analysis pipeline with sentence-level emotional arc.
    """

    def __init__(self):
        """Initialize script pipeline."""
        self.analyzer = ScriptAnalyzer()

    def analyze_with_timeline(self, text: str) -> dict:
        """
        Analyze script with sentence-level emotional arc timeline.
        
        Args:
            text: Script text to analyze
            
        Returns:
            dict with emotion_label, confidence, and emotional_arc
        """
        return self.analyzer.analyze(text, include_timeline=True)

    def analyze_simple(self, text: str) -> dict:
        """
        Simple script analysis without timeline.
        
        Args:
            text: Script text to analyze
            
        Returns:
            dict with emotion_label, confidence, and empty emotional_arc
        """
        return self.analyzer.analyze(text, include_timeline=False)
