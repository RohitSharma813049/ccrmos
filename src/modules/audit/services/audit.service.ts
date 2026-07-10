import AuditLog from "../schemas/AuditLog";
import mongoose from "mongoose";

export async function logActivity({
  companyId,
  userId,
  module,
  recordId,
  action,
  changes = {},
  req
}: {
  companyId: string | mongoose.Types.ObjectId;
  userId: string | mongoose.Types.ObjectId;
  module: string;
  recordId: string;
  action: string;
  changes?: Record<string, any>;
  req?: Request;
}) {
  try {
    let ipAddress = "Unknown";
    let device = "Unknown";

    if (req) {
      ipAddress = req.headers.get("x-forwarded-for") || "Unknown";
      device = req.headers.get("user-agent") || "Unknown";
    }

    await AuditLog.create({
      companyId,
      userId,
      module,
      recordId,
      action,
      changes,
      ipAddress,
      device
    });
  } catch (error) {
    console.error("[Audit Service] Failed to log activity:", error);
  }
}
