from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/chat", tags=["Chat"])

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

from core.rag import get_rag_response

@router.post("/")
async def chat(request: ChatRequest):
    user_message = request.messages[-1].content if request.messages else ""
    try:
        answer = get_rag_response(user_message)
    except Exception as e:
        answer = f"Error generating response: {str(e)}"
        
    return {
        "role": "assistant",
        "content": answer
    }
