import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import LoyaltyProfile from "@/modules/rewards/schemas/LoyaltyProfile";
import Customer from "@/modules/customers/schemas/Customer";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    
    // We will populate customer details
    const profiles = await LoyaltyProfile.find({})
      .populate({ path: 'customerId', select: 'firstName lastName email companyName' })
      .sort({ pointsBalance: -1 })
      .lean();

    return NextResponse.json({ profiles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
