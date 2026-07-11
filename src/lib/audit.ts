import dbConnect from "./db";
import AuditLog from "@/modules/audit/schemas/AuditLog";
import { headers } from "next/headers";

/**
 * Log an action to the AuditLog collection.
 */
export async function logActivity(
  companyId: string,
  userId: string,
  module: string,
  recordId: string,
  action: string,
  changes: Record<string, any> = {}
) {
  try {
    await dbConnect();
    
    // Attempt to extract IP and Device safely from headers in App Router
    let ipAddress = "unknown";
    let device = "unknown";
    try {
      const headersList = await headers();
      ipAddress = headersList.get("x-forwarded-for") || "unknown";
      device = headersList.get("user-agent") || "unknown";
    } catch (e) {
      // Ignore header extraction errors outside of request context
    }

    await AuditLog.create({
      companyId,
      userId,
      module,
      recordId,
      action,
      changes,
      ipAddress,
      device,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
