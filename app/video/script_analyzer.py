"""
ScriptAnalyzer - Emotion classification using HuggingFace DistilRoBERTa model.
Uses j-hartmann/emotion-english-distilroberta-base for emotion detection.
Supports sentence-level emotional arc timeline.
"""
import logging
import math
import re
from typing import Dict, List

from transformers import pipeline

logger = logging.getLogger(__name__)


class ScriptAnalyzer:
    """
    Script analyzer using HuggingFace emotion classification model.
    Performs emotion classification on transcript text with sentence-level timeline.
    """

    _emotion_pipeline = None

    def __init__(self, words_per_chunk: int = 260, max_timeline_points: int = 60):
        """
        Initialize script analyzer with HuggingFace emotion classification model.
        
        Args:
            words_per_chunk: Approximate words per chunk used for robust full-text scoring.
            max_timeline_points: Upper bound for timeline points to keep runtime predictable.
        """
        # Keep chunks large but below typical 512-token truncation risk.
        self.words_per_chunk = max(200, min(260, words_per_chunk))
        self.max_timeline_points = max(20, max_timeline_points)
        
        # Load emotion classification pipeline once per process.
        if ScriptAnalyzer._emotion_pipeline is None:
            try:
                ScriptAnalyzer._emotion_pipeline = pipeline(
                    "text-classification",
                    model="j-hartmann/emotion-english-distilroberta-base",
                    device=-1  # Use CPU (-1), change to 0 for GPU if available
                )
                logger.info("Emotion classification model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load emotion classification model: {str(e)}")
                raise ValueError(f"Could not initialize emotion classification model: {str(e)}")

        self.emotion_pipeline = ScriptAnalyzer._emotion_pipeline
        self.max_model_tokens = self._resolve_model_max_tokens()

    def _resolve_model_max_tokens(self) -> int:
        tokenizer = getattr(self.emotion_pipeline, "tokenizer", None)
        if tokenizer is None:
            return 512

        try:
            model_max = int(getattr(tokenizer, "model_max_length", 512))
            # Some tokenizers expose a very large sentinel value; clamp to BERT-like safe limit.
            if model_max <= 0 or model_max > 4096:
                return 512
            return min(model_max, 512)
        except Exception:
            return 512

    def _count_tokens(self, text: str) -> int:
        tokenizer = getattr(self.emotion_pipeline, "tokenizer", None)
        if tokenizer is None:
            return len(text.split())

        try:
            encoded = tokenizer(
                text,
                add_special_tokens=True,
                truncation=False,
                return_attention_mask=False
            )
            input_ids = encoded.get("input_ids", [])
            return len(input_ids) if isinstance(input_ids, list) else len(text.split())
        except Exception:
            return len(text.split())

    def _merge_weighted_scores(self, weighted_scores: List[tuple[Dict[str, float], float]]) -> Dict[str, float]:
        totals: Dict[str, float] = {}
        total_weight = 0.0

        for scores, weight in weighted_scores:
            if not scores:
                continue
            safe_weight = max(1.0, float(weight))
            total_weight += safe_weight
            for label, score in scores.items():
                totals[label] = totals.get(label, 0.0) + (score * safe_weight)

        if total_weight <= 0:
            return {}

        return {label: value / total_weight for label, value in totals.items()}

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
                "emotional_arc": [],
                "top_emotions": [],
                "dominance_gap": 0.0
            }

        try:
            clean_text = self._clean_text(text)
            if not clean_text:
                return {
                    "emotion_label": "neutral",
                    "confidence": 0.0,
                    "emotional_arc": [],
                    "top_emotions": [],
                    "dominance_gap": 0.0
                }

            emotional_arc = self._generate_emotional_arc(clean_text) if include_timeline else []
            full_text_scores = self._aggregate_chunk_scores(clean_text)
            timeline_scores = self._aggregate_timeline_scores(emotional_arc)

            combined_scores = self._combine_scores(
                full_text_scores,
                timeline_scores,
                timeline_points=len(emotional_arc)
            )
            if not combined_scores:
                emotion_label = "neutral"
                confidence = 0.0
                top_emotions = []
                dominance_gap = 0.0
            else:
                emotion_label = max(combined_scores, key=combined_scores.get)
                confidence = combined_scores.get(emotion_label, 0.0)
                top_emotions = self._extract_top_emotions(combined_scores, limit=3)
                if len(top_emotions) >= 2:
                    dominance_gap = max(0.0, top_emotions[0]["score"] - top_emotions[1]["score"])
                elif len(top_emotions) == 1:
                    dominance_gap = top_emotions[0]["score"]
                else:
                    dominance_gap = 0.0

            return {
                "emotion_label": emotion_label,
                "confidence": round(confidence, 3),
                "emotional_arc": emotional_arc,
                "top_emotions": top_emotions,
                "dominance_gap": round(dominance_gap, 3)
            }
        except Exception as e:
            logger.error(f"Error analyzing script emotion: {str(e)}")
            return {
                "emotion_label": "neutral",
                "confidence": 0.0,
                "emotional_arc": [],
                "top_emotions": [],
                "dominance_gap": 0.0
            }

    def _extract_top_emotions(self, scores: Dict[str, float], limit: int = 3) -> List[Dict[str, float]]:
        if not scores:
            return []

        ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        top: List[Dict[str, float]] = []
        for label, score in ranked[:max(1, limit)]:
            top.append({
                "emotion": str(label).lower(),
                "score": round(float(score), 3)
            })
        return top

    def _clean_text(self, text: str) -> str:
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        text = text.replace("\u2018", "'").replace("\u2019", "'")
        text = text.replace("\u201c", '"').replace("\u201d", '"')
        text = text.replace("\u2013", "-").replace("\u2014", "-")

        # Remove URLs and obvious time-codes that add classification noise.
        text = re.sub(r"(https?://\S+|www\.\S+)", " ", text, flags=re.IGNORECASE)
        text = re.sub(r"\[(\d{1,2}:)?\d{1,2}:\d{2}(\.\d+)?\]", " ", text)

        # Remove page markers commonly found in extracted PDFs.
        text = re.sub(r"(?im)^\s*(page|pg\.?)\s+\d+(\s*(of|/)\s*\d+)?\s*$", " ", text)

        # Normalize spacing while preserving line boundaries for script-like text.
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    def _split_into_sentences(self, text: str) -> List[str]:
        """
        Split text into sentences using simple sentence tokenizer.
        
        Args:
            text: Input text
            
        Returns:
            List of sentences
        """
        if not text:
            return []

        # For screenplay/PDF text, line breaks often carry semantic boundaries.
        candidate_lines = re.split(r"\n+", text)
        cleaned_sentences: List[str] = []

        for line in candidate_lines:
            line = line.strip()
            if not line:
                continue

            # Skip low-signal metadata lines.
            if re.fullmatch(r"\d+", line):
                continue

            # Split regular prose line by punctuation boundaries.
            pieces = re.split(r"(?<=[.!?])\s+", line)
            for piece in pieces:
                piece = piece.strip(" -\t")
                if not piece:
                    continue
                if len(piece) < 3:
                    continue
                cleaned_sentences.append(piece)

        if cleaned_sentences:
            return cleaned_sentences

        # Fallback: sentence split over full text if line-wise parsing produced nothing.
        fallback = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
        return fallback

    def _split_into_chunks(self, text: str) -> List[str]:
        words = text.split()
        if not words:
            return []

        if len(words) <= self.words_per_chunk:
            return [text]

        chunks: List[str] = []
        # Non-overlapping large chunks to reduce fragmentation.
        for i in range(0, len(words), self.words_per_chunk):
            chunk_words = words[i:i + self.words_per_chunk]
            if chunk_words:
                chunks.append(" ".join(chunk_words))

        return chunks

    def _classify_text(self, text: str) -> Dict[str, float]:
        try:
            if not text or not text.strip():
                return {}

            # Avoid hard truncation: split recursively when chunk exceeds model token window.
            token_count = self._count_tokens(text)
            if token_count > self.max_model_tokens:
                words = text.split()
                if len(words) > 1:
                    midpoint = max(1, len(words) // 2)
                    left_text = " ".join(words[:midpoint]).strip()
                    right_text = " ".join(words[midpoint:]).strip()
                    return self._merge_weighted_scores([
                        (self._classify_text(left_text), len(left_text.split())),
                        (self._classify_text(right_text), len(right_text.split()))
                    ])

            result = self.emotion_pipeline(
                text,
                truncation=True,
                max_length=self.max_model_tokens,
                return_all_scores=True
            )

            # HuggingFace can return [[{label,score}, ...]] or [{label,score}, ...]
            scores = result[0] if isinstance(result, list) and result and isinstance(result[0], list) else result
            if not isinstance(scores, list):
                return {}

            normalized: Dict[str, float] = {}
            for item in scores:
                label = self._normalize_emotion_label(str(item.get("label", "neutral")))
                score = float(item.get("score", 0.0))
                normalized[label] = score
            return normalized
        except Exception as e:
            logger.warning(f"Emotion classification failed for chunk: {str(e)}")
            return {}

    def _normalize_emotion_label(self, label: str) -> str:
        normalized = label.lower().strip()
        if normalized.startswith("label_"):
            return "neutral"
        return normalized

    def _aggregate_chunk_scores(self, text: str) -> Dict[str, float]:
        words = text.split()
        if not words:
            return {}

        # Prefer one full-context pass for short/medium inputs.
        if len(words) <= self.words_per_chunk:
            return self._classify_text(text)

        chunks = self._split_into_chunks(text)

        totals: Dict[str, float] = {}
        total_weight = 0.0
        for chunk in chunks:
            scores = self._classify_text(chunk)
            word_count = max(1, len(chunk.split()))
            weight = float(word_count)
            total_weight += weight
            for label, score in scores.items():
                totals[label] = totals.get(label, 0.0) + (score * weight)

        if total_weight <= 0:
            return {}
        return {label: value / total_weight for label, value in totals.items()}

    def _aggregate_timeline_scores(self, emotional_arc: List[Dict]) -> Dict[str, float]:
        if not emotional_arc:
            return {}

        totals: Dict[str, float] = {}
        for entry in emotional_arc:
            label = str(entry.get("emotion", "neutral")).lower()
            score = float(entry.get("confidence", 0.0))
            totals[label] = totals.get(label, 0.0) + max(0.05, score)

        total = sum(totals.values())
        if total <= 0:
            return {}
        return {label: value / total for label, value in totals.items()}

    def _combine_scores(
        self,
        full_text_scores: Dict[str, float],
        timeline_scores: Dict[str, float],
        timeline_points: int = 0
    ) -> Dict[str, float]:
        labels = set(full_text_scores.keys()) | set(timeline_scores.keys())
        if not labels:
            return {}

        # Full-text aggregation should dominate; timeline is auxiliary.
        if timeline_points >= 20:
            full_weight = 0.85
            timeline_weight = 0.15
        elif timeline_points >= 5:
            full_weight = 0.9
            timeline_weight = 0.1
        else:
            full_weight = 0.95
            timeline_weight = 0.05

        combined: Dict[str, float] = {}
        for label in labels:
            combined[label] = (
                full_weight * full_text_scores.get(label, 0.0)
                + timeline_weight * timeline_scores.get(label, 0.0)
            )

        # Normalize for easier interpretation.
        total = sum(combined.values())
        if total > 0:
            combined = {label: value / total for label, value in combined.items()}
        return combined

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
            
            # Reduce very long documents into bounded timeline windows.
            window_size = max(1, math.ceil(len(sentences) / self.max_timeline_points))

            for index, sentence_start in enumerate(range(0, len(sentences), window_size)):
                window_sentences = sentences[sentence_start:sentence_start + window_size]
                if not window_sentences:
                    continue

                sentence_block = " ".join(window_sentences).strip()
                if len(sentence_block) < 3:
                    continue

                try:
                    scores = self._classify_text(sentence_block)
                    if scores:
                        emotion = max(scores, key=scores.get)
                        confidence = scores[emotion]
                    else:
                        emotion = "neutral"
                        confidence = 0.0
                    
                    emotional_arc.append({
                        "index": index,
                        "start": sentence_start,
                        "end": min(len(sentences), sentence_start + window_size),
                        "text": sentence_block[:200],  # Limit text length for readability
                        "emotion": emotion,
                        "confidence": round(confidence, 3)
                    })
                except Exception as e:
                    logger.warning(f"Error analyzing sentence {index}: {str(e)}")
                    # Add neutral entry for failed sentences
                    emotional_arc.append({
                        "index": index,
                        "start": sentence_start,
                        "end": min(len(sentences), sentence_start + window_size),
                        "text": sentence_block[:200],
                        "emotion": "neutral",
                        "confidence": 0.0
                    })
            
            return emotional_arc
        except Exception as e:
            logger.error(f"Error generating emotional arc: {str(e)}")
            return []
