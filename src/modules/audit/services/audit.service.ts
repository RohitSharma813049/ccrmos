import AuditLog from "../schemas/AuditLog";
import mongoose from "mongoose";
import User from "../../users/schemas/User";

export async function logActivity({
  companyId,
  userId,
  module,
  recordId,
  action,
  changes = {},
  ipAddress,
  device,
  req
}: {
  companyId: string | mongoose.Types.ObjectId;
  userId: string | mongoose.Types.ObjectId;
  module: string;
  recordId: string;
  action: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  device?: string;
  req?: Request;
}) {
  try {
    // We will log actions for all users, including Platform Owners, so they can see their own actions.

    let finalIpAddress = ipAddress || "Unknown";
    let finalDevice = device || "Unknown";

    if (req) {
      try {
        finalIpAddress = req.headers.get("x-forwarded-for") || finalIpAddress;
        finalDevice = req.headers.get("user-agent") || finalDevice;
      } catch (e) {
        // req might be destroyed if accessed async after response
      }
    }

    await AuditLog.create({
      companyId,
      userId,
      module,
      recordId,
      action,
      changes,
      ipAddress: finalIpAddress,
      device: finalDevice
    });
  } catch (error) {
    console.error("[Audit Service] Failed to log activity:", error);
  }
}
