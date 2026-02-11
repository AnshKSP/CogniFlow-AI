class Retriever:
    def __init__(self, embedder, store):
        self.embedder = embedder
        self.store = store

    def retrieve(self, query: str, top_k: int = 4):
        query_embedding = self.embedder.embed([query])[0]
        return self.store.search(query_embedding, top_k)
