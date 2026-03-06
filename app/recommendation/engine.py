import json
import os


class RecommendationEngine:
    def __init__(self):
        db_path = os.path.join(os.path.dirname(__file__), "movie_db.json")
        with open(db_path, "r", encoding="utf-8") as f:
            self.movies = json.load(f)

    def recommend(
        self,
        dominant_genre=None,
        mood=None,
        intensity=None,
        energy_level=None,
        industry_preference=None,
        top_k=5
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
            movie_genres = [self._norm(g) for g in movie.get("genres", [])]
            movie_moods = [self._norm(m) for m in movie.get("mood_tags", [])]
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

            scored_movies.append((movie, score))

        # Sort by score descending
        scored_movies.sort(key=lambda x: x[1], reverse=True)

        # Return top_k movies with score > 0
        results = [
            {
                "title": movie["title"],
                "year": movie["year"],
                "industry": movie["industry"],
                "genre": movie["genres"][0] if movie.get("genres") else None,
                "description": self._build_description(movie),
                "poster": movie.get("poster"),
                "score": score
            }
            for movie, score in scored_movies
            if score > 0
        ]

        return results[:top_k]

    def _norm(self, value):
        return str(value).strip().lower() if value is not None else ""

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
        genres = ", ".join(movie.get("genres", [])[:2])
        moods = ", ".join(movie.get("mood_tags", [])[:3])
        parts = []
        if genres:
            parts.append(f"Genres: {genres}")
        if moods:
            parts.append(f"Mood tags: {moods}")
        if movie.get("industry"):
            parts.append(f"Industry: {movie['industry']}")
        return " | ".join(parts) if parts else "Recommended based on your selected emotional profile."
