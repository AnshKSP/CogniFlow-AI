import html
import json
import os


class RecommendationEngine:
    def __init__(self):
        db_path = os.path.join(os.path.dirname(__file__), "movie_db.json")
        with open(db_path, "r", encoding="utf-8-sig") as f:
            self.movies = json.load(f)

    def recommend(
        self,
        dominant_genre=None,
        mood=None,
        intensity=None,
        energy_level=None,
        industry_preference=None,
        top_k=12
    ):
        scored_movies = []
        has_any_filter = any([dominant_genre, mood, intensity, energy_level, industry_preference])

        genre_value = self._norm(dominant_genre)
        mood_value = self._norm(mood)
        intensity_value = self._norm(intensity)
        energy_value = self._norm(energy_level)
        industry_value = self._norm(industry_preference)

        for movie in self.movies:
            score = 0
            movie_genres = [self._norm(g) for g in self._as_list(movie.get("genres"))]
            movie_moods = [self._norm(m) for m in self._as_list(movie.get("mood_tags"))]
            movie_intensity = self._norm(movie.get("intensity"))
            movie_energy = self._norm(movie.get("energy_level"))
            movie_industry = self._norm(movie.get("industry"))

            # Genre match
            if genre_value and genre_value in movie_genres:
                score += 4

            # Mood match
            if mood_value:
                expanded_moods = self._expand_mood_aliases(mood_value)
                mood_hits = sum(1 for tag in expanded_moods if tag in movie_moods)
                score += mood_hits * 3

            # Intensity match
            if intensity_value and intensity_value == movie_intensity:
                score += 2

            # Energy match
            if energy_value and energy_value == movie_energy:
                score += 2

            # Industry filter
            if industry_value:
                if movie_industry != industry_value:
                    continue
                else:
                    score += 1

            # If no filters are provided, keep movies with a small baseline score.
            if not has_any_filter:
                score = 1

            rating_bonus = self._safe_float(movie.get("rating"), 0.0)
            scored_movies.append((movie, score, rating_bonus))

        # Sort by score descending, then by rating when scores tie.
        scored_movies.sort(key=lambda x: (x[1], x[2]), reverse=True)

        # Return top_k movies with score > 0
        results = [
            {
                "title": self._clean_text(movie["title"]),
                "year": movie.get("year"),
                "release_date": movie.get("release_date"),
                "industry": movie.get("industry"),
                "genre": self._first_or_none(movie.get("genres")),
                "genres": self._as_list(movie.get("genres")),
                "description": self._build_description(movie),
                "poster": movie.get("poster"),
                "director": self._clean_text(movie.get("director")),
                "cast": [self._clean_text(name) for name in self._as_list(movie.get("cast"))[:3]],
                "runtime": movie.get("runtime"),
                "language": movie.get("language"),
                "certificate": movie.get("certificate"),
                "rating": movie.get("rating"),
                "where_to_watch": [self._format_label(platform) for platform in self._as_list(movie.get("where_to_watch"))[:3]],
                "availability_note": movie.get("availability_note"),
                "score": score
            }
            for movie, score, _ in scored_movies
            if score > 0
        ]

        return results[:top_k]

    def _norm(self, value):
        return str(value).strip().lower().replace("_", " ") if value is not None else ""

    def _safe_float(self, value, default=0.0):
        try:
            return float(value)
        except Exception:
            return default

    def _as_list(self, value):
        if value is None:
            return []
        if isinstance(value, list):
            return value
        if isinstance(value, tuple):
            return list(value)
        if isinstance(value, str):
            return [value]
        if isinstance(value, dict):
            values = [item for item in value.values() if item]
            if not values:
                return []
            if all(isinstance(item, str) for item in values):
                return values
            return [str(item) for item in values]
        return [value]

    def _first_or_none(self, value):
        items = self._as_list(value)
        return items[0] if items else None

    def _format_label(self, value):
        text = str(value or "").strip()
        if not text:
            return text
        return text.title()

    def _clean_text(self, value):
        if value is None:
            return None
        return html.unescape(str(value))

    def _expand_mood_aliases(self, mood):
        mood_aliases = {
            "calm": ["light", "inspiring", "emotional"],
            "dramatic": ["suspenseful", "intense", "emotional"],
            "energetic": ["uplifting", "motivational", "light"],
            "intense": ["intense", "dark", "suspenseful"],
            "dark": ["dark", "suspenseful", "intense"]
        }
        aliases = mood_aliases.get(mood, [mood])
        # Include original mood itself for direct matching.
        if mood not in aliases:
            aliases.append(mood)
        return aliases

    def _build_description(self, movie):
        parts = []
        if movie.get("description"):
            parts.append(self._clean_text(movie["description"]))
        if movie.get("director"):
            parts.append(f"Directed by {self._clean_text(movie['director'])}")
        genres = self._as_list(movie.get("genres"))
        if genres:
            parts.append(f"Genres: {', '.join(str(item) for item in genres[:2])}")
        if movie.get("industry"):
            parts.append(f"Industry: {movie['industry']}")
        return " | ".join(parts) if parts else "Recommended based on your selected emotional profile."
