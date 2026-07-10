import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/modules/notifications/schemas/Notification';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    
    // Fetch notifications for this user, sorting by newest first
    const notifications = await Notification.find({ recipient: user.id })
      .sort({ createdAt: -1 })
      .limit(50);
      
    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const body = await req.json();
    const { notificationId } = body;

    if (notificationId) {
      // Mark a specific notification as read
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: user.id },
        { isRead: true },
        { new: true }
      );
      if (!notification) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }
      return NextResponse.json({ notification });
    } else {
      // Mark all as read
      await Notification.updateMany(
        { recipient: user.id, isRead: false },
        { isRead: true }
      );
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
