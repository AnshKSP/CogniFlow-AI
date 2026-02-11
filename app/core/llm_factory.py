from app.config.settings import settings
from app.llm.local_llm import LocalLLM
from app.llm.api_llm import APILLM

def get_llm(llm_type: str = "local", api_key: str = None):
    if llm_type == "local":
        return LocalLLM(settings.OLLAMA_MODEL)

    elif llm_type == "api":
        if not api_key:
            raise ValueError("API key required for API LLM.")
        return APILLM(settings.API_MODEL_NAME, api_key)

    else:
        raise ValueError("Invalid llm_type. Use 'local' or 'api'.")
