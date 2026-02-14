from app.database.database import SessionLocal
from app.database.models import UploadedDocument

db = SessionLocal()

docs = db.query(UploadedDocument).all()

print("Uploaded Documents:")
for doc in docs:
    print(doc.id, doc.filename, doc.file_type, doc.uploaded_at)

db.close()
