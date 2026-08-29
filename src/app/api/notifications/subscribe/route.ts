import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/modules/users/schemas/User';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();
    
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Add subscription to user profile if it doesn't already exist
    const dbUser = await User.findById(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tokens = dbUser.fcmTokens || [];
    
    // Check if we already have this token
    const exists = tokens.includes(token);
    
    if (!exists) {
      tokens.push(token);
      dbUser.fcmTokens = tokens;
      await dbUser.save();
    }

    return NextResponse.json({ message: "Subscription saved successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
