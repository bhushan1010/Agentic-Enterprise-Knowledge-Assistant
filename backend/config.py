import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Agentic Enterprise Knowledge Assistant"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: list = ["*"]

    # Qdrant Settings
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", ":memory:")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", 6333))
    QDRANT_COLLECTION_NAME: str = os.getenv("QDRANT_COLLECTION_NAME", "enterprise_knowledge")
    QDRANT_DISTANCE: str = os.getenv("QDRANT_DISTANCE", "COSINE")
    EMBEDDING_SIZE: int = int(os.getenv("EMBEDDING_SIZE", 3072))
    
    # Google Gemini Settings
    GOOGLE_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
    GEMINI_EMBEDDING_MODEL: str = os.getenv("GEMINI_EMBEDDING_MODEL", "models/gemini-embedding-2")
    GEMINI_LLM_MODEL: str = os.getenv("GEMINI_LLM_MODEL", "gemini-2.5-flash")
    
    # Document Processing Settings
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", 1000))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", 200))
    RETRIEVER_K: int = int(os.getenv("RETRIEVER_K", 5))
    
    # Upload Settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", 10 * 1024 * 1024))  # 10MB
    
    class Config:
        case_sensitive = True

settings = Settings()