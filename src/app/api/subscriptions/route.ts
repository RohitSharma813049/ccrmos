import { NextResponse } from "next/server";
import mongoose from "mongoose";
import SubscriptionPlan from "@/modules/settings/schemas/SubscriptionPlan";
import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";

// GET /api/subscriptions
export async function GET() {
  try {
    // Only Platform Owners manage the subscription tiers
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    // Only fetch active plans
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    
    return NextResponse.json({ plans }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/subscriptions
export async function POST(req: Request) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { name, price, billing, users, features } = await req.json();
    
    if (!name || price === undefined || !users) {
      return NextResponse.json({ error: "Name, price, and users are required." }, { status: 400 });
    }
    
    const newPlan = await SubscriptionPlan.create({
      name,
      price: Number(price),
      billing: billing || "Monthly",
      users,
      features: features || [],
      isActive: true
    });
    
    return NextResponse.json({ message: "Subscription tier created.", plan: newPlan }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
