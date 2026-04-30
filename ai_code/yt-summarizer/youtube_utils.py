from urllib.parse import urlparse, parse_qs
from typing import Optional, Tuple
# import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI

# from langchain_groq import ChatGroq
import time
import logging
from dataclasses import dataclass
import os
from dotenv import load_dotenv
# Load environment variables
load_dotenv()


logger = logging.getLogger(__name__)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Add checks for missing keys (recommended)
if not GOOGLE_API_KEY:
    logger.error("GOOGLE_API_KEY environment variable not set.")
    # Consider raising an error or handling this more robustly
if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY environment variable not set. Groq models might not work.")

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GOOGLE_API_KEY)
@dataclass
class FetchedTranscriptSnippet:
    text: str
    start: float
    duration: float

def extract_video_id(url: str) -> Optional[str]:
    """
    Extract the video ID from a YouTube URL, supporting multiple common formats.
    """
    try:
        parsed_url = urlparse(url)
        if "youtube.com" in parsed_url.hostname:
            # Handles URLs like: https://www.youtube.com/watch?v=dQw4w9WgXcQ
            if parsed_url.path == "/watch":
                return parse_qs(parsed_url.query).get("v", [None])[0]
            # Handles URLs like: https://www.youtube.com/embed/dQw4w9WgXcQ
            if parsed_url.path.startswith("/embed/"):
                return parsed_url.path.split("/")[2]
        elif "youtu.be" in parsed_url.hostname:
            # Handles URLs like: https://youtu.be/dQw4w9WgXcQ
            return parsed_url.path[1:]
        
        logger.warning(f"Could not extract video ID from URL: {url}")
        return None
    except Exception as e:
        logger.error(f"Error extracting video ID from {url}: {e}")
        return None

def get_transcript_and_summary(video_id: str) -> Tuple[str, str]:
    """Fetch transcript and generate summary for a YouTube video."""
    ytt_api = YouTubeTranscriptApi()
    transcript_list = ytt_api.list(video_id)
    final_trans = ""
    final_sum = ""

    for transcript in transcript_list:
        lan = transcript.language_code
        res = transcript.fetch()
        snippets = [FetchedTranscriptSnippet(text=item.text, start=item.start, duration=item.duration) for item in res]
        combined_text = " ".join(snippet.text for snippet in snippets)

        if lan == 'hi':
            text_split = RecursiveCharacterTextSplitter(chunk_size=7000, chunk_overlap=200)
            tsplit = text_split.split_text(combined_text)
            for i in tsplit:
                # llm = ChatGroq(model='gemma2-9b-it', api_key=GROQ_API_KEY)
                prompt = f"""Translate the following Hindi text :\n{i} into fluent English. Return only the translated English text without any explanation"""
                result = llm.invoke(prompt)
                time.sleep(1)
                final_trans += result.content + " "
                prompt = f"""Summarize the following text :\n{i}"""
                result = llm.invoke(prompt)
                final_sum += result.content + "\n"
                # time.sleep(3)
        else:
            final_trans = combined_text
            text_split = RecursiveCharacterTextSplitter(chunk_size=7000, chunk_overlap=200)
            tsplit = text_split.split_text(combined_text)
            for i in tsplit:
                # llm = ChatGroq(model='gemma2-9b-it', api_key=GROQ_API_KEY)
                prompt = f"""Summarize the following text :\n{i} dont add the * and any other symbol"""
                result = llm.invoke(prompt)
                final_sum += result.content + "\n"
    return final_trans, final_sum