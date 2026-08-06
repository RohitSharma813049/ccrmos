import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Agent from "@/modules/ai/schemas/Agent";
import { requireAuthenticatedUser } from "@/lib/auth-utils";
import { buildTenantQuery } from "@/lib/access-control";

export async function POST(req: Request) {
  await dbConnect();
  
  try {
    const user = await requireAuthenticatedUser();
    const tenantQuery = buildTenantQuery(user);
    
    // Find the active AI Agent for this tenant
    const agent = await Agent.findOne({ ...tenantQuery, active: true }).sort({ createdAt: -1 });
    
    if (!agent) {
      return NextResponse.json({ 
        role: "assistant", 
        content: "Hello! I am the default AI Assistant. It looks like you haven't configured a custom AI Agent for your company yet. Please go to Settings > AI Agents to set one up!" 
      });
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];

    // NOTE: This is a mocked LLM response for demonstration.
    // In production, you would pass `agent.prompt` as the system message
    // and `messages` as the conversation history to OpenAI or Anthropic.

    const userFirstName = user.firstName || "User";
    const agentName = agent.name || "AI Agent";
    
    // Generate a contextual mock response
    let mockResponse = `Hi ${userFirstName}, I am ${agentName}. `;
    
    const userMessage = lastMessage?.content?.toLowerCase() || "";
    
    if (userMessage.includes("help") || userMessage.includes("what can you do")) {
      mockResponse += `Based on my instructions, my primary role is: ${agent.role}. I am here to help you manage your CRM data effectively.`;
    } else if (userMessage.includes("lead") || userMessage.includes("customer")) {
      mockResponse += `I'd be happy to help you with your leads and customers. Could you provide more specific details?`;
    } else if (userMessage.includes("hello") || userMessage.includes("hi")) {
      mockResponse += `How can I assist you with your CRM today?`;
    } else {
      mockResponse += `I've received your message: "${lastMessage?.content}". (This is a simulated AI response. To generate real responses, integrate an OpenAI API key in this route).`;
    }

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({
      role: "assistant",
      content: mockResponse
    });

  } catch (error: any) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
