from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database.database import Base


class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf / image
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String, nullable=False)
    source_type = Column(String, nullable=False)  # script / video
    dominant_genre = Column(String)
    mood = Column(String)
    intensity = Column(String)
    energy_level = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id = Column(Integer, primary_key=True, index=True)
    request_summary = Column(Text)
    results = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
