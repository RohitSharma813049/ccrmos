import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import LoyaltyProfile from "@/modules/rewards/schemas/LoyaltyProfile";

// Helper to determine tier based on lifetime points
function calculateTier(lifetimePoints: number) {
  if (lifetimePoints >= 10000) return 'Platinum';
  if (lifetimePoints >= 5000) return 'Gold';
  if (lifetimePoints >= 1000) return 'Silver';
  return 'Bronze';
}

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

    // Apply the transaction
    if (type === 'EARNED') {
      profile.pointsBalance += numAmount;
      profile.lifetimePoints += numAmount;
    } else if (type === 'REDEEMED') {
      if (profile.pointsBalance < numAmount) {
        return NextResponse.json({ error: "Insufficient points balance" }, { status: 400 });
      }
      profile.pointsBalance -= numAmount;
    } else if (type === 'ADJUSTED') {
      // Amount can be positive or negative
      profile.pointsBalance += numAmount;
      if (numAmount > 0) {
        profile.lifetimePoints += numAmount;
      }
    }

    // Recalculate tier based on lifetime points
    profile.tier = calculateTier(profile.lifetimePoints);

    // Add to history
    profile.history.push({
      type,
      amount: Math.abs(numAmount), // store absolute amount
      reason,
      date: new Date()
    });

    await profile.save();

    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
