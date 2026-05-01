// app/api/run-ai/route.js
import { runAIService } from "@/ai/ai.service";
import { rateLimit } from "@/lib/rateLimit";
import { handleError } from "@/lib/errorHandler";

export async function POST(req) {
  try {
     const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    rateLimit(ip, 10, 60000); // 10 req/min


    const output = await runAIService(req);

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return handleError(err);
  }
}