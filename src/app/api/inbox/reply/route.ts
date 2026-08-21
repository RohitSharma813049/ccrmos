import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAuthenticatedUser } from "@/lib/auth-utils";
import CallLog from "@/modules/core/schemas/CallLog";

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    const data = await req.json();
    const { originalMessageId, channel, to, content } = data;

    if (!originalMessageId || !content) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Find original to link it
    const originalLog = await CallLog.findById(originalMessageId);

    // Create a new outbound log for the reply
    const replyLog = await CallLog.create({
      companyId: user.companyId,
      leadId: originalLog?.leadId,
      customerId: originalLog?.customerId,
      agentId: user._id,
      channel: channel || "Email",
      direction: "outbound",
      status: "sent",
      notes: content,
      toNumber: to,
    });

    return NextResponse.json({ success: true, logId: replyLog._id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
