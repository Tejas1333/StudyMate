// ai/ai.parser.js
export const parsePythonOutput = (result) => {
  try {
    const output = JSON.parse(result);

    if (output.error) {
      throw new Error(output.error);
    }

    // Special handling (your logic preserved)
    if (output.isPdf || output.Summary) {
      return output;
    }

    return { response: output.response };

  } catch (err) {
    throw new Error("Invalid Python output: " + result);
  }
};