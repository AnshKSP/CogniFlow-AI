from fastapi import FastAPI, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.core.llm_factory import get_llm
from fastapi import UploadFile, File
import os
from app.rag.image_loader import ImageLoader
from app.rag.text_splitter import split_text

from app.rag.embedder import Embedder
from app.rag.vector_store import FAISSStore
from app.rag.retriever import Retriever
from app.rag.pipeline import RAGPipeline

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

