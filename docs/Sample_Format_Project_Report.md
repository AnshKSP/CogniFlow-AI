# CogniFlow-AI
## Multi-Modal AI Platform for Chat, Document Intelligence, Emotion Analysis, and Recommendations

Prepared By:
`[Your Name / Team Name]`

Under the Mentorship of:
`[Guide Name]`

Institution:
`[College / Department Name]`

---

## Contents

Chapter 1: Abstract  
Chapter 2: Introduction  
Chapter 3: Technologies  
Chapter 4: Block Diagram  
Chapter 5: Results  
Chapter 6: Conclusion  
Chapter 7: Future Scope  
Chapter 8: References  

---

## Chapter 1: Abstract

CogniFlow-AI is a full-stack multi-modal artificial intelligence platform developed to combine conversational AI, document-based question answering, OCR-driven image understanding, script and video emotion analysis, PDF report generation, and movie recommendations into a single integrated system. The project is implemented using a FastAPI backend and a React-based frontend, enabling users to interact with text, PDFs, images, scripts, uploaded videos, and YouTube links through one dashboard.

The system applies retrieval-augmented generation for document question answering, transformer-based emotion classification for script and transcript analysis, audio intensity estimation for videos, and a rule-based recommendation engine for suggesting movies based on detected mood and intensity. The project demonstrates how several AI workflows can be combined into one usable application with practical educational and real-world relevance.

## Chapter 2: Introduction

In modern digital systems, users often work with many forms of unstructured data such as text, documents, scanned images, scripts, and videos. Most applications support only one of these tasks at a time, which creates fragmentation and reduces usability. For example, one tool may handle chatting, another may answer questions from PDF files, and another may analyze emotional tone from media.

CogniFlow-AI is designed to solve this problem by providing a unified AI platform. The application allows users to interact with a chatbot, upload PDF files for retrieval-based question answering, extract and solve text from images, analyze script emotions from raw text or PDF scripts, process uploaded videos or YouTube links for emotional insights, and generate downloadable reports. The system also offers movie recommendations based on detected emotional patterns.

The project highlights the integration of language models, OCR, vector retrieval, speech transcription, emotion analysis, and recommendation logic inside a modular full-stack architecture.

## Chapter 3: Technologies

The project is developed using the following technologies:

### Backend Technologies
- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite
- Pydantic

### AI and Machine Learning Technologies
- Ollama for local language model access
- API-based LLM support for external model usage
- Sentence Transformers for embeddings
- FAISS for vector similarity search
- Hugging Face Transformers for emotion classification
- Faster-Whisper for audio transcription
- EasyOCR for image text extraction
- Librosa and NumPy for audio intensity analysis

### Frontend Technologies
- React
- TypeScript
- Vite
- Axios
- Framer Motion

### Utility Libraries
- PyPDF / PyPDF2 for PDF reading
- Pillow and OpenCV for image processing
- yt-dlp for YouTube media handling
- ReportLab for PDF report generation

These technologies together provide a complete stack for AI interaction, media processing, visualization, and report generation.

## Chapter 4: Block Diagram

The architecture of CogniFlow-AI can be understood as a layered pipeline:

1. Input Layer
Users provide input through the frontend dashboard in the form of chat text, PDF documents, images, script text, uploaded videos, or YouTube URLs.

2. Processing Layer
The FastAPI backend routes requests to specialized modules such as:
- LLM chat module
- RAG document pipeline
- OCR image pipeline
- Script emotion analysis pipeline
- Video processing and transcription pipeline
- Recommendation engine
- PDF report generator

3. Storage Layer
The system uses SQLite for application data and FAISS for vector indexing of documents and extracted image text.

4. Output Layer
The platform returns chatbot answers, document-grounded responses, extracted text insights, emotion summaries, emotional arcs, recommendation lists, and downloadable PDF reports.

Suggested diagram for this chapter:
`docs/presentation/system_architecture_overview_clean.png`

## Chapter 5: Results

The project successfully implements a working full-stack AI platform with multiple integrated outputs.

### Functional Outcomes
- Chat responses can be generated using local or API-based LLMs.
- PDF documents can be uploaded, indexed, and queried using retrieval-augmented generation.
- Images containing text can be processed through OCR and solved directly or indexed for later retrieval.
- Scripts can be analyzed for dominant emotion, confidence, top emotions, and emotional arc.
- Videos and YouTube links can be processed to extract transcripts, estimate intensity, and detect dominant mood.
- PDF reports can be generated directly from script and video analysis.
- Movie recommendations are produced based on emotional profile and intensity.

### System Results
- The backend organizes multiple AI services under one API.
- The frontend dashboard provides a separate page for each workflow.
- The application demonstrates successful integration of LLMs, OCR, transcription, emotion analysis, retrieval systems, and recommendation logic in one platform.

Suggested workflow/result image:
`docs/presentation/end_to_end_workflow_clean.png`

## Chapter 6: Conclusion

CogniFlow-AI successfully achieves its goal of integrating multiple AI-powered capabilities into one platform. Instead of focusing on only one task, the project combines chatbot interaction, document intelligence, OCR, script analysis, video understanding, recommendations, and reporting into a single user experience.

The project demonstrates strong modular design, practical use of modern AI libraries, and a clear full-stack implementation. It serves as a strong academic project as well as a promising prototype for future intelligent media analysis systems.

## Chapter 7: Future Scope

The project can be improved and extended in several ways:

- persistent vector database integration for long-term document indexing
- stronger authentication with token expiry and role-based access
- automated unit and integration testing
- cloud storage for uploaded media files
- multilingual document, OCR, and script analysis
- richer report generation with charts and branding
- better recommendation ranking using user feedback
- background job processing for large video analysis workloads
- production deployment using containers and scalable infrastructure

These enhancements can make CogniFlow-AI more robust, scalable, and production ready.

## Chapter 8: References

- FastAPI Official Documentation
- React Official Documentation
- Hugging Face Transformers Documentation
- FAISS Documentation
- EasyOCR Documentation
- Faster-Whisper Documentation
- Librosa Documentation
- ReportLab Documentation
- CogniFlow-AI repository modules and implementation files
