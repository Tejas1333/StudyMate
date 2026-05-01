// ai/fileHandler.js
import fs from "fs/promises";
import os from "os";
import path from "path";

export const handleFileUpload = async (file) => {
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `${Date.now()}-${file.name}`);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(tempFilePath, buffer);

  return tempFilePath;
};

export const cleanupFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.error("Cleanup failed:", err);
  }
};