import os
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_qdrant import QdrantVectorStore
from langchain_community.document_loaders import PyPDFLoader
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from dotenv import load_dotenv
from config import settings

load_dotenv()

class RAGService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RAGService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._initialize_components()
            self._initialized = True
    
    def _initialize_components(self):
        # Initialize Gemini Embeddings
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model=settings.GEMINI_EMBEDDING_MODEL
        )
        
        # Initialize Qdrant Client
        self.qdrant_client = QdrantClient(location=":memory:") if settings.QDRANT_HOST == ":memory:" else QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        self.COLLECTION_NAME = settings.QDRANT_COLLECTION_NAME
        
        # Create collection if it doesn't exist
        try:
            self.qdrant_client.create_collection(
                collection_name=self.COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=settings.EMBEDDING_SIZE,
                    distance=Distance.COSINE
                ),
            )
        except Exception:
            pass # Already exists
        
        # Initialize Vector Store
        self.vector_store = QdrantVectorStore(
            client=self.qdrant_client,
            collection_name=self.COLLECTION_NAME,
            embedding=self.embeddings,
        )
        
        # Initialize Gemini LLM
        self.llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_LLM_MODEL, 
            temperature=0
        )
        
        # Text splitter configuration
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )

    def ingest_pdf(self, file_path: str):
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        
        docs = self.text_splitter.split_documents(documents)
        
        if docs:
            self.vector_store.add_documents(docs)
        return len(docs)
    
    def get_rag_response(self, user_query: str) -> str:
        from langchain_core.prompts import ChatPromptTemplate
        
        retriever = self.vector_store.as_retriever(
            search_kwargs={"k": settings.RETRIEVER_K}
        )
        docs = retriever.invoke(user_query)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        system_prompt = (
            "You are an Agentic Enterprise Knowledge Assistant. "
            "Use the following pieces of retrieved context to answer the user's question. "
            "If you don't know the answer, say that you don't know based on the provided context. "
            "Always try to provide a helpful, concise, and accurate answer.\n\n"
            "Context:\n{context}"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        
        messages = prompt.format_messages(context=context, input=user_query)
        response = self.llm.invoke(messages)
        
        return response.content

# Create singleton instance
rag_service = RAGService()

# For backward compatibility
def ingest_pdf(file_path: str):
    return rag_service.ingest_pdf(file_path)

def get_rag_response(user_query: str) -> str:
    return rag_service.get_rag_response(user_query)


