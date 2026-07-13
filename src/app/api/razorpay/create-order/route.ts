import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import SubscriptionPlan from "@/modules/settings/schemas/SubscriptionPlan";
import Company from "@/modules/companies/schemas/Company";
import Payment from "@/modules/billing/schemas/Payment";
import { requireAuthenticatedUser } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    
    // Allow either the tenant themselves (via companyId) or Platform Owner (impersonating)
    const companyId = user.companyId || user.impersonatedFounderId;
    if (!companyId && user.hierarchyLevel !== 1) {
      return NextResponse.json({ error: "Company association required" }, { status: 400 });
    }

    const { planId } = await req.json();
    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Invalid or inactive plan" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Create a one-time order for the plan amount
    // Razorpay amount is in smallest currency unit (paise for INR)
    const amountInSmallestUnit = plan.price * 100;
    
    const order = await razorpay.orders.create({
      amount: amountInSmallestUnit,
      currency: "INR",
      receipt: `receipt_${Date.now()}_${companyId}`,
    });

    // Save payment record
    await Payment.create({
      companyId: companyId || mongoose.Types.ObjectId.createFromTime(Date.now()), // fallback for testing if owner
      amount: plan.price,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "created"
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency }, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
