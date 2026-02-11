from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    message: str
    llm_type: Optional[str] = "local"
    api_key: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
