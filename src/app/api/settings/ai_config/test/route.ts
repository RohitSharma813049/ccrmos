import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    await requireAuthenticatedUser();
    
    const body = await req.json();
    const { provider, key, model } = body;
    
    if (!key) {
      return NextResponse.json({ error: "API Key is required for testing." }, { status: 400 });
    }

    if (provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: model || "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 5
        })
      });

      if (!response.ok) {
        const err = await response.json();
        return NextResponse.json({ error: err.error?.message || "Invalid OpenAI Key" }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    } 
    else if (provider === "anthropic") {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: model || "claude-3-haiku-20240307",
          max_tokens: 5,
          messages: [{ role: "user", content: "Hello" }]
        })
      });

      if (!response.ok) {
        const err = await response.json();
        return NextResponse.json({ error: err.error?.message || "Invalid Anthropic Key" }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: "Unknown provider." }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
