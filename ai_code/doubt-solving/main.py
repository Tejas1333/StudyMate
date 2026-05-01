# main.py
import sys
import json
import re
import base64
from groq import Groq
from dotenv import load_dotenv
from fpdf import FPDF
from notes import clean_text_for_pdf, generate_pdf_from_json, get_groq_response
from yt_videos import search_youtube # Import the YouTube search function

load_dotenv()

# --- MAIN EXECUTION BLOCK ---
if __name__ == "__main__":
    result_dict = {}
    try:
        input_data = sys.stdin.read()
        request = json.loads(input_data)
        task = request.get("aiTask")
        user_query = request.get("query")
        
        if not task or not user_query:
            raise ValueError("Both 'aiTask' and 'query' fields are required.")

        if task == "doubt-solving":
            system_prompt = (
                "You are a helpful AI assistant. Your goal is to provide accurate and concise "
                "answers. Use Markdown for formatting, such as bolding and bullet points."
            )
            response_content = get_groq_response(user_query, system_prompt)
            result_dict = {"response": response_content, "isPdf": False}

        elif task == "generate-notes":
            system_prompt = (
                "You are a note-taking assistant. Based on the user's topic, generate detailed notes. "
                "Your response MUST be a valid JSON array of objects. Each object must have a 'topic' key "
                "and an 'explanation' key. Use markdown bolding with ** for important terms within the explanation."
            )
            ai_response_str = get_groq_response(user_query, system_prompt)
            cleaned_str = re.sub(r'^```json\s*|\s*```$', '', ai_response_str.strip())
            # print("DEBUG RAW AI:", ai_response_str)
            notes_json = json.loads(cleaned_str)
            
            pdf_bytes = generate_pdf_from_json(notes_json)
            pdf_b64 = base64.b64encode(pdf_bytes).decode('utf-8')
            display_text = ""
            for item in notes_json:
                display_text += f"**{item.get('topic', '')}**\n{item.get('explanation', '')}\n\n"
            file_name = f"Notes_on_{user_query.replace(' ', '_')}.pdf"
            result_dict = {
                "isPdf": True,
                "displayText": display_text.strip(),
                "pdfData": pdf_b64,
                "fileName": file_name
            }

        elif task == "find-youtube-videos":
            # Call search_youtube with specific types: video and playlist
            items = search_youtube(user_query, result_types=['video', 'playlist'])
            if items:
                response_content = "**Here are some YouTube results I found for you:**\n\n"
                for item in items:
                    if item['type'] == 'video':
                        response_content += f"▶️ **Video:** [{item['title']}]({item['link']})\n   _From: {item['channel']}_\n\n"
                    elif item['type'] == 'playlist':
                        response_content += f"▶️ **Playlist:** [{item['title']}]({item['link']})\n   _By: {item['channel']}_\n\n"
            else:
                response_content = "Sorry, I couldn't find any YouTube videos or playlists for your query."
            
            result_dict = {"response": response_content, "isPdf": False}
        else:
            raise ValueError(f"Unknown task: {task}")
        
    except Exception as e:
        result_dict = {"error": f"An error occurred in the Python backend: {str(e)}"}
    
    print(json.dumps(result_dict))