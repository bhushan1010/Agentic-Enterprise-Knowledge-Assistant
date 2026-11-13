# Agentic Enterprise Knowledge Assistant

This project consists of a Next.js Frontend and a FastAPI Backend to serve as an AI-powered Enterprise Knowledge Assistant.

## Prerequisites
- Node.js (v18+)
- Python 3.9+
- PostgreSQL (Optional, for Vector DB later)

## Frontend Setup (Next.js)

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Backend Setup (FastAPI)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install the requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server using Uvicorn:
   ```bash
   uvicorn main:app --reload
   ```
5. Access the API documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
