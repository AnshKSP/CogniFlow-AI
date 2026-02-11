from app.rag.pdf_loader import load_pdf
from app.rag.text_splitter import split_text

class RAGPipeline:
    def __init__(self, embedder, store):
        self.embedder = embedder
        self.store = store

    def index_pdf(self, file_path: str, filename: str):
        pages = load_pdf(file_path)

        all_chunks = []
        all_metadata = []

        for page in pages:
            chunks = split_text(page["text"])

            for chunk in chunks:
                all_chunks.append(chunk)
                all_metadata.append({
                    "text": chunk,
                    "source": filename,
                    "page": page["page"]
                })

        embeddings = self.embedder.embed(all_chunks)
        self.store.add(embeddings, all_metadata)

    def query(self, question: str, retriever, llm, top_k: int = 4):
        results = retriever.retrieve(question, top_k)

        if not results:
            return "No relevant information found.", []

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
{question}
"""

        answer = llm.generate(prompt)

        return answer, citations
