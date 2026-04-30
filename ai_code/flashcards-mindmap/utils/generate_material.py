from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from dotenv import load_dotenv
import streamlit as st
from utils.structure import StudyGuide
from groq import Groq  # ✅ added
import os

load_dotenv()


def generate_study_materials(content: str, groq_api_key: str) -> dict:
    """
    Generates a mind map and flashcards using Groq SDK.
    """
    try:
        # ✅ Initialize Groq client
        client = Groq(api_key=groq_api_key)

        parser = JsonOutputParser(pydantic_object=StudyGuide)

        prompt_template = PromptTemplate(
            template="""
            You are a world-class AI expert at creating deeply hierarchical outlines.
            Your task is to analyze the provided text and create a comprehensive study guide in a structured JSON format.

            The study guide must contain two main keys: "mind_map" and "flashcards".

            1.  **mind_map**:
                - Keys must always be topic names.
                - Values must always be nested objects.
                - NO descriptions allowed.
                - Leaf nodes must be empty objects {{}}.

            2.  **flashcards**:
                - List of 10 flashcards.
                - Each must contain "question" and "answer".

            CONTENT:
            {content}

            FORMAT INSTRUCTIONS:
            {format_instructions}
            """,
            input_variables=["content"],
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )

        # ✅ Format prompt manually (no LCEL)
        prompt = prompt_template.format(content=content)

        # ✅ Groq call
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": "You are a structured JSON generator."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )

        output_text = response.choices[0].message.content.strip()

        # ✅ Clean markdown if present
        output_text = output_text.replace("```json", "").replace("```", "").strip()

        # ✅ Parse using LangChain parser
        parsed_output = parser.parse(output_text)

        return parsed_output

    except Exception as e:
        return {"error": str(e)}