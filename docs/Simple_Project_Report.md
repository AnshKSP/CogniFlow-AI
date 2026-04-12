# CogniFlow-AI Simple Project Report

## Project Title
**CogniFlow-AI: Multi-Modal AI Platform for Chat, Analysis, and Recommendations**

## Overview
CogniFlow-AI is a full-stack AI project that combines several intelligent features into one platform. It allows users to chat with an AI assistant, upload PDF files for question answering, extract text from images, analyze emotions from scripts and videos, generate downloadable PDF reports, and receive movie recommendations based on mood and intensity.

The project uses a FastAPI backend and a React frontend. The backend handles AI processing, file uploads, document retrieval, emotion analysis, and recommendation logic, while the frontend provides a dashboard for user interaction.

## Main Features
- Chatbot support using local or API-based language models.
- PDF upload and retrieval-augmented question answering.
- OCR-based image text extraction and solving.
- Script emotion analysis with emotional arc output.
- Video and YouTube emotion analysis using transcript and audio intensity.
- Automatic PDF report generation.
- Movie recommendation system based on emotional profile.
- Basic user authentication and session management.

## Technologies Used
- Python, FastAPI, Uvicorn
- React, TypeScript, Vite
- SQLite and SQLAlchemy
- FAISS for vector search
- Ollama and API-based LLM support
- Hugging Face transformers for emotion classification
- Faster-Whisper for transcription
- EasyOCR for image text extraction
- Librosa for audio intensity analysis
- ReportLab for PDF generation

## System Workflow
The user interacts with the frontend dashboard to upload text, images, scripts, PDFs, videos, or YouTube links. The backend processes the input using the relevant AI pipeline. The output may include answers, emotional summaries, emotional arc data, recommendations, or downloadable reports.

## Strengths
- Integrates multiple AI-based workflows in one system.
- Supports different input formats such as text, image, document, and video.
- Uses modular backend architecture.
- Provides both interactive and downloadable outputs.
- Includes a user-friendly frontend dashboard.

## Limitations
- The vector index is stored in memory and is not persistent across restarts.
- Automated test coverage is currently minimal.
- SQLite is suitable for local use but not ideal for large-scale deployment.
- Audio emotion detection is based on intensity heuristics rather than a dedicated deep audio model.

## Conclusion
CogniFlow-AI is a practical and feature-rich AI platform that demonstrates the integration of conversational AI, document retrieval, OCR, emotion analysis, recommendation systems, and report generation in one application. It is a strong academic and prototype project with good potential for future improvement and production-level expansion.
