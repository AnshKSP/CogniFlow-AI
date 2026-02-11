import faiss
import numpy as np

class FAISSStore:
    def __init__(self, dim: int = 384):
        self.index = faiss.IndexFlatL2(dim)
        self.metadata = []  # store chunk info

    def add(self, embeddings, metadatas):
        embeddings = np.array(embeddings).astype("float32")
        self.index.add(embeddings)
        self.metadata.extend(metadatas)

    def search(self, query_embedding, top_k: int = 4):
        query_embedding = np.array([query_embedding]).astype("float32")
        distances, indices = self.index.search(query_embedding, top_k)

        results = []
        for idx in indices[0]:
            if idx < len(self.metadata):
                results.append(self.metadata[idx])

        return results
    def reset(self):
        self.index.reset()
        self.metadata = []
