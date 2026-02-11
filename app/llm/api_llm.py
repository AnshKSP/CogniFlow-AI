from .base import BaseLLM

class APILLM(BaseLLM):
    def __init__(self, model_name: str, api_key: str):
        self.model = model_name
        self.api_key = api_key

    def generate(self, prompt: str) -> str:
        raise RuntimeError(
            "API LLM not implemented yet. Provide integration logic."
        )
