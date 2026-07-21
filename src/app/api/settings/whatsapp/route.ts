import { NextResponse } from 'next/server';
import { getSession } from "@/lib/auth-utils";
import { getWhatsAppStatus, initializeWhatsAppClient, disconnectWhatsAppClient } from "@/lib/whatsappClient";

export const maxDuration = 60; // Allow Vercel to run up to 60s for Chrome boot

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const scopeId = url.searchParams.get('scopeId') || user.companyId;

    const status = getWhatsAppStatus(scopeId);
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    
    if (body.action === 'INITIALIZE') {
      try {
        const scopeId = body.scopeId || user.companyId;
        await initializeWhatsAppClient(user.companyId, scopeId);
        return NextResponse.json({ success: true, message: "WhatsApp client initialized." });
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }
    
    if (body.action === 'DISCONNECT') {
      const scopeId = body.scopeId || user.companyId;
      await disconnectWhatsAppClient(scopeId);
      return NextResponse.json({ success: true, message: "Disconnected WhatsApp client." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
