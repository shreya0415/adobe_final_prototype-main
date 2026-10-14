# PersonaLens 🚀
AI-powered document analysis with intelligent reading assistance. PersonaLens helps you explore and understand content faster with context-aware recommendations and AI-driven insights.
![WhatsApp Image 2025-08-19 at 18 39 32_7e3e9e21](https://github.com/user-attachments/assets/e81ff1ab-bce7-4813-8495-effbf4b36760)
![WhatsApp Image 2025-08-19 at 18 48 03_6e467242](https://github.com/user-attachments/assets/fdcdd20b-2d94-4464-972e-3a4e21f0079e)
![WhatsApp Image 2025-08-19 at 18 49 07_e65a5fda](https://github.com/user-attachments/assets/7d66cc7f-3a96-4eb5-a8e2-3cff15777729)
![WhatsApp Image 2025-08-19 at 18 49 43_07c05fd2](https://github.com/user-attachments/assets/7b95c2c8-9a7d-4d44-8bb1-6d16cb639a5c)
![Uploading WhatsApp Image 2025-08-19 at 18.50.19_41ffdeb3.jpg…]()






# About The Project
Professionals today are overwhelmed with dense documents like resumes, research papers, and reports. Manually sifting through them to find relevant information and connect the dots is tedious and inefficient.

PersonaLens solves this by providing an intelligent reading experience. It uses AI "Personas" (e.g., Hiring Manager, Technical Lead) to analyze documents from a specific viewpoint, automatically highlighting key sections and generating actionable insights. This allows users to understand complex information in a fraction of the time.

# TechStack
Frontend: React, TypeScript, Vite

Backend: Python, FastAPI

PDF Rendering: Adobe PDF Embed API

AI/ML: GPT-4o for advanced insights

Containerization: Docker

# Core Features
🤖 AI Personas: Choose an analysis perspective (e.g., Hiring Manager, HR Specialist) to focus the AI on what matters most to you.

💡 Context-Aware Highlighting: Automatically identifies and highlights the most relevant sections within and across documents with >80% accuracy.

⚡ Instant Insights: An "Insights Bulb" feature powered by an LLM (GPT-4o) delivers key takeaways, "Did you know?" facts, and contradictions.

📄 Interactive PDF Viewer: High-fidelity PDF rendering with seamless zoom and pan interactions, powered by the Adobe PDF Embed API.

🎤 Podcast Mode: Generate a short (2-5 minute) narrated audio overview of a document or section for on-the-go consumption.

📤 Bulk Upload & Management: Easily upload and manage your library of documents.

# Getting Started
You can get a local copy up and running using Docker (recommended).

# Prerequisites
Docker & Docker Compose: Install Docker
Gemini API key
OpenAI API key: Required for the "Insights Bulb" feature and "Podcast Mode".

# Installation with Docker
git clone https://github.com/your_username/personalens.git
cd personalens
Create an environment file for the frontend
Create a file named .env inside the frontend/ directory:

frontend/.env
VITE_ADOBE_API_KEY=YOUR_ADOBE_API_KEY
GEMINI_API_KEY

Create an environment file for the backend:
Create a file named .env inside the backend/ directory:

backend/.env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY


Build and run with Docker Compose:

docker-compose up --build


Open the app:
Navigate to http://localhost:8080 in your browser.

# Usage
Upload Documents: Go to the dashboard and upload one or more PDF files.

Open a Document: Click on a document from your library to open it in the viewer.

Get relevant sections:  For the Selected highlighted text, get information  from other uploaded PDF files.

Choose a Persona: Select an AI Persona from the right-hand panel (e.g., "Technical Lead").

Explore Insights: The document will automatically highlight relevant sections. Click on them to jump directly to the content.

Generate Audio: Use the "Podcast Mode" feature to listen to an audio summary.

# Roadmap & Future Features
👥 Custom Personas: Allow users to create, save, and share their own custom AI personas tailored to specific tasks.

🤝 Team Collaboration: Introduce workspaces where teams can share document libraries and analysis insights.

🔍 Advanced Semantic Search: Implement a powerful search engine to ask natural language questions across the entire document library.

🌐 Multi-Language Support: Expand analysis capabilities to documents in other languages.

🔌 Browser Extension: A Chrome extension to analyze web pages and online PDFs with PersonaLens on the fly.

See the open issues for a full list of proposed features and known issues.

# Contributing
Contributions make the open-source community an amazing place to learn and create. Any contributions you make are greatly appreciated.

# Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request
