# CogniFlow-AI Project Report

## 1. Project Title
**CogniFlow-AI: A Multi-Modal Intelligence Platform for Conversational Assistance, Document Retrieval, Emotion Analysis, and Content Recommendation**

## 2. Project Overview
CogniFlow-AI is a full-stack AI application that combines multiple intelligent workflows into a single platform. The system supports conversational chat, retrieval-augmented question answering over uploaded PDF documents, OCR-based image understanding, script emotion analysis, video and YouTube-based emotion extraction, automatic PDF report generation, and movie recommendations based on emotional tone.

The backend is implemented with FastAPI and organizes the platform into independent but connected modules for language modeling, retrieval, media analysis, reporting, authentication, and database storage. The frontend is built with React, TypeScript, and Vite, and presents these capabilities through a dashboard-style interface with dedicated pages for each workflow.

## 3. Problem Statement
Modern users often work with unstructured content such as PDFs, images, scripts, and videos, but most tools handle these inputs separately. This creates friction when users want one platform that can:

- chat with an AI assistant,
- answer questions from uploaded documents,
- read text from images,
- analyze the emotional tone of scripts and videos,
- generate downloadable analytical reports, and
- recommend media content based on detected mood.

CogniFlow-AI addresses this gap by unifying these tasks into one application with a common interface and reusable backend services.

## 4. Objectives
The main objectives of the project are:

- to build a multi-modal AI platform that accepts text, PDF, image, script, video, and YouTube inputs,
- to support both local and API-based large language model interaction,
- to implement retrieval-augmented generation for document-grounded question answering,
- to detect emotion from scripts and transcripts using transformer-based text classification,
- to estimate audio intensity from video speech signals,
- to generate structured PDF reports from analysis output,
- to recommend movies using mood and intensity-driven filtering, and
- to provide a modern frontend for easy interaction with all modules.

## 5. Scope of the System
CogniFlow-AI currently includes the following major capabilities:

- General chatbot interaction using a local or API-backed LLM.
- PDF upload, indexing, chunking, embedding, vector storage, and strict/solve-mode RAG querying.
- OCR-based image text extraction with indexing or direct problem-solving mode.
- Script emotion analysis from raw text or uploaded PDF scripts.
- Video emotion analysis from uploaded video files.
- YouTube-based emotion analysis through automated download and processing.
- Automatic PDF report generation for script and video analysis results.
- Movie recommendations based on mood, intensity, genre, and industry preference.
- Basic user authentication and session management.
- Storage of uploaded document and recommendation history metadata in SQLite.

## 6. System Architecture
The project follows a modular client-server architecture.

### 6.1 Frontend Layer
The frontend is implemented in React with TypeScript and Vite. It includes dedicated pages for:

- dashboard,
- video analysis,
- script analysis,
- PDF analysis,
- image search,
- chatbot interaction, and
- movie recommendations.

The frontend communicates with the backend through an Axios-based API service layer and normalizes backend responses for presentation in charts and cards.

### 6.2 Backend Layer
The FastAPI backend acts as the orchestration layer. It exposes REST endpoints for:

- authentication,
- chat,
- PDF and image ingestion,
- retrieval-based querying,
- recommendation generation,
- script analysis,
- video analysis, and
- PDF report download.

### 6.3 Processing Modules
The backend is split into specialized modules:

- `app/llm`: local and API-backed LLM wrappers.
- `app/rag`: PDF loading, text splitting, embedding, FAISS vector storage, and retrieval.
- `app/video`: video download, audio extraction, transcription, script emotion analysis, and audio intensity analysis.
- `app/script`: script PDF loading, script pipeline logic, and report generation.
- `app/recommendation`: movie database and recommendation engine.
- `app/database`: SQLite setup and SQLAlchemy models.
- `app/core`: authentication utilities and LLM factory selection.

### 6.4 Data Layer
SQLite is used for persistent storage of:

- registered users,
- auth sessions,
- uploaded document records,
- recommendation history, and
- analysis result metadata.

In-memory FAISS storage is used for vector search over indexed document and image text chunks.

## 7. Working Principle
The main workflows of the system are described below.

### 7.1 Chat Workflow
1. The user enters a message from the frontend.
2. The backend selects either a local Ollama model or an API-backed LLM.
3. The selected model generates a response.
4. The response is returned to the user through the chat interface.

### 7.2 PDF RAG Workflow
1. A PDF is uploaded to the backend.
2. Text is extracted page by page.
3. Each page is split into chunks.
4. Embeddings are generated for the chunks.
5. The embeddings and metadata are stored in FAISS.
6. On user query, the retriever fetches the most relevant chunks.
7. The LLM answers in either strict mode or solve mode using retrieved context.

### 7.3 Image OCR Workflow
1. An image is uploaded.
2. OCR extracts readable text from the image.
3. In `index` mode, the text is chunked and stored in the vector index.
4. In `solve` mode, the extracted text is directly passed to the LLM for reasoning.

### 7.4 Script Analysis Workflow
1. The user submits plain text or uploads a PDF script.
2. Script text is cleaned and segmented.
3. A Hugging Face emotion-classification pipeline evaluates the text.
4. A dominant emotion, confidence score, top emotions, dominance gap, and emotional arc are produced.
5. Mood and intensity are mapped to movie recommendations.

