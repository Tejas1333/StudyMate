// ai/pythonRunner.js
import { spawn } from "child_process";

export const runPythonScript = (scriptPath, payload) => {
  return new Promise((resolve, reject) => {
    const python = spawn("python", [scriptPath]);

    let result = "";
    let error = "";

    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (data) => {
      error += data.toString();
    });

    python.stdin.write(JSON.stringify(payload));
    python.stdin.end();

    python.on("close", () => {
      console.log("🐍 RAW OUTPUT:", result); // ADD THIS

      if (error && !result) return reject(error);
      resolve(result);
    });

    python.on("error", reject);
  });
};