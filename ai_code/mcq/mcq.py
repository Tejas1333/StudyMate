from typing import List, Dict
import json
import logging
import os
from dotenv import load_dotenv
from groq import Groq
import streamlit as st

load_dotenv()

# API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    st.error("GROQ_API_KEY is not set.")
    st.stop()

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

EDUCATION_LEVEL = "college"


def generate_mcqs(topic: str, num_questions: int) -> List[Dict]:
    """Generate MCQs using Groq SDK (no LangChain)."""
    try:
        prompt = f"""
Generate {num_questions} multiple-choice questions for the topic "{topic}" suitable for a {EDUCATION_LEVEL} student.

Each question must include:
- question
- 4 options (A, B, C, D)
- correct_answer (A/B/C/D)
- explanation

Return ONLY valid JSON in this format:

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
    "explanation": "Explanation"
  }}
]
"""

        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": "You are a precise MCQ generator."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )

        content = response.choices[0].message.content.strip()
        logger.info(f"Raw Groq response: {content}")

        # Try parsing JSON
        try:
            mcqs = json.loads(content)
            if not isinstance(mcqs, list):
                raise ValueError("MCQs must be a list")
            return mcqs

        except json.JSONDecodeError:
            logger.error("JSON parsing failed. Returning empty list.")
            return []

    except Exception as e:
        logger.error(f"Failed to generate MCQs: {e}")
        return []