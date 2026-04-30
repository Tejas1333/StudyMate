import time
import os
import numpy as np
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from openai import OpenAI
from groq import Groq  # ✅ added

# Optional embedding support
try:
    from langchain_openai import OpenAIEmbeddings
    LANGCHAIN_OPENAI_AVAILABLE = True
except ImportError:
    LANGCHAIN_OPENAI_AVAILABLE = False
    OpenAIEmbeddings = None

load_dotenv()

# --- OpenAI-compatible embedding client ---
a4f_api_key = os.getenv("A4F_API_KEY")
a4f_base_url = os.getenv("A4F_BASE_URL")
client = None

if a4f_api_key and a4f_base_url:
    os.environ["OPENAI_API_KEY"] = a4f_api_key
    os.environ["OPENAI_API_BASE"] = a4f_base_url
    client = OpenAI(
        api_key=a4f_api_key,
        base_url=a4f_base_url,
    )


class CareerChatAssistant:
    def __init__(self, career_system=None):
        self.career_system = career_system
        self.groq_api_key = career_system.groq_api_key if career_system else None
        self.vector_store = None
        self.chat_history = []
        self.groq_client = Groq(api_key=self.groq_api_key) if self.groq_api_key else None

    def initialize_rag(self, career_data):
        """Initialize RAG with career analysis data."""
        if not LANGCHAIN_OPENAI_AVAILABLE or not client:
            return False

        if not self.groq_api_key or not career_data:
            return False

        try:
            embeddings = OpenAIEmbeddings(model="provider-3/text-embedding-ada-002")

            documents = [
                f"Career Overview: {career_data.get('research', '')}",
                f"Market Analysis: {career_data.get('market_analysis', '')}",
                f"Learning Roadmap: {career_data.get('learning_roadmap', '')}",
                f"Industry Insights: {career_data.get('industry_insights', '')}"
            ]

            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
            chunks = text_splitter.create_documents(documents)
            self.vector_store = FAISS.from_documents(chunks, embeddings)

            return True
        except Exception:
            return False

    def process_question(self, question, career_data=None):
        """Process a user question using RAG + Groq."""
        if not self.vector_store:
            self.initialize_rag(career_data)

        try:
            if self.vector_store:
                docs = self.vector_store.similarity_search(question, k=3)
                context = "\n".join([doc.page_content for doc in docs])
            else:
                context = ""

            prompt = f"""
You are a Career Chat Assistant.

Context:
{context}

Chat History:
{self.chat_history}

Question:
{question}

Give a clear, structured answer in markdown.
"""

            if not self.groq_client:
                return self._fallback_processing(question, career_data)

            response = self.groq_client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[
                    {"role": "system", "content": "You are a helpful career assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5
            )

            answer = response.choices[0].message.content
            self.chat_history.append((question, answer))
            return answer

        except Exception:
            return self._fallback_processing(question, career_data)

    def _fallback_processing(self, question, career_data=None):
        """Fallback processing when RAG is not available or fails."""
        if self.career_system:
            return self.career_system.chat_with_assistant(question, career_data)
        else:
            return "The enhanced chat assistant could not be initialized. Please check your setup."