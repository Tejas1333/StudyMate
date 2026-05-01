from typing import List, Tuple

from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings

import os
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

groq_client = Groq(api_key=GROQ_API_KEY)



embedding = GoogleGenerativeAIEmbeddings(
      model="gemini-embedding-2",
      api_key=GOOGLE_API_KEY
)

def get_embedding(text: str) -> List[float]:
    return embedding.embed_query(text)



def generate_answer(query: str, retrieved_docs: List[Tuple[str, float]]) -> str:
    """Generate answer using Groq model with retrieved documents."""

    context = "\n".join([doc[0] for doc in retrieved_docs])

    prompt = f"""
Context:
{context}

Query: {query}

Answer the query based only on the provided context.
If answer is not found, say "Not available in context."
"""

    response = groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",   # You can also use mixtral-8x7b-32768
        messages=[
            {"role": "system", "content": "You are a helpful RAG assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=500
    )

    return response.choices[0].message.content.strip()

# def generate_answer(query: str, retrieved_docs: List[Tuple[str, float]]) -> str:
#     """Generate answer using OpenAI GPT model with retrieved documents."""
#     context = "\n".join([doc[0] for doc in retrieved_docs])
#     prompt = f"""Context:\n{context}\n\nQuery: {query}\n\nAnswer the query based on the provided context."""

#     response = openai_client.chat.completions.create(
#         model="provider-3/gpt-4o-mini",
#         messages=[
#             {"role": "system", "content": "You are a helpful assistant."},
#             {"role": "user", "content": prompt}
#         ],
#         max_tokens=500
#     )
#     return response.choices[0].message.content.strip()

COLLECTION_NAME = "academic_data"
os.makedirs("./YT_VECTOR", exist_ok=True)


vector_store = Chroma(
    collection_name=COLLECTION_NAME,
    embedding_function=embedding,
    persist_directory="./YT_VECTOR"
)