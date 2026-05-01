from urllib.parse import urlparse, parse_qs
from typing import Optional, Tuple
from youtube_transcript_api import YouTubeTranscriptApi
from langchain_text_splitters import RecursiveCharacterTextSplitter
import time
import logging
from dataclasses import dataclass
import os
from dotenv import load_dotenv
from groq import Groq  # ✅ added

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Groq client once
client = Groq(api_key=GROQ_API_KEY)


@dataclass
class FetchedTranscriptSnippet:
    text: str
    start: float
    duration: float


def extract_video_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from URL."""
    try:
        parsed_url = urlparse(url)
        if parsed_url.hostname in ["www.youtube.com", "youtube.com"]:
            query = parse_qs(parsed_url.query)
            return query.get("v", [None])[0]
        elif parsed_url.hostname in ["youtu.be"]:
            return parsed_url.path.lstrip("/")
        logger.warning(f"Invalid YouTube URL: {url}")
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
        snippets = [
            FetchedTranscriptSnippet(
                text=item.text, start=item.start, duration=item.duration
            )
            for item in res
        ]

        combined_text = " ".join(snippet.text for snippet in snippets)

        text_split = RecursiveCharacterTextSplitter(
            chunk_size=7000, chunk_overlap=200
        )
        tsplit = text_split.split_text(combined_text)

        if lan == "hi":
            for chunk in tsplit:
                # 🔹 Translate Hindi → English
                response = client.chat.completions.create(
                    model="openai/gpt-oss-120b",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a translation assistant.",
                        },
                        {
                            "role": "user",
                            "content": f"Translate the following Hindi text into fluent English. Only return translated text:\n{chunk}",
                        },
                    ],
                    temperature=0.3,
                )

                translated = response.choices[0].message.content.strip()
                final_trans += translated + " "

                # 🔹 Summarize
                response = client.chat.completions.create(
                    model="openai/gpt-oss-120b",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a summarization assistant.",
                        },
                        {
                            "role": "user",
                            "content": f"Summarize this in 1-2 lines:\n{translated}",
                        },
                    ],
                    temperature=0.5,
                )

                final_sum += response.choices[0].message.content.strip() + "\n"
                time.sleep(1)

        else:
            final_trans = combined_text

            for chunk in tsplit:
                response = client.chat.completions.create(
                    model="openai/gpt-oss-120b",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a summarization assistant.",
                        },
                        {
                            "role": "user",
                            "content": f"Summarize this in 1-2 lines:\n{chunk}",
                        },
                    ],
                    temperature=0.5,
                )

                final_sum += response.choices[0].message.content.strip() + "\n"
    
       

    return final_trans, final_sum