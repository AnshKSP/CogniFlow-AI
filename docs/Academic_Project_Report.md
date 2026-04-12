# CogniFlow-AI Academic Project Report

## Abstract
CogniFlow-AI is a multi-modal artificial intelligence platform developed to unify conversational AI, document-based question answering, OCR-based image understanding, script and video emotion analysis, report generation, and recommendation support in a single application. The system uses a FastAPI backend and a React frontend to deliver an integrated user experience. It applies retrieval-augmented generation for document reasoning, transformer-based emotion classification for scripts and transcripts, audio intensity analysis for video content, and rule-based recommendation logic for media suggestions. The project demonstrates how multiple AI workflows can be combined effectively into a practical full-stack system.

## Introduction
Users today interact with many forms of unstructured data such as text, PDFs, images, scripts, and videos. However, most tools are specialized for only one type of input and do not provide a unified workflow. This creates difficulty for users who want one platform capable of answering questions from documents, understanding image content, analyzing media emotion, generating reports, and offering intelligent recommendations.

CogniFlow-AI was developed to solve this problem by creating a single system that supports multiple AI-driven tasks. The project focuses on usability, modularity, and practical application of modern AI techniques. It also demonstrates how backend intelligence services and frontend design can be combined into an end-to-end product.

## Methodology
The system follows a modular client-server architecture.

The frontend is built using React, TypeScript, and Vite. It includes separate pages for dashboard navigation, chatbot interaction, PDF analysis, image search, script analysis, video analysis, and movie recommendations.

The backend is built with FastAPI and organizes functionality into dedicated modules:

- `app/llm` for local and API-based LLM access
- `app/rag` for PDF ingestion, chunking, embedding, FAISS indexing, and retrieval
- `app/video` for YouTube download, audio extraction, transcription, script emotion classification, and audio intensity analysis
- `app/script` for script PDF loading, script analysis, and report generation
- `app/recommendation` for movie recommendation logic
- `app/database` for SQLite persistence and SQLAlchemy models

For document understanding, uploaded PDFs are processed page by page, split into chunks, embedded using sentence-transformer models, and stored in FAISS for retrieval. User queries are answered by combining retrieved context with either a local or API-based language model.

For image analysis, OCR is applied to extract readable text. The extracted content can either be indexed for later retrieval or directly solved using an LLM prompt.

For script and video emotion analysis, the system uses the `j-hartmann/emotion-english-distilroberta-base` transformer model to classify emotional tone from text. Emotional arc generation is performed at sentence-window level to provide timeline-like insights. In the case of videos, audio is extracted and analyzed with Librosa to estimate intensity level as low, medium, or high. Script emotion and audio intensity are then combined into a dominant mood classification.

For reporting, the system uses ReportLab to generate downloadable PDF reports containing script previews, emotional summaries, ranked emotions, and emotional arc breakdowns.

## Results
The final system successfully implements the following outputs:

- chatbot responses using local or API-based LLMs
- PDF-based retrieval-augmented question answering
- OCR-based image text extraction and solving
- script emotion classification with confidence and emotional arc
- video and YouTube emotion analysis with transcript preview and intensity mapping
- movie recommendations based on mood and intensity
- downloadable PDF reports for script and video workflows
- a modern dashboard interface for navigating all modules

The project also provides metadata storage for uploaded documents, users, sessions, and recommendation history through SQLite.

Overall, the results show that CogniFlow-AI can act as a unified multi-modal AI assistant rather than a single-purpose tool. The implemented workflows demonstrate successful integration of language modeling, retrieval systems, OCR, emotion classification, media processing, and recommendation logic within one platform.

## Conclusion
CogniFlow-AI demonstrates the successful design and implementation of a multi-modal AI platform capable of handling text, image, document, and video-based workflows. The project combines modern AI techniques with full-stack engineering practices to provide a practical and extensible solution.

The system is especially valuable as an academic and prototype project because it shows how multiple AI services can be orchestrated inside one application with a clear frontend experience. Future improvements such as persistent vector storage, stronger testing, advanced authentication, and production deployment support can further strengthen the platform. Even in its current form, CogniFlow-AI represents a meaningful and well-structured AI systems project.
