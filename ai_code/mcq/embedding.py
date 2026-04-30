
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings

import os
from dotenv import load_dotenv
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")



embedding = GoogleGenerativeAIEmbeddings(
      model="gemini-embedding-2",
      api_key=GOOGLE_API_KEY
)



COLLECTION_NAME = "academic_data"
os.makedirs("./YT_VECTOR", exist_ok=True)


vector_store = Chroma(
    collection_name=COLLECTION_NAME,
    embedding_function=embedding,
    persist_directory="./YT_VECTOR"
)



# from langchain_community.vectorstores import Chroma
# from langchain_core.documents import Document
# import os
# from dotenv import load_dotenv
# COLLECTION_NAME = "academic_data"
# from dotenv import load_dotenv
# from langchain_openai import OpenAIEmbeddings
# from langchain_openai import ChatOpenAI
# from openai import OpenAI
# # Configure Langchain to use A4F
# os.environ["OPENAI_API_KEY"] = os.getenv("A4F_API_KEY")
# os.environ["OPENAI_API_BASE"] = "https://api.a4f.co/v1" # Key configuration
# client = OpenAI(
#     api_key=os.getenv("A4F_API_KEY"),
#     base_url=os.getenv("A4F_BASE_URL"),
# )
# llm=ChatOpenAI(model_name="provider-2/gpt-3.5-turbo")
# # Initialize embeddings
# embeddings = OpenAIEmbeddings(
#     model="provider-3/text-embedding-ada-002",
# )
# COLLECTION_NAME = "academic_data"
# os.makedirs("./YT_VECTOR", exist_ok=True)


# vector_store = Chroma(
#     collection_name=COLLECTION_NAME,
#     embedding_function=embeddings,
#     persist_directory="./YT_VECTOR"
# )
