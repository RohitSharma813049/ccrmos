import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/modules/users/schemas/User';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();
    
    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription object" }, { status: 400 });
    }

    // Add subscription to user profile if it doesn't already exist
    const dbUser = await User.findById(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subscriptions = dbUser.webPushSubscriptions || [];
    
    // Check if we already have this endpoint
    const exists = subscriptions.some(s => s.endpoint === subscription.endpoint);
    
    if (!exists) {
      subscriptions.push(subscription);
      dbUser.webPushSubscriptions = subscriptions;
      await dbUser.save();
    }

    return NextResponse.json({ message: "Subscription saved successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
