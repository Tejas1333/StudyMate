from typing import List, Dict
import uuid
import time
from Copilot_MCQ.fetch_data import fetch_wikipedia_explanation, fetch_duckduckgo_explanation, fetch_youtube_video
from Copilot_MCQ.embedding import vector_store
from langchain_core.documents import Document
from Copilot_MCQ.history import disambiguate_topic
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


def process_syllabus(topics: List[str]) -> List[Dict]:
    """Process syllabus topics for explanations and YouTube links."""
    results = []
    
    for topic in topics:
        # topic = disambiguate_topic(topic)
        
        # if not explanation:
        fallback_prompt = f"""
                    You are an academic assistant.

                    Provide a clear and age-appropriate explanation about the topic: '{topic}'.
                    Use 150-200 words. Format as bullet points or structured explanation depending on the nature of the topic.
                    """
        try:
            response = llm.invoke(fallback_prompt)
            explanation = response.content.strip()
        except Exception as e:
            logger.error(f"LLM fallback failed for topic '{topic}': {e}")
            explanation = f"⚠️ Sorry, we couldn't find an explanation for '{topic}' right now."
        if not explanation:
            explanation = fetch_wikipedia_explanation(topic)
        if not explanation:
            explanation = fetch_duckduckgo_explanation(topic)

        video_data = fetch_youtube_video(topic)
        if not video_data.get("url"):
            logger.info(f"No YouTube video found for topic '{topic}'.")

        doc_id = str(uuid.uuid4())
        document = Document(
            page_content=f"Topic: {topic}\nExplanation: {explanation}",
            metadata={
                "type": "topic",
                "topic": topic,
                "video_url": video_data.get("url", ""),
                "video_title": video_data.get("title", "")
            },
            id=doc_id
        )
        vector_store.add_documents([document])

        results.append({
            "topic": topic,
            "explanation": explanation,
            "video_url": video_data.get("url", "No video found"),
            "video_title": video_data.get("title", "Unknown")
        })

        time.sleep(2)  # Optional: reduce to 1-2s if API limits allow

    return results


def process_youtube_video(video_url: str, title: str = "Unknown") -> Dict:
    """Process a YouTube video for transcript and summary."""
    try:
        result = process_video(video_url, title)
        if result["stored"]:
            doc_id = str(uuid.uuid4())
            document = Document(
                page_content=f"Video URL: {video_url}\nTranscript: {result['transcript']}\nSummary: {result['summary']}",
                metadata={"type": "video", "topic": title.lower(), "video_url": video_url, "video_title": title},
                id=doc_id
            )
            vector_store.add_documents([document])
        return result
    except Exception as e:
        logger.error(f"Error processing YouTube video {video_url}: {e}")
        return {
            "video_url": video_url,
            "transcript": f"Error generating transcript: {e}",
            "summary": f"Error generating summary: {e}",
            "stored": False
        }