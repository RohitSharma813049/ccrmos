import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAuthenticatedUser } from "@/lib/auth-utils";
import CallLog from "@/modules/core/schemas/CallLog";

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    // In a real production system, this would aggregate from multiple collections 
    // or a specialized UnifiedMessage schema. For CRM OS, we are using CallLog 
    // to track all omni-channel outbound/inbound comms.
    const logs = await CallLog.find({ companyId: user.companyId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("leadId", "firstName lastName email")
      .populate("customerId", "companyName contactName email")
      .lean();

    const messages = logs.map((log: any) => {
      // Determine sender/receiver details based on context
      let senderName = "Unknown";
      let from = "system";
      let to = "unknown";
      
      if (log.direction === "inbound") {
        if (log.leadId) {
          senderName = `${log.leadId.firstName || ''} ${log.leadId.lastName || ''}`.trim() || "Lead";
          from = log.leadId.email || log.toNumber || log.fromNumber || "unknown";
        } else if (log.customerId) {
          senderName = log.customerId.contactName || log.customerId.companyName || "Customer";
          from = log.customerId.email || log.toNumber || log.fromNumber || "unknown";
        } else {
          from = log.fromNumber || "unknown";
        }
        to = "You (CRM)";
      } else {
        senderName = "You (CRM)";
        from = user.email;
        if (log.leadId) {
          to = log.leadId.email || log.toNumber || "unknown";
        } else if (log.customerId) {
          to = log.customerId.email || log.toNumber || "unknown";
        } else {
          to = log.toNumber || "unknown";
        }
      }

      return {
        _id: log._id.toString(),
        channel: log.channel || (log.type === "sms" ? "SMS" : "Email"), // fallback mapping
        direction: log.direction,
        subject: log.channel === "Email" ? (log.notes ? log.notes.substring(0, 40) + '...' : "No Subject") : `New ${log.channel || 'Message'}`,
        content: log.notes || "No content available.",
        senderName,
        from,
        to,
        createdAt: log.createdAt,
        status: log.status,
      };
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
