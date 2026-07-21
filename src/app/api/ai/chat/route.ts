import { NextRequest, NextResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Note: We would normally fetch the tenant's AI Config from the database here
    // e.g. const aiConfig = await SystemSetting.findOne({ type: 'ai_config' });
    // And then use the API key to call OpenAI / Anthropic.

    // For this prototype, we'll provide a mock intelligent response based on the prompt.
    // We'll simulate a slight network delay to make it feel real.
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));

    let reply = "I'm a prototype AI Co-Pilot! Please configure an OpenAI API key in the Control Center to enable real responses.";

    const p = prompt.toLowerCase();
    if (p.includes("draft") && p.includes("email")) {
      reply = `Here's a draft email for your lead:\n\nSubject: Following up on your inquiry\n\nHi there,\n\nI noticed you recently showed interest in our platform. I'd love to jump on a quick 10-minute call to see how we can help your business grow.\n\nAre you available sometime this Tuesday or Wednesday?\n\nBest,\n${session.user.name || 'Your Sales Rep'}`;
    } else if (p.includes("summarize") && p.includes("lead")) {
      reply = "Based on the recent activity, this lead has been quite engaged. They opened our last 3 emails and visited the pricing page twice yesterday. I recommend reaching out via WhatsApp to schedule a demo.";
    } else if (p.includes("hi") || p.includes("hello")) {
      reply = "Hello there! I'm ready to help you manage your CRM. What would you like to do?";
    } else if (p.includes("discount") || p.includes("coupon")) {
      reply = "You can manage your coupons in the Control Center under 'Coupons & Discounts'. Would you like me to draft a promotional email for you?";
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
