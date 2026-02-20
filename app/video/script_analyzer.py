"""
ScriptAnalyzer - Emotion classification using HuggingFace DistilRoBERTa model.
Uses j-hartmann/emotion-english-distilroberta-base for emotion detection.
Supports sentence-level emotional arc timeline.
"""
import logging
import re
from transformers import pipeline
from typing import List, Dict

logger = logging.getLogger(__name__)


class ScriptAnalyzer:
    """
    Script analyzer using HuggingFace emotion classification model.
    Performs emotion classification on transcript text with sentence-level timeline.
    """

    def __init__(self, words_per_chunk: int = 10):
        """
        Initialize script analyzer with HuggingFace emotion classification model.
        
        Args:
            words_per_chunk: Legacy parameter (kept for compatibility, not used)
        """
        self.words_per_chunk = words_per_chunk
        
        # Load emotion classification pipeline once
        try:
            self.emotion_pipeline = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                device=-1  # Use CPU (-1), change to 0 for GPU if available
            )
            logger.info("Emotion classification model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load emotion classification model: {str(e)}")
            raise ValueError(f"Could not initialize emotion classification model: {str(e)}")

    def analyze(self, text: str, estimated_duration: float = None, include_timeline: bool = True) -> dict:
        """
        Analyze emotion from transcript text using HuggingFace emotion classification model.
        
        Args:
            text: Full transcript text
            estimated_duration: Optional estimated duration (kept for compatibility)
            include_timeline: Whether to generate sentence-level emotional arc (default: True)
            
        Returns:
            dict with emotion_label, confidence, and emotional_arc (timeline)
        """
        if not text or not isinstance(text, str):
            return {
                "emotion_label": "neutral",
                "confidence": 0.0,
                "emotional_arc": []
            }
        
        try:
            # Generate sentence-level emotional arc if requested
            if include_timeline:
                emotional_arc = self._generate_emotional_arc(text)
                
                # Compute global dominant emotion from emotional arc
                if emotional_arc:
                    emotion_counts = {}
                    for entry in emotional_arc:
                        emotion = entry.get("emotion", "neutral")
                        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
                    
                    # Get dominant emotion (highest frequency)
                    if emotion_counts:
                        emotion_label = max(emotion_counts, key=emotion_counts.get)
                        # Calculate average confidence for dominant emotion
                        dominant_confidences = [
                            entry.get("confidence", 0.0)
                            for entry in emotional_arc
                            if entry.get("emotion") == emotion_label
                        ]
                        confidence = sum(dominant_confidences) / len(dominant_confidences) if dominant_confidences else 0.5
                    else:
                        emotion_label = "neutral"
                        confidence = 0.5
                else:
                    # Fallback to full text analysis
                    result = self.emotion_pipeline(
                        text,
                        truncation=True,
                        max_length=512,
                        return_all_scores=False
                    )
                    if isinstance(result, list) and len(result) > 0:
                        emotion_label = result[0].get("label", "neutral").lower()
                        confidence = result[0].get("score", 0.5)
                    else:
                        emotion_label = "neutral"
                        confidence = 0.5
            else:
                # Simple full-text analysis without timeline
                result = self.emotion_pipeline(
                    text,
                    truncation=True,
                    max_length=512,
                    return_all_scores=False
                )
                
                if isinstance(result, list) and len(result) > 0:
                    emotion_label = result[0].get("label", "neutral").lower()
                    confidence = result[0].get("score", 0.5)
                else:
                    emotion_label = "neutral"
                    confidence = 0.5
                
                emotional_arc = []
            
            return {
                "emotion_label": emotion_label,
                "confidence": round(confidence, 3),
                "emotional_arc": emotional_arc
            }
        except Exception as e:
            logger.error(f"Error analyzing script emotion: {str(e)}")
            return {
                "emotion_label": "neutral",
                "confidence": 0.0,
                "emotional_arc": []
            }

    def _split_into_sentences(self, text: str) -> List[str]:
        """
        Split text into sentences using simple sentence tokenizer.
        
        Args:
            text: Input text
            
        Returns:
            List of sentences
        """
        # Simple sentence splitting: split on . ! ? followed by space or end of string
        # Handle common abbreviations and decimal numbers
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        # Clean up sentences
        cleaned_sentences = []
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence:
                cleaned_sentences.append(sentence)
        
        return cleaned_sentences

    def _generate_emotional_arc(self, text: str) -> List[Dict]:
        """
        Generate sentence-level emotional arc timeline.
        
        Args:
            text: Full transcript text
            
        Returns:
            List of emotional arc entries with index, text, emotion, confidence
        """
        emotional_arc = []
        
        try:
            # Split text into sentences
            sentences = self._split_into_sentences(text)
            
            if not sentences:
                return []
            
            # Analyze each sentence
            for index, sentence in enumerate(sentences):
                # Skip very short sentences (less than 3 characters)
                if len(sentence.strip()) < 3:
                    continue
                
                try:
                    # Classify emotion for this sentence
                    result = self.emotion_pipeline(
                        sentence,
                        truncation=True,
                        max_length=512,
                        return_all_scores=False
                    )
                    
                    if isinstance(result, list) and len(result) > 0:
                        emotion = result[0].get("label", "neutral").lower()
                        confidence = result[0].get("score", 0.5)
                    else:
                        emotion = "neutral"
                        confidence = 0.5
                    
                    emotional_arc.append({
                        "index": index,
                        "text": sentence[:200],  # Limit text length for readability
                        "emotion": emotion,
                        "confidence": round(confidence, 3)
                    })
                except Exception as e:
                    logger.warning(f"Error analyzing sentence {index}: {str(e)}")
                    # Add neutral entry for failed sentences
                    emotional_arc.append({
                        "index": index,
                        "text": sentence[:200],
                        "emotion": "neutral",
                        "confidence": 0.0
                    })
            
            return emotional_arc
        except Exception as e:
            logger.error(f"Error generating emotional arc: {str(e)}")
            return []