### 7.5 Video Analysis Workflow
1. A user uploads a video or submits a YouTube link.
2. Audio is extracted from the media.
3. Speech is transcribed to text.
4. Script emotion is detected from the transcript.
5. Audio RMS-based analysis estimates low, medium, or high intensity.
6. Script emotion and audio intensity are combined into a dominant mood.
7. Recommendations and visual emotion summaries are returned.

### 7.6 Report Generation Workflow
1. Script or video analysis output is collected.
2. A PDF report is generated using ReportLab.
3. The report includes script preview, dominant emotion, confidence, ranked emotions, and emotional arc.
4. The report is streamed back to the user as a downloadable PDF file.

## 8. Technologies Used

### 8.1 Backend
- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite
- Pydantic

### 8.2 AI and ML
- Ollama for local LLM access
- Transformer pipeline using `j-hartmann/emotion-english-distilroberta-base`
- Sentence Transformers for embeddings
- FAISS for vector similarity search
- Faster-Whisper for speech transcription
- EasyOCR for image text extraction
- Librosa and NumPy for audio intensity analysis

### 8.3 Frontend
- React
- TypeScript
- Vite
- Axios
- Framer Motion

### 8.4 Utilities and Media Processing
- PyPDF / PyPDF2
- Pillow
- OpenCV
- yt-dlp
- ReportLab

## 9. Key Features Implemented
- Multi-page frontend dashboard for all AI workflows.
- FastAPI backend with separate endpoints for each feature domain.
- Support for both local and API-based LLM usage.
- Strict document-grounded question answering over uploaded PDFs.
- OCR-enabled image problem solving and indexing.
- Emotion classification for scripts and transcripts.
- Sentence-level emotional arc generation.
- Audio intensity classification for videos.
- YouTube-based ingestion and analysis.
- Downloadable PDF emotion reports.
- Mood-aware movie recommendation engine.
- Basic authentication and session handling.

## 10. Database Design
The SQLAlchemy models define the following core tables:

- `users`: stores full name, email, password hash, and creation time.
- `auth_sessions`: stores active login tokens for users.
- `uploaded_documents`: stores uploaded PDF and image metadata.
- `analysis_results`: reserved structure for script or video analysis summaries.
- `recommendation_history`: stores request filters and recommendation outputs.

This design is lightweight and appropriate for prototyping and academic demonstration, while still supporting persistence for user activity and document history.

## 11. Output and User Experience
The system returns results in a form that is easy to visualize and use:

- conversational responses for chatbot and RAG queries,
- indexed document statistics,
- transcript previews,
- dominant mood and intensity labels,
- emotional arc timelines,
- ranked top emotions,
- movie recommendation cards, and
- downloadable PDF reports.

The dashboard also aggregates the latest analysis results for quick review through charts and summary widgets.

## 12. Strengths of the Project
- Integrates multiple AI workflows in a single platform instead of isolated tools.
- Uses modular backend design, making the codebase easier to extend.
- Supports real-world media types including documents, images, and videos.
- Combines language understanding, retrieval, OCR, audio analysis, and recommendation logic.
- Produces both interactive and downloadable outputs.
- Includes a polished frontend rather than remaining a backend-only prototype.

## 13. Current Limitations
The current repository also shows some practical limitations:

- the vector store is in-memory, so indexed chunks are not persisted across application restarts,
- authentication is basic and does not yet include role management or token expiry strategy,
- the project has little to no automated test coverage in the `tests/` directory,
- SQLite is suitable for local use but not ideal for larger production deployments,
- report generation is text-oriented and does not yet embed charts or richer branding,
- some workflows depend on heavy ML models, which may increase startup time and hardware requirements,
- the system currently relies on heuristic audio intensity rules rather than a dedicated audio emotion model.

## 14. Future Enhancements
The project can be extended in several meaningful ways:

- add persistent vector database support,
- improve authentication with JWT expiry, refresh flows, and access control,
- introduce automated unit, integration, and API tests,
- add cloud storage for uploaded assets,
- improve recommendation quality with hybrid ranking or feedback learning,
- support multilingual script and OCR analysis,
- add analytics dashboards for historical reports,
- optimize background processing for large video jobs, and
- deploy the system with containerization and production-ready infrastructure.

## 15. Conclusion
CogniFlow-AI is a strong multi-modal AI application that demonstrates how conversational AI, retrieval-augmented generation, OCR, emotion analysis, recommendation systems, and report generation can be combined into one practical platform. The project is especially notable for its breadth: it does not stop at one AI feature, but connects several related pipelines into a unified user experience.

From an academic and engineering perspective, the project shows effective use of modular backend design, modern frontend development, and applied machine learning components. With stronger persistence, testing, and deployment support, CogniFlow-AI can be evolved from a capable prototype into a more production-ready intelligent media analysis system.

## 16. Repository-Based References
This report was prepared by inspecting the current repository structure and implementation, especially:

- `app/main.py`
- `app/video/pipeline.py`
- `app/video/script_analyzer.py`
- `app/video/emotion_analyzer.py`
- `app/script/report_generator.py`
- `app/recommendation/engine.py`
- `app/database/models.py`
- `ui/src/App.tsx`
- `ui/src/services/api.ts`
