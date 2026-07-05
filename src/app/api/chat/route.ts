import { NextRequest } from "next/server";

const DIFY_API_URL = process.env.DIFY_API_URL || "https://api.dify.ai/v1";
const DIFY_API_KEY = process.env.DIFY_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, conversation_id, inputs } = body;

    const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        inputs: inputs || {},
        user: "qihe_user",
        response_mode: "streaming",
        conversation_id: conversation_id || "",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Dify API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Dify API error: ${response.status}` }),
        { status: response.status },
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API route error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 },
    );
  }
}
