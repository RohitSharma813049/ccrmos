import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import Company from "@/modules/companies/schemas/Company";
import Payment from "@/modules/billing/schemas/Payment";
import { requireAuthenticatedUser } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    
    if (!companyId && user.hierarchyLevel !== 1) {
      return NextResponse.json({ error: "Company association required" }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return NextResponse.json({ error: "Missing required verification fields" }, { status: 400 });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Update Payment as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed", razorpayPaymentId: razorpay_payment_id }
      );
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Update Payment as successful
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { 
        status: "successful", 
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      }
    );

    // Update Company subscription status
    if (companyId) {
      await Company.findByIdAndUpdate(companyId, {
        subscriptionPlanId: planId,
        subscriptionStatus: "active"
      });
    }

    return NextResponse.json({ message: "Payment verified successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify payment" }, { status: 500 });
  }
}
