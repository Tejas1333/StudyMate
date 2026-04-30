from embedding import vector_store
from typing import List, Dict
import json
import uuid
import time
from langchain_core.documents import Document
import logging
from typing import Dict
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
import streamlit as st
load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# Validate environment
if not GROQ_API_KEY:
    st.error("GROQ_API_KEY is not set.")
    st.stop()

# Initialize Groq LLM
try:
    llm = ChatGroq(model_name="openai/gpt-oss-120b", api_key=GROQ_API_KEY, temperature=0.7)
except Exception as e:
    st.error(f"Failed to initialize Groq LLM: {e}")
    st.stop()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

EDUCATION_LEVEL = "college"
def generate_mcqs(topic: str, num_questions: int) -> List[Dict]:
    """Generate MCQs for a topic using Groq."""
    try:
        results = vector_store.similarity_search(f"Topic: {topic}", k=1)
        if not results:
            logger.warning(f"No content found for topic {topic}")
            return []
            print(num_questions)
        
        content = results[0].page_content
        prompt = f"""
        Generate {num_questions} multiple-choice questions for the topic '{topic}' based solely on the provided content, suitable for a {EDUCATION_LEVEL} student. Each question must have:
        - A clear question
        - 4 answer options (labeled A, B, C, D)
        - The correct answer (as a letter: A, B, C, or D)
        - A brief explanation for the correct answer
        - dont add the single quotes in question instead add double quotes.
        Return the questions in valid JSON format. Do not use the example content in the output.
        Return *only* valid JSON without markdown formatting or extra explanation.



        JSON format:
        [
            {{
                "question": "Question text",
                "options": {{
                    "A": "Option A",
                    "B": "Option B",
                    "C": "Option C",
                    "D": "Option D"
                }},
                "correct_answer": "A",
                "explanation": "Explanation text"
            }}
        ]
        """
        response = llm.invoke(prompt)
        logger.info(f"Raw Groq response for MCQs: {response.content.strip()}")
        try:
            mcqs = json.loads(response.content.strip())
            if not isinstance(mcqs, list):
                raise ValueError("MCQs must be a list")
            return mcqs
        except json.JSONDecodeError as je:
            logger.error(f"JSON parsing error: {je}")
            return []
        except ValueError as ve:
            logger.error(f"Invalid MCQ format: {ve}")
            return []
    except Exception as e:
        logger.error(f"Failed to generate MCQs for {topic}: {e}")
        return []

def store_mcq_performance(topic: str, score: float, answers: List[Dict]) -> None:
    """Store MCQ performance in ChromaDB."""
    try:
        doc_id = str(uuid.uuid4())
        document = Document(
            page_content=f"Topic: {topic}\nScore: {score}\nAnswers: {json.dumps(answers)}",
            metadata={"type": "mcq_performance", "topic": topic, "timestamp": time.time(), "score": score},
            id=doc_id
        )
        vector_store.add_documents([document])
        logger.info(f"Stored MCQ performance for topic {topic}")
    except Exception as e:
        logger.error(f"Failed to store MCQ performance: {e}")
