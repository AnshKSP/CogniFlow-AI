from fastapi import FastAPI, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.core.llm_factory import get_llm
from fastapi import UploadFile, File
import os

from app.rag.embedder import Embedder
from app.rag.vector_store import FAISSStore
from app.rag.retriever import Retriever
from app.rag.pipeline import RAGPipeline


app = FastAPI(title="CogniFlow AI - Multi-Mode Backend")

# RAG components (global in-memory)
embedder = Embedder()
vector_store = FAISSStore(dim=384)
retriever = Retriever(embedder, vector_store)
rag_pipeline = RAGPipeline(embedder, vector_store)

UPLOAD_FOLDER = "uploaded_docs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
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
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        rag_pipeline.index_pdf(file_path, file.filename)

        return {"message": f"{file.filename} indexed successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
from pydantic import BaseModel

class RAGQueryRequest(BaseModel):
    question: str
    llm_type: str = "local"
    api_key: str | None = None


@app.post("/rag-query")
def rag_query(request: RAGQueryRequest):
    try:
        llm = get_llm(request.llm_type, request.api_key)

        answer, citations = rag_pipeline.query(
            request.question,
            retriever,
            llm
        )

        return {
            "answer": answer,
            "citations": citations
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/clear-index")
def clear_index():
    try:
        vector_store.reset()
        return {"message": "RAG index cleared successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/list-documents")
def list_documents():
    try:
        docs = list({item["source"] for item in vector_store.metadata})
        return {"documents": docs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
