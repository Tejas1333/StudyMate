from typing import Optional, Dict
import logging
from ddgs import DDGS
import wikipediaapi
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

wiki = wikipediaapi.Wikipedia("AcademicExplainer/1.0", "en")
EDUCATION_LEVEL = "college"

def build_prompt(content: str) -> str:
    """Constructs an education-level-specific prompt for LLM summarization."""
    return f"""
                You are an expert educator.

                Summarize the following content for a {EDUCATION_LEVEL} student in 150-200 words.

                - If the content is factual (e.g., definitions, facts, processes), format it as clear and concise bullet points.
                - If the content is conceptual or abstract (e.g., theories, ideas), give a full structured explanation.
                - Avoid complex jargon and use age-appropriate language.

                Content:
                {content[:1500]}
                """

def fetch_wikipedia_explanation(topic: str) -> Optional[str]:
    """Fetch explanation from Wikipedia."""
    try:
        page = wiki.page(topic)
        if page.exists():
            summary = page.summary
            prompt = build_prompt(summary)
            response = llm.invoke(prompt)
            return response.content.strip()
        logger.info(f"Wikipedia page not found for topic: {topic}")
        return None
    except Exception as e:
        logger.warning(f"Wikipedia fetch failed for '{topic}': {e}")
        return None

def fetch_duckduckgo_explanation(topic: str) -> str:
    """Fetch explanation from DuckDuckGo as fallback."""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(f"{topic} explanation", max_results=2))
            if results:
                content = " ".join([result.get("body", "") for result in results])
                prompt = build_prompt(content)
                response = llm.invoke(prompt)
                return response.content.strip()
            return f"⚠️ No reliable content found for '{topic}'."
    except Exception as e:
        logger.error(f"DuckDuckGo fetch failed for '{topic}': {e}")
        return f"⚠️ Error fetching content for '{topic}': {e}"

# def fetch_youtube_video(topic: str) -> Dict:
#     """Fetch YouTube video link using DuckDuckGo."""
#     try:
#         with DDGS() as ddgs:
#             results = list(ddgs.videos(f"{topic} tutorial", max_results=2))
#             if results:
#                 video = results[0]
#                 return {
#                     "url": video.get("content", ""),
#                     "title": video.get("title", "Unknown"),
#                     "description": video.get("description", "")
#                 }
#             logger.info(f"No YouTube results found for '{topic}'.")
#             return {}
#     except Exception as e:
#         logger.error(f"YouTube video fetch failed for '{topic}': {e}")
#         return {}

def fetch_youtube_video(topic: str) -> Dict:
    """Fetch YouTube video link using DuckDuckGo. Fallback to YouTube search URL if no video is found."""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.videos(f"{topic} tutorial", max_results=2))
            if results:
                video = results[0]
                return {
                    "url": video.get("content", ""),
                    "title": video.get("title", "Unknown"),
                    "description": video.get("description", "")
                }
            else:
                logger.info(f"No YouTube video results found for '{topic}'. Falling back to YouTube search URL.")
                return {
                    "url": f"https://www.youtube.com/results?search_query={topic.replace(' ', '+')}+tutorial",
                    "title": "Explore on YouTube",
                    "description": "No direct video found. Here's a search link to explore related videos."
                }
    except Exception as e:
        logger.error(f"YouTube video fetch failed for '{topic}': {e}")
        return {
            "url": f"https://www.youtube.com/results?search_query={topic.replace(' ', '+')}+tutorial",
            "title": "Explore on YouTube (Fallback)",
            "description": f"⚠️ Error fetching video. You can still try this search link."
        }
