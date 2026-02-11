import ollama
from .base import BaseLLM

class LocalLLM(BaseLLM):
    def __init__(self, model_name: str):
        self.model = model_name

    def generate(self, prompt: str) -> str:
        try:
            response = ollama.chat(
                model=self.model,
                messages=[{"role": "user", "content": prompt}]
            )
            return response["message"]["content"]
        except Exception as e:
            raise RuntimeError(f"Local LLM error: {str(e)}")
