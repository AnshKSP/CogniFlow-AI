import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    LLM_MODE: str = os.getenv("LLM_MODE", "local")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3:8b")
    API_MODEL_NAME: str = os.getenv("API_MODEL_NAME", "gpt-4")

settings = Settings()
