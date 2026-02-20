from fastapi import FastAPI, HTTPException, Body
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
from app.database.models import UploadedDocument

from app.video.pipeline import VideoPipeline
from app.video.script_analyzer import ScriptAnalyzer
from app.script.pdf_loader import PDFLoader
from app.script.report_generator import ReportGenerator
from app.script.script_pipeline import ScriptPipeline
from fastapi.responses import Response, StreamingResponse
video_pipeline = VideoPipeline()
script_analyzer = ScriptAnalyzer()
pdf_loader = PDFLoader()
report_generator = ReportGenerator()
script_pipeline = ScriptPipeline()


models.Base.metadata.create_all(bind=engine)

MAX_PDF_SIZE = 25 * 1024 * 1024  # 25 MB
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg"}

app = FastAPI(title="CogniFlow AI - Multi-Mode Backend")

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

    return {
        "language_detected": result["transcript"]["language"],
        "confidence": result["transcript"].get("confidence", None),
        "transcript_preview": result["transcript"]["full_text"][:500],
        "audio_emotion": {
            "dominant_mood": result["audio_emotion"]["dominant_mood"],
            "emotional_arc": result["audio_emotion"]["emotional_arc"]
        },
        "script_emotion": {
            "dominant_mood": result["script_emotion"]["dominant_mood"],
            "emotional_arc": result["script_emotion"]["emotional_arc"]
        }
    }


@app.post("/video/youtube")
def youtube_video(url: str):

    result = video_pipeline.process_youtube(url)

    return {
        "language_detected": result["transcript"]["language"],
        "confidence": result["transcript"].get("confidence", None),
        "transcript_preview": result["transcript"]["full_text"][:500],
        "audio_emotion": {
            "dominant_mood": result["audio_emotion"]["dominant_mood"],
            "emotional_arc": result["audio_emotion"]["emotional_arc"]
        },
        "script_emotion": {
            "dominant_mood": result["script_emotion"]["dominant_mood"],
            "emotional_arc": result["script_emotion"]["emotional_arc"]
        }
    }


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
        
        # Generate emotion summary
        emotion_summary = f"The script expresses {emotion_label} with {confidence*100:.1f}% confidence."
        
        return {
            "emotion_label": emotion_label,
            "dominant_mood": dominant_mood,
            "confidence": confidence,
            "emotional_arc": emotional_arc,
            "emotion_summary": emotion_summary
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
        
        # Generate emotion summary
        emotion_summary = f"The script expresses {emotion_label} with {confidence*100:.1f}% confidence."
        
        return {
            "emotion_label": emotion_label,
            "dominant_mood": dominant_mood,
            "confidence": confidence,
            "emotional_arc": emotional_arc,
            "emotion_summary": emotion_summary,
            "script_preview": extracted_text[:500]  # Preview of extracted text
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

        # Generate PDF report
        pdf_buffer = report_generator.generate_report(
            script_preview=text,
            emotion_label=emotion_label,
            confidence=confidence,
            emotional_arc=emotional_arc,
            intensity_level=None
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

        # Generate PDF report
        pdf_buffer = report_generator.generate_report(
            script_preview=text,
            emotion_label=emotion_label,
            confidence=confidence,
            emotional_arc=emotional_arc,
            intensity_level=None
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
