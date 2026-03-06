from fastapi import FastAPI, HTTPException, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from app.recommendation.engine import RecommendationEngine

from app.schemas.chat import ChatRequest, ChatResponse
from app.core.llm_factory import get_llm
from fastapi import UploadFile, File, HTTPException
import os
from app.rag.image_loader import ImageLoader
from app.rag.text_splitter import split_text

from app.rag.embedder import Embedder
from app.rag.vector_store import FAISSStore
from app.rag.retriever import Retriever
from app.rag.pipeline import RAGPipeline

from app.database.database import engine, SessionLocal
from app.database import models
from app.database.models import UploadedDocument, User, AuthSession
from app.schemas.auth import SignupRequest, LoginRequest, AuthResponse
from app.core.auth_utils import hash_password, verify_password, create_session_token

from app.video.pipeline import VideoPipeline
from app.script.pdf_loader import PDFLoader
from app.script.report_generator import ReportGenerator
from app.script.script_pipeline import ScriptPipeline
from fastapi.responses import Response, StreamingResponse
video_pipeline = VideoPipeline()
pdf_loader = PDFLoader()
report_generator = ReportGenerator()
script_pipeline = ScriptPipeline()


models.Base.metadata.create_all(bind=engine)

MAX_PDF_SIZE = 25 * 1024 * 1024  # 25 MB
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg"}

