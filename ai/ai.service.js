// ai/ai.service.js
import { getPythonScriptPath } from "./ai.router";
import { runPythonScript } from "./pythonRunner";
import { parsePythonOutput } from "./ai.parser";
import { handleFileUpload, cleanupFile } from "./fileHandler";

export const runAIService = async (req) => {
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

      if (!file) throw new Error("No file uploaded");

      tempFilePath = await handleFileUpload(file);
      query.filePath = tempFilePath;

    } else {
      const body = await req.json();
      aiTask = body.aiTask;
      query = body.query;
    }

    const scriptPath = getPythonScriptPath(aiTask);

    const result = await runPythonScript(scriptPath, {
      aiTask,
      query,
    });

    return parsePythonOutput(result);

  } finally {
    await cleanupFile(tempFilePath);
  }
};