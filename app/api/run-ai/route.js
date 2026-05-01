// app/api/run-ai/route.js
import { runAIService } from "@/ai/ai.service";

export async function POST(req) {
  try {
    const output = await runAIService(req);

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}