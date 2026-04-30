
from pinecone import Pinecone, ServerlessSpec
from typing import List, Tuple
import uuid
import os
from dotenv import load_dotenv
from llm_utils import get_embedding

# Load .env
load_dotenv()

# Pinecone Config
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "youtube-rag"
DIMENSION = 3072
METRIC = "cosine"

# Initialize Pinecone Client
pc = Pinecone(api_key=PINECONE_API_KEY)


def create_pinecone_index():
    """
    Create index if not exists, otherwise connect existing index
    """

    existing_indexes = pc.list_indexes().names()

    if INDEX_NAME not in existing_indexes:
        pc.create_index(
            name=INDEX_NAME,
            dimension=DIMENSION,
            metric=METRIC,
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )

    return pc.Index(INDEX_NAME)


def index_documents(documents: List[str], index, namespace="default"):
    """
    Convert docs into embeddings and store in Pinecone
    """

    vectors = []

    for doc in documents:
        text = doc.page_content

        embedding = get_embedding(text)

        vectors.append({
            "id": str(uuid.uuid4()),
            "values": embedding,
            "metadata": {
                "text": text
            }
        })

    index.upsert(
        vectors=vectors,
        namespace=namespace
    )

    print(f"Indexed {len(vectors)} chunks.")


def retrieve_documents(query: str, index, top_k: int = 3, namespace="default") -> List[Tuple[str, float]]:
    """
    Retrieve most relevant chunks
    """

    query_embedding = get_embedding(query)

    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True,
        namespace=namespace
    )

    return [
        (
            match.metadata["text"],
            match.score
        )
        for match in results.matches
    ]


# from pinecone import Pinecone, ServerlessSpec
# from typing import List
# # import streamlit as st
# import uuid
# from llm_util import get_embedding
# import os
# from dotenv import load_dotenv
# # Load environment variables
# load_dotenv()


# # Pinecone configuration
# PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
# INDEX_NAME = "youtube-rag"
# DIMENSION = 3072
# METRIC = "cosine"

# def create_pinecone_index():
#     """Create or connect to a Pinecone index."""
#     pinecone = Pinecone(api_key=PINECONE_API_KEY)
#     if INDEX_NAME not in pinecone.list_indexes().names():
#         pinecone.create_index(
#             name=INDEX_NAME,
#             dimension=DIMENSION,
#             metric=METRIC,
#             spec=ServerlessSpec(cloud="aws", region="us-east-1")
#         )
#     return pinecone.Index(INDEX_NAME)

# def index_documents(documents: List[str], index):
#     """Embed and index documents in Pinecone."""
#     vectors = []
#     for doc in documents:
#         embedding = get_embedding(doc.page_content)
#         vector_id = str(uuid.uuid4())
#         vectors.append({
#             "id": vector_id,
#             "values": embedding,
#             "metadata": {"text": doc.page_content}
#         })
#     index.upsert(vectors=vectors)
#     # st.write(f"Indexed {len(vectors)} documents.")

# def retrieve_documents(query: str, index, top_k: int = 1) -> List[tuple[str, float]]:
#     """Retrieve relevant documents from Pinecone based on query."""
#     query_embedding = get_embedding(query)
#     query_response = index.query(
#         vector=query_embedding,
#         top_k=top_k,
#         include_metadata=True
#     )
#     return [(match.metadata.get("text"), match.score) for match in query_response.matches]










# import chromadb
# from typing import List, Any 
# import uuid
# from llm_utils import get_embedding

# # ChromaDB configuration
# COLLECTION_NAME = "rag"


# def create_chroma_collection():
#     """Create or connect to a ChromaDB collection."""
#     client = chromadb.PersistentClient(path="./chroma_db")
#     collection = client.get_or_create_collection(name=COLLECTION_NAME)
#     return collection

# def index_documents(documents: List[Any], collection):
#     """Embed and index documents in ChromaDB."""
#     ids = []
#     embeddings = []
#     metadatas = []
#     documents_text = []
    
#     for doc in documents:
#         embedding = get_embedding(doc.page_content)
#         doc_id = str(uuid.uuid4())
        
#         ids.append(doc_id)
#         embeddings.append(embedding)
#         metadatas.append({"text": doc.page_content})
#         documents_text.append(doc.page_content)
    
#     collection.add(
#         ids=ids,
#         embeddings=embeddings,
#         metadatas=metadatas,
#         documents=documents_text
#     )

# def retrieve_documents(query: str, collection, top_k: int = 1) -> List[tuple[str, float]]:
#     """Retrieve relevant documents from ChromaDB based on query."""
#     query_embedding = get_embedding(query)
#     results = collection.query(
#         query_embeddings=[query_embedding],
#         n_results=top_k
#     )
    
#     documents = []
#     for i, doc in enumerate(results['documents'][0]):
#         distance = results['distances'][0][i]
#         # Convert distance to similarity score (ChromaDB uses distance, lower is better)
#         similarity = 1 - distance
#         documents.append((doc, similarity))
    
#     return documents