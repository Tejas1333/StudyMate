// app/api/run-ai/route.js
import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";
import os from "os";

export async function POST(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let aiTask;
  let query;
  let tempFilePath = null;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      aiTask = formData.get("aiTask");
      const queryStr = formData.get("query");
      query = JSON.parse(queryStr);
      if (!file) {
        return new Response(JSON.stringify({ error: "No file uploaded." }), {
          status: 400,
        });
      }
      const tempDir = os.tmpdir();
      tempFilePath = path.join(tempDir, `${Date.now()}-${file.name}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(tempFilePath, buffer);
      query.filePath = tempFilePath;
    } else {
      const body = await req.json();
      aiTask = body.aiTask;
      query = body.query;
    }
    console.log(aiTask, query);

    let pythonScriptPath;

    if (
      aiTask === "doubt-solving" ||
      aiTask === "generate-notes" ||
      aiTask === "find-youtube-videos"
    ) {
      pythonScriptPath = path.join(
        process.cwd(),
        "ai_code",
        "doubt-solving",
        "main.py",
      );
    } else if (aiTask === "flashcards_mindmap") {
      pythonScriptPath = path.join(
        process.cwd(),
        "ai_code",
        "flashcards-mindmap",
        "main.py",
      );
    } else if (aiTask === "career") {
      pythonScriptPath = path.join(
        process.cwd(),
        "ai_code",
        "career",
        "main.py",
      );
    } else if (aiTask === "mcq") {
      pythonScriptPath = path.join(process.cwd(), "ai_code", "mcq", "main.py");
    } else if (aiTask === "yt-summarizer") {
      pythonScriptPath = path.join(
        process.cwd(),
        "ai_code",
        "yt-summarizer", // Ensure this path is correct for your yt-summarizer main.py
        "main.py",
      );
    } else {
      return new Response(
        JSON.stringify({ error: `Unknown AI task: ${aiTask}` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const python = spawn("python", [pythonScriptPath]);

    let result = "";
    let error = "";

    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (data) => {
      error += data.toString();
    });

    // Send both query and aiTask to the Python script
    python.stdin.write(JSON.stringify({ query, aiTask }));
    python.stdin.end();

    await new Promise((resolve, reject) => {
      python.on("close", (code) => {
        resolve(code);
      });
      python.on("error", (err) => {
        reject(err);
      });
    });

    if (error && !result) {
      return new Response(JSON.stringify({ error: error }), {
        status: 500,
      });
    }

    try {
      const output = JSON.parse(result);

      if (output.error) {
        return new Response(JSON.stringify({ error: output.error }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      // --- CRITICAL FIX FOR YT-SUMMARIZER & GEN-NOTES ---
      // If the Python script returns an object with `isPdf` or `Summary` at the top level,
      // forward that entire object. Otherwise, wrap it in a 'response' key as before.
      if (output.isPdf || output.Summary) {
        // Check for 'Summary' key
        return new Response(JSON.stringify(output), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Default behavior for other tasks that just return a 'response' key
      return new Response(JSON.stringify({ response: output.response }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error(
        "Failed to parse Python output or invalid output format:",
        err,
      );
      return new Response(
        JSON.stringify({
          error: "Failed to parse Python output or invalid output format",
          details: result, // Include raw Python output for debugging
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (err) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: "Server error: " + err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  } finally {
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupErr) {
        console.error("Failed to delete temporary file:", cleanupErr);
      }
    }
  }
}
