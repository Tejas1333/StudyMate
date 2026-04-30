# ai_code/yt-summarizer/main.py
import sys
import json
import logging
from youtube_utils import extract_video_id, get_transcript_and_summary
# from pinecone_utils import index_documents # Assuming these are needed for context
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Setup logging (optional, but good for debugging)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def process_video_and_output_json(youtube_url: str):
    """
    Fetches transcript and summary, and returns them as a JSON string.
    Note: The Pinecone/Chroma indexing and RAG part is omitted here
    as the frontend only asks for summary and transcript directly.
    If you need RAG in the future, this function would need further modification
    to return a different type of response or integrate the RAG query.
    """
    
    try:
        # Extract video ID
        video_id = extract_video_id(youtube_url)
        if not video_id:
            raise ValueError("Invalid YouTube URL provided.")

        # Fetch transcript and summary
        # logger.info("⏳ Fetching transcript and generating summary...")
        transcript, summary = get_transcript_and_summary(video_id)

        # Prepare the output JSON
        output_data = {
            "Summary": {
                "summary": summary,
                "transcript": transcript
            }
        }
        return json.dumps(output_data)

    except Exception as e:
        logger.error(f"Error in process_video_and_output_json: {e}")
        return json.dumps({"error": f"Failed to summarize video: {str(e)}"})

if __name__ == "__main__":
    # Read input from stdin
    input_data = sys.stdin.read()
    request = json.loads(input_data)
    
    # Extract the query (YouTube URL)
    youtube_url = request.get("query")

    if not youtube_url:
        print(json.dumps({"error": "No YouTube URL provided in the request."}))
        sys.exit(1)

    # Process the video and print the JSON output
    json_output = process_video_and_output_json(youtube_url)
    print(json_output)