from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, document
from config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(document.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"status": "Backend is running", "version": "1.0.0"}
