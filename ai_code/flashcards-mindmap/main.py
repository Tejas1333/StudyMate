import sys
import json
import base64
import os
from dotenv import load_dotenv
import fitz  # PyMuPDF library for reading PDFs
from utils.generate_material import generate_study_materials

load_dotenv()
groq_api_key = os.getenv('GROQ_API_KEY')

def run_model(input_method, content, file_name=None):
    flashcards = []
    mind_map = {}

    # --- NEW: Logic for PDF processing ---
    if input_method == "pdf":
        try:
            # Decode the base64 string into bytes
            pdf_bytes = base64.b64decode(content)

            # Extract text from the PDF bytes
            full_text = ""
            with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
                for page in doc:
                    full_text += page.get_text()

            if not full_text.strip():
                # Handle cases where PDF has no text (e.g., images only)
                mind_map = {"error": "Could not extract text from the PDF."}
                flashcards = [{"question": "Extraction Error", "answer": "The PDF might contain only images or be empty."}]
            else:
                # If text is extracted, use it as the content for the AI
                content = f"Based on the document '{file_name}', {full_text}"
                # Fall through to the main generation logic

        except Exception as e:
            print(f"Error processing PDF: {e}", file=sys.stderr)
            mind_map = {"error": "Failed to process the PDF file."}
            flashcards = [{"question": "Processing Error", "answer": "There was an issue reading the uploaded PDF."}]
            return {"mindMap": mind_map, "flashcards": flashcards}

    # --- Main Generation Logic for Topic, Plain Text, and now PDF Content ---
    if content:
        # This block now handles topic, plain_text, and the extracted text from PDFs
        con = generate_study_materials(content, groq_api_key=groq_api_key)

        if isinstance(con, dict):
            flashcards = con.get('flashcards', [])
            mind_map = con.get('mind_map', {}) 
        else:
            print(f"API call failed. Received error: {con}", file=sys.stderr)
            # Return empty data if AI fails
            flashcards = []
            mind_map = {}

    return {"mindMap": mind_map, "flashcards": flashcards}

def main():
    try:
        input_data = json.loads(sys.stdin.read())
        query_data = input_data.get("query", {})
        input_method = query_data.get("inputMethod")

        content = ""
        file_name = None

        if input_method == "topic":
            content = query_data.get("topicName", "")
        elif input_method == "plain_text":
            content = query_data.get("plainTextContent", "")
        elif input_method == "pdf":
            # For PDF, content is the base64 string, which we process in run_model
            content = query_data.get("fileContent", "")
            file_name = query_data.get("fileName", "")

        if not content:
            raise ValueError("No content provided for generation.")

        result = run_model(input_method, content, file_name)

        print(json.dumps({"response": result}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()