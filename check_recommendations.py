from app.database.database import SessionLocal
from app.database.models import RecommendationHistory

db = SessionLocal()

records = db.query(RecommendationHistory).all()

print("Recommendation History:")
for r in records:
    print(r.id, r.request_summary, r.results)

db.close()
