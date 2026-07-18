import { NextResponse } from 'next/server';
import { getSession } from "@/lib/auth-utils";
import { getWhatsAppStatus, initializeWhatsAppClient, disconnectWhatsAppClient } from "@/lib/whatsappClient";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const status = getWhatsAppStatus();
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
      // Don't await initialization to prevent timeout, it runs in background
      initializeWhatsAppClient(user.companyId).catch(console.error);
      return NextResponse.json({ success: true, message: "Initializing WhatsApp client..." });
    }
    
    if (body.action === 'DISCONNECT') {
      await disconnectWhatsAppClient();
      return NextResponse.json({ success: true, message: "Disconnected WhatsApp client." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
