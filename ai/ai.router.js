// ai/ai.router.js
import path from "path";
import { handleError } from "@/lib/errorHandler";

export const getPythonScriptPath = (aiTask) => {
  const base = path.join(process.cwd(), "ai_code");

  switch (aiTask) {
    case "doubt-solving":
    case "generate-notes":
    case "find-youtube-videos":
      return path.join(base, "doubt-solving", "main.py");

    case "flashcards_mindmap":
      return path.join(base, "flashcards-mindmap", "main.py");

    case "career":
      return path.join(base, "career", "main.py");

    case "mcq":
      return path.join(base, "mcq", "main.py");

    case "yt-summarizer":
      return path.join(base, "yt-summarizer", "main.py");

    default:
      throw new Error(`Unknown AI task: ${aiTask}`);
  }
};