app = FastAPI(title="CogniFlow AI - Multi-Mode Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# RAG components (global in-memory)
embedder = Embedder()
vector_store = FAISSStore(dim=384)
retriever = Retriever(embedder, vector_store)
rag_pipeline = RAGPipeline(embedder, vector_store)

UPLOAD_FOLDER = "uploaded_docs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
image_loader = ImageLoader()

@app.get("/")
def root():
    return {"status": "Server running"}


def _validate_email(email: str) -> str:
    normalized = email.strip().lower()
    if "@" not in normalized or "." not in normalized.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Invalid email format.")
    return normalized


def _get_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header.")
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
        raise HTTPException(status_code=401, detail="Invalid Authorization header.")
    return parts[1].strip()


@app.post("/auth/signup", response_model=AuthResponse)
def signup(request: SignupRequest):
    full_name = request.full_name.strip()
    if len(full_name) < 2:
        raise HTTPException(status_code=400, detail="Full name must be at least 2 characters.")
    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    email = _validate_email(request.email)
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered.")

        user = User(
            full_name=full_name,
            email=email,
            password_hash=hash_password(request.password)
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_session_token()
        db.add(AuthSession(user_id=user.id, token=token))
        db.commit()

        return AuthResponse(token=token, full_name=user.full_name, email=user.email)
    finally:
        db.close()


@app.post("/auth/login", response_model=AuthResponse)
def login(request: LoginRequest):
    email = _validate_email(request.email)
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(request.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        token = create_session_token()
        db.add(AuthSession(user_id=user.id, token=token))
        db.commit()

        return AuthResponse(token=token, full_name=user.full_name, email=user.email)
    finally:
        db.close()


@app.get("/auth/me")
def auth_me(authorization: str | None = Header(default=None)):
    token = _get_token(authorization)
    db = SessionLocal()
    try:
        session = db.query(AuthSession).filter(AuthSession.token == token).first()
        if not session:
            raise HTTPException(status_code=401, detail="Invalid or expired session.")
        user = db.query(User).filter(User.id == session.user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found.")
        return {"full_name": user.full_name, "email": user.email}
    finally:
        db.close()


@app.post("/auth/logout")
def logout(authorization: str | None = Header(default=None)):
    token = _get_token(authorization)
    db = SessionLocal()
    try:
        session = db.query(AuthSession).filter(AuthSession.token == token).first()
        if session:
            db.delete(session)
            db.commit()
        return {"message": "Logged out successfully."}
    finally:
        db.close()

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        llm = get_llm(request.llm_type, request.api_key)
        result = llm.generate(request.message)
        return ChatResponse(response=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        # Validate extension
        if not file.filename.lower().endswith(".pdf"):
            raise ValueError("Only PDF files are allowed.")

        content = await file.read()

        # Validate size
        if len(content) > MAX_PDF_SIZE:
            raise ValueError("PDF exceeds 25MB size limit.")

        file_path = os.path.join(UPLOAD_FOLDER, file.filename)

        with open(file_path, "wb") as f:
            f.write(content)

        rag_pipeline.index_pdf(file_path, file.filename)

        from app.database.database import SessionLocal
        from app.database.models import UploadedDocument

        db = SessionLocal()

        new_doc = UploadedDocument(
            filename=file.filename,
            file_type="pdf"
        )

        db.add(new_doc)
        db.commit()
        db.close()

        return {"message": f"{file.filename} indexed successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel

class RAGQueryRequest(BaseModel):
    question: str
    mode: str = "strict"   # "strict" or "solve"
    llm_type: str = "local"
    api_key: str | None = None



@app.post("/rag-query")
def rag_query(request: RAGQueryRequest):
    try:
        llm = get_llm(request.llm_type, request.api_key)

        # Retrieve chunks
        if request.mode == "strict":
            results = retriever.retrieve(request.question, top_k=4)
        elif request.mode == "solve":
            results = retriever.retrieve(request.question, top_k=3)
        else:
            raise ValueError("Invalid mode. Use 'strict' or 'solve'.")

        if not results:
            return {
                "answer": "Information not available in the uploaded documents.",
                "citations": []
            }

        context_blocks = []
        citations = []

        for r in results:
            context_blocks.append(
                f"(Source: {r['source']}, Page {r['page']})\n{r['text']}"
            )
            citations.append({
                "source": r["source"],
                "page": r["page"]
            })

        context = "\n\n".join(context_blocks)

        if request.mode == "strict":
            prompt = f"""
You are a strict document-based assistant.

Rules:
- Answer ONLY using the provided context.
- Do NOT use outside knowledge.
- If the answer is not clearly present in the context, respond exactly with:
  "Information not available in the uploaded documents."
- Do NOT guess.
- Do NOT fabricate details.

Context:
{context}

Question:
{request.question}
"""
        else:  # solve mode
            prompt = f"""
You are solving a problem extracted from a document.

Below is the relevant content retrieved from the document:

{context}

Instructions:
- Identify the problem or question.
- Solve it step-by-step.
- Clearly explain reasoning.
- Base your reasoning on the retrieved content.
- If insufficient information exists, say so.
- Mention that the solution is derived from the document context.

User Request:
{request.question}
"""

        answer = llm.generate(prompt)

        return {
            "answer": answer,
            "citations": citations
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    mode: str = "index",   # "index" or "solve"
    llm_type: str = "local",
    api_key: str | None = None
):
    try:
        file_extension = os.path.splitext(file.filename)[1].lower()

        if file_extension not in ALLOWED_IMAGE_EXTENSIONS:
            raise ValueError("Only PNG, JPG, and JPEG images are allowed.")

        content = await file.read()

        if len(content) > MAX_IMAGE_SIZE:
            raise ValueError("Image exceeds 10MB size limit.")

        file_path = os.path.join(UPLOAD_FOLDER, file.filename)

        with open(file_path, "wb") as f:
            f.write(content)

        extracted_text = image_loader.extract_text(file_path)

        if not extracted_text:
            raise ValueError("No readable text found in image.")

        if mode == "index":

            db = SessionLocal()

            new_doc = UploadedDocument(
                filename=file.filename,
                file_type="image"
            )
            db.add(new_doc)
            db.commit()
            db.close()

            chunks = split_text(extracted_text)
            embeddings = embedder.embed(chunks)

            metadata = [
                {
                    "text": chunk,
                    "source": file.filename,
                    "page": 1
                }
                for chunk in chunks
            ]

            vector_store.add(embeddings, metadata)

            return {"message": "Image indexed successfully."}

        elif mode == "solve":
            llm = get_llm(llm_type, api_key)

            prompt = f"""
Below is text extracted from an image:

{extracted_text}

Instructions:
- Identify the problem.
- Solve it step-by-step.
- Explain reasoning clearly.
- Mention that the solution is derived from OCR-extracted content.
"""

            answer = llm.generate(prompt)

            return {
                "answer": answer,
                "note": "Solution derived from OCR-extracted image text."
            }

        else:
            raise ValueError("Invalid mode. Use 'index' or 'solve'.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/clear-index")
def clear_index():
    try:
        vector_store.reset()
        return {
            "message": "RAG index cleared successfully.",
            "total_documents": 0,
            "total_chunks": 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/list-documents")
def list_documents():
    try:
        sources = list({item["source"] for item in vector_store.metadata})
        return {
            "documents": sources,
            "total_documents": len(sources),
            "total_chunks": len(vector_store.metadata)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/index-stats")
def index_stats():
    try:
        return {
            "total_chunks": len(vector_store.metadata),
            "unique_documents": len({item["source"] for item in vector_store.metadata})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

recommendation_engine = RecommendationEngine()
class RecommendationRequest(BaseModel):
    dominant_genre: str | None = None
    mood: str | None = None
    intensity: str | None = None
    energy_level: str | None = None
    industry_preference: str | None = None


def _safe_float(value, default: float = 0.0) -> float:
    try:
        return float(value)
    except Exception:
        return default


def _confidence_to_intensity(confidence: float) -> str:
    score = _safe_float(confidence, 0.0)
    # If confidence is 0-1, normalize to percentage-like scale.
    if 0.0 <= score <= 1.0:
        score = score * 100.0

    if score >= 80:
        return "high"
    if score >= 60:
        return "medium"
    return "low"


def _recommend_for_mood(dominant_mood: str, intensity_level: str):
    try:
        return recommendation_engine.recommend(
            dominant_genre=None,
            mood=dominant_mood,
            intensity=intensity_level,
            energy_level=None,
            industry_preference=None
        )
    except Exception:
        return []


def _normalize_top_emotions(value) -> list[dict]:
    if not isinstance(value, list):
        return []

    normalized: list[dict] = []
    for item in value[:3]:
        if not isinstance(item, dict):
            continue
        normalized.append({
            "emotion": str(item.get("emotion", "neutral")).lower(),
            "score": _safe_float(item.get("score", 0.0), 0.0)
        })
    return normalized


@app.post("/recommend")
def recommend_movies(request: RecommendationRequest):
    try:
        results = recommendation_engine.recommend(
            dominant_genre=request.dominant_genre,
            mood=request.mood,
            intensity=request.intensity,
            energy_level=request.energy_level,
            industry_preference=request.industry_preference
        )
        from app.database.models import RecommendationHistory
        import json

        db = SessionLocal()

        history_entry = RecommendationHistory(
            request_summary=json.dumps(request.dict()),
            results=json.dumps(results)
        )

        db.add(history_entry)
        db.commit()
        db.close()

        return {
            "recommendations": results,
            "total_returned": len(results)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import UploadFile, File, HTTPException
import os

@app.post("/video/upload")
async def upload_video(file: UploadFile = File(...)):
    folder = "uploaded_videos"
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, file.filename)

    content = await file.read()
    with open(path, "wb") as f:
        f.write(content)

    result = video_pipeline.process_uploaded_video(path)

    dominant_mood = result.get("script_emotion", {}).get("dominant_mood", "calm")
    intensity_level = result.get("audio_emotion", {}).get("intensity_level", "medium")
    confidence = _safe_float(result.get("script_emotion", {}).get("confidence", 0.0), 0.0)
    top_emotions = _normalize_top_emotions(result.get("script_emotion", {}).get("top_emotions", []))
    dominance_gap = _safe_float(result.get("script_emotion", {}).get("dominance_gap", 0.0), 0.0)
    recommendations = _recommend_for_mood(dominant_mood, intensity_level)

    return {
        "dominant_mood": dominant_mood,
        "intensity_level": intensity_level,
        "confidence": confidence,
        "top_emotions": top_emotions,
        "dominance_gap": dominance_gap,
        "emotional_arc": result.get("script_emotion", {}).get("emotional_arc", []),
        "recommendations": recommendations,
        "language_detected": result["transcript"]["language"],
        "transcript_confidence": result["transcript"].get("confidence", None),
        "transcript_preview": result["transcript"]["full_text"][:500],
        "audio_emotion": {
            "dominant_mood": result["audio_emotion"]["dominant_mood"],
            "intensity_level": result["audio_emotion"].get("intensity_level", intensity_level),
            "emotional_arc": result["audio_emotion"]["emotional_arc"]
        },
        "script_emotion": {
            "emotion_label": result["script_emotion"].get("emotion_label", "neutral"),
            "confidence": result["script_emotion"].get("confidence", confidence),
            "top_emotions": top_emotions,
            "dominance_gap": dominance_gap,
            "dominant_mood": result["script_emotion"]["dominant_mood"],
            "emotional_arc": result["script_emotion"]["emotional_arc"]
        }
    }


@app.post("/video/upload-report")
async def upload_video_report(file: UploadFile = File(...)):
    """
    Upload a video and directly return a downloadable emotion report PDF.
    """
    try:
        folder = "uploaded_videos"
        os.makedirs(folder, exist_ok=True)
        path = os.path.join(folder, file.filename)

        content = await file.read()
        with open(path, "wb") as f:
            f.write(content)

        result = video_pipeline.process_uploaded_video(path)
        transcript_text = result.get("transcript", {}).get("full_text", "")
        script_emotion = result.get("script_emotion", {})
        audio_emotion = result.get("audio_emotion", {})

        pdf_buffer = report_generator.generate_report(
            script_preview=transcript_text or "No transcript available.",
            emotion_label=script_emotion.get("emotion_label", "neutral"),
            confidence=_safe_float(script_emotion.get("confidence", 0.0), 0.0),
            emotional_arc=script_emotion.get("emotional_arc", []),
            intensity_level=audio_emotion.get("intensity_level", None),
            top_emotions=_normalize_top_emotions(script_emotion.get("top_emotions", [])),
            dominance_gap=_safe_float(script_emotion.get("dominance_gap", 0.0), 0.0)
        )

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=video_emotion_report.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/video/youtube")
def youtube_video(url: str):

    result = video_pipeline.process_youtube(url)

    dominant_mood = result.get("script_emotion", {}).get("dominant_mood", "calm")
    intensity_level = result.get("audio_emotion", {}).get("intensity_level", "medium")
    confidence = _safe_float(result.get("script_emotion", {}).get("confidence", 0.0), 0.0)
    top_emotions = _normalize_top_emotions(result.get("script_emotion", {}).get("top_emotions", []))
    dominance_gap = _safe_float(result.get("script_emotion", {}).get("dominance_gap", 0.0), 0.0)
    recommendations = _recommend_for_mood(dominant_mood, intensity_level)

    return {
        "dominant_mood": dominant_mood,
        "intensity_level": intensity_level,
        "confidence": confidence,
        "top_emotions": top_emotions,
        "dominance_gap": dominance_gap,
        "emotional_arc": result.get("script_emotion", {}).get("emotional_arc", []),
        "recommendations": recommendations,
        "language_detected": result["transcript"]["language"],
        "transcript_confidence": result["transcript"].get("confidence", None),
        "transcript_preview": result["transcript"]["full_text"][:500],
        "audio_emotion": {
            "dominant_mood": result["audio_emotion"]["dominant_mood"],
            "intensity_level": result["audio_emotion"].get("intensity_level", intensity_level),
            "emotional_arc": result["audio_emotion"]["emotional_arc"]
        },
        "script_emotion": {
            "emotion_label": result["script_emotion"].get("emotion_label", "neutral"),
            "confidence": result["script_emotion"].get("confidence", confidence),
            "top_emotions": top_emotions,
            "dominance_gap": dominance_gap,
            "dominant_mood": result["script_emotion"]["dominant_mood"],
            "emotional_arc": result["script_emotion"]["emotional_arc"]
        }
    }


@app.post("/video/youtube-report")
def youtube_video_report(url: str):
    """
    Analyze a YouTube video URL and return a downloadable emotion report PDF.
    """
    try:
        if not url or not isinstance(url, str):
            raise ValueError("A valid YouTube URL is required.")

        result = video_pipeline.process_youtube(url)
        transcript_text = result.get("transcript", {}).get("full_text", "")
        script_emotion = result.get("script_emotion", {})
        audio_emotion = result.get("audio_emotion", {})

        pdf_buffer = report_generator.generate_report(
            script_preview=transcript_text or "No transcript available.",
            emotion_label=script_emotion.get("emotion_label", "neutral"),
            confidence=_safe_float(script_emotion.get("confidence", 0.0), 0.0),
            emotional_arc=script_emotion.get("emotional_arc", []),
            intensity_level=audio_emotion.get("intensity_level", None),
            top_emotions=_normalize_top_emotions(script_emotion.get("top_emotions", [])),
            dominance_gap=_safe_float(script_emotion.get("dominance_gap", 0.0), 0.0)
        )

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=youtube_video_emotion_report.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ScriptAnalyzeRequest(BaseModel):
    text: str


@app.post("/script/analyze")
def analyze_script(request: ScriptAnalyzeRequest):
    """
    Standalone script emotion analysis endpoint with sentence-level timeline.
    Analyzes text emotion without requiring video processing.
    """
    try:
        if not request.text or not isinstance(request.text, str):
            raise ValueError("Text is required and must be a string")
        
        # Analyze script emotion with timeline using ScriptPipeline
        result = script_pipeline.analyze_with_timeline(request.text)
        emotion_label = result.get("emotion_label", "neutral")
        confidence = result.get("confidence", 0.0)
        emotional_arc = result.get("emotional_arc", [])
        top_emotions = _normalize_top_emotions(result.get("top_emotions", []))
        dominance_gap = _safe_float(result.get("dominance_gap", 0.0), 0.0)
        
        # Map emotion_label to dominant_mood using existing mapping
        emotion_to_mood = {
            "sadness": "dark",
            "anger": "intense",
            "joy": "energetic",
            "fear": "dramatic",
            "surprise": "dramatic",
            "disgust": "dark",
            "neutral": "calm"
        }
        
        dominant_mood = emotion_to_mood.get(emotion_label.lower(), "calm")
        
        intensity_level = _confidence_to_intensity(confidence)
        recommendations = _recommend_for_mood(dominant_mood, intensity_level)

        # Generate emotion summary
        emotion_summary = f"The script expresses {emotion_label} with {confidence*100:.1f}% confidence."
        
        return {
            "emotion_label": emotion_label,
            "dominant_mood": dominant_mood,
            "intensity_level": intensity_level,
            "confidence": confidence,
            "top_emotions": top_emotions,
            "dominance_gap": dominance_gap,
            "emotional_arc": emotional_arc,
            "emotion_summary": emotion_summary,
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/script/upload-pdf")
async def upload_script_pdf(file: UploadFile = File(...)):
    """
    Upload PDF script and analyze emotion.
    Extracts text from PDF and performs emotion analysis.
    """
    try:
        # Validate extension
        if not file.filename.lower().endswith(".pdf"):
            raise ValueError("Only PDF files are allowed.")
        
        # Save uploaded file temporarily
        upload_folder = "uploaded_scripts"
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, file.filename)
        
        content = await file.read()
        
        # Validate size (25 MB limit)
        if len(content) > MAX_PDF_SIZE:
            raise ValueError("PDF exceeds 25MB size limit.")
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Extract text from PDF
        extracted_text = pdf_loader.extract_text(file_path)
        
        if not extracted_text:
            raise ValueError("No text content found in PDF.")
        
        # Analyze script emotion with timeline
        result = script_pipeline.analyze_with_timeline(extracted_text)
        emotion_label = result.get("emotion_label", "neutral")
        confidence = result.get("confidence", 0.0)
        emotional_arc = result.get("emotional_arc", [])
        top_emotions = _normalize_top_emotions(result.get("top_emotions", []))
        dominance_gap = _safe_float(result.get("dominance_gap", 0.0), 0.0)
        
        # Map emotion_label to dominant_mood
        emotion_to_mood = {
            "sadness": "dark",
            "anger": "intense",
            "joy": "energetic",
            "fear": "dramatic",
            "surprise": "dramatic",
            "disgust": "dark",
            "neutral": "calm"
        }
        
        dominant_mood = emotion_to_mood.get(emotion_label.lower(), "calm")
        
        intensity_level = _confidence_to_intensity(confidence)
        recommendations = _recommend_for_mood(dominant_mood, intensity_level)

        # Generate emotion summary
        emotion_summary = f"The script expresses {emotion_label} with {confidence*100:.1f}% confidence."
        
        return {
            "emotion_label": emotion_label,
            "dominant_mood": dominant_mood,
            "intensity_level": intensity_level,
            "confidence": confidence,
            "top_emotions": top_emotions,
            "dominance_gap": dominance_gap,
            "emotional_arc": emotional_arc,
            "emotion_summary": emotion_summary,
            "script_preview": extracted_text[:500],  # Preview of extracted text
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/script/upload-pdf-report")
async def upload_pdf_report(file: UploadFile = File(...)):
    """
    Upload a PDF and directly return a downloadable emotion report PDF.
    """
    try:
        # Validate extension
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise ValueError("Only PDF files are allowed.")

        # Save uploaded file temporarily
        upload_folder = "uploaded_scripts"
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, file.filename)

        content = await file.read()

        # Validate size (25 MB limit)
        if len(content) > MAX_PDF_SIZE:
            raise ValueError("PDF exceeds 25MB size limit.")

        with open(file_path, "wb") as f:
            f.write(content)

        # Extract text from PDF
        text = pdf_loader.extract_text(file_path)
        if not text:
            raise ValueError("No text content found in PDF.")

        # Run script analysis with timeline
        result = script_pipeline.analyze_with_timeline(text)
        emotion_label = result.get("emotion_label", "neutral")
        confidence = result.get("confidence", 0.0)
        emotional_arc = result.get("emotional_arc", [])
        top_emotions = _normalize_top_emotions(result.get("top_emotions", []))
        dominance_gap = _safe_float(result.get("dominance_gap", 0.0), 0.0)

        # Generate PDF report
        pdf_buffer = report_generator.generate_report(
            script_preview=text,
            emotion_label=emotion_label,
            confidence=confidence,
            emotional_arc=emotional_arc,
            intensity_level=None,
            top_emotions=top_emotions,
            dominance_gap=dominance_gap
        )

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=pdf_emotion_report.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/script/generate-report")
async def generate_script_report(data: dict = Body(...)):
    """
    Generate downloadable PDF emotion analysis report.
    """
    try:
        # Extract text from request body
        text = data.get("text")

        if not text or not isinstance(text, str):
            return {"error": "Text is required"}

        # Run script analysis with timeline using ScriptPipeline
        result = script_pipeline.analyze_with_timeline(text)
        emotion_label = result.get("emotion_label", "neutral")
        confidence = result.get("confidence", 0.0)
        emotional_arc = result.get("emotional_arc", [])
        top_emotions = _normalize_top_emotions(result.get("top_emotions", []))
        dominance_gap = _safe_float(result.get("dominance_gap", 0.0), 0.0)

        # Generate PDF report
        pdf_buffer = report_generator.generate_report(
            script_preview=text,
            emotion_label=emotion_label,
            confidence=confidence,
            emotional_arc=emotional_arc,
            intensity_level=None,
            top_emotions=top_emotions,
            dominance_gap=dominance_gap
        )
        
        # Return PDF as downloadable file
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=emotion_report.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

