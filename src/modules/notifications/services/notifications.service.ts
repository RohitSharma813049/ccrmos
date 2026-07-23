import User from "@/modules/users/schemas/User";
import dbConnect from "@/lib/db";

import Notification from "../schemas/Notification";

export async function sendPushNotification(userId: string, title: string, body: string, data?: any) {
  try {
    await dbConnect();
    
    // 1. Send Push (Mocked)
    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log(`[Mock Push Notification] User ${userId} has no FCM tokens, but we will still create a system notification.`);
    } else {
      console.log(`[Mock Push Notification] Sent to ${userId}: ${title} - ${body}`);
    }

    // 2. Create System Notification
    await Notification.create({
      recipient: userId,
      title,
      message: body,
      type: "info",
      link: data?.link || `/dashboard`,
      companyId: user?.companyId?.toString()
    });

    return true;
  } catch (error) {
    console.error("Error sending push/system notification:", error);
    return false;
  }
}
