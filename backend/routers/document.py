import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from core.rag import ingest_pdf

router = APIRouter(prefix="/document", tags=["Document"])

# Temporary folder to save uploads
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        chunks_added = ingest_pdf(file_path)
        return {"filename": file.filename, "status": f"Uploaded and ingested {chunks_added} chunks successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_documents():
    if os.path.exists(UPLOAD_DIR):
        files = os.listdir(UPLOAD_DIR)
        return {"documents": files}
    return {"documents": []}
