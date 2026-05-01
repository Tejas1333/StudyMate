export const parsePythonOutput = (result) => {
  try {
    const cleaned = result.trim();
    const output = JSON.parse(cleaned);

    if (output.error) {
      throw new Error(output.error);
    }

    return {
      response:
        typeof output.response === "string"
          ? output.response
          : JSON.stringify(output.response || output),
      ...output, // keep other fields like isPdf
    };

  } catch (err) {
    console.error("❌ Raw Python Output:", result);
    throw new Error("Invalid Python output: " + result);
  }
};