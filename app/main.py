from fastapi import FastAPI, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.core.llm_factory import get_llm

app = FastAPI(title="CogniFlow AI - Multi-Mode Backend")

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
