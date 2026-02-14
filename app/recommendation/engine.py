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

        for movie in self.movies:
            score = 0

            # Genre match
            if dominant_genre and dominant_genre in movie["genres"]:
                score += 4

            # Mood match
            if mood and mood in movie["mood_tags"]:
                score += 5

            # Intensity match
            if intensity and intensity == movie["intensity"]:
                score += 2

            # Energy match
            if energy_level and energy_level == movie["energy_level"]:
                score += 2

            # Industry filter
            if industry_preference:
                if movie["industry"] != industry_preference:
                    continue
                else:
                    score += 1

            scored_movies.append((movie, score))

        # Sort by score descending
        scored_movies.sort(key=lambda x: x[1], reverse=True)

        # Return top_k movies with score > 0
        results = [
            {
                "title": movie["title"],
                "year": movie["year"],
                "industry": movie["industry"],
                "score": score
            }
            for movie, score in scored_movies
            if score > 0
        ]

        return results[:top_k]
