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