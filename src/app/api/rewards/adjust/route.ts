import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import LoyaltyProfile from "@/modules/rewards/schemas/LoyaltyProfile";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { customerId, amount, reason, type } = await req.json(); // type: 'EARNED' | 'REDEEMED' | 'ADJUSTED'

    if (!customerId || !amount || !reason || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Find or create the profile
    let profile = await LoyaltyProfile.findOne({ customerId });
    if (!profile) {
      profile = new LoyaltyProfile({
        customerId,
        pointsBalance: 0,
        lifetimePoints: 0,
        tier: 'Bronze',
        history: []
      });
    }

    const numAmount = Number(amount);

    if (type === 'REDEEMED' && profile.pointsBalance < numAmount) {
      return NextResponse.json({ error: "Insufficient points balance" }, { status: 400 });
    }

    // Add to history - the Mongoose pre('save') hook will auto-calculate balances and tier
    profile.history.push({
      type,
      amount: numAmount, 
      reason,
      date: new Date()
    });

    await profile.save();

    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
