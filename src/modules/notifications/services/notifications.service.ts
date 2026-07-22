import User from "@/modules/users/schemas/User";
import dbConnect from "@/lib/db";

export async function sendPushNotification(userId: string, title: string, body: string, data?: any) {
  try {
    await dbConnect();
    const user = await User.findById(userId);

    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log(`No FCM tokens found for user ${userId}`);
      return false;
    }

    // Mock sending notification since Firebase has been removed
    console.log(`[Mock Push Notification] Sent to ${userId}: ${title} - ${body}`);

    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}
