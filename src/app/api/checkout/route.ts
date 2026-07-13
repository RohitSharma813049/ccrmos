import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/modules/companies/schemas/Company";
import Coupon from "@/modules/coupons/schemas/Coupon";

// Validate Token & Calculate Price
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const couponCode = searchParams.get("coupon");

    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 400 });

    const company = await Company.findOne({ checkoutToken: token }).populate("subscriptionPlanId");
    
    if (!company) {
      return NextResponse.json({ error: "Invalid or expired checkout token" }, { status: 404 });
    }

    if (company.subscriptionStatus !== "pending_payment") {
      return NextResponse.json({ error: "Company is already active." }, { status: 400 });
    }

    const plan = company.subscriptionPlanId as any;
    let originalPrice = plan?.price || 0;
    let finalPrice = originalPrice;
    let discount = 0;
    let validCouponId = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        // Validation: expiry
        if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
          return NextResponse.json({ error: "Coupon has expired." }, { status: 400 });
        }
        // Validation: usage limit
        if (coupon.maxUses && (coupon.currentUses || 0) >= coupon.maxUses) {
          return NextResponse.json({ error: "Coupon limit reached." }, { status: 400 });
        }
        
        validCouponId = coupon._id;
        if (coupon.discountType === "percentage") {
          discount = (originalPrice * coupon.discountValue) / 100;
          finalPrice = originalPrice - discount;
        } else {
          discount = coupon.discountValue;
          finalPrice = Math.max(0, originalPrice - discount);
        }
      } else {
        return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
      }
    }

    return NextResponse.json({
      companyName: company.name,
      adminEmail: company.adminEmail,
      planName: plan?.name || "Custom",
      usersQuota: company.usersQuota,
      originalPrice,
      discount,
      finalPrice,
      validCouponId
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Process Payment (Mock)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const payload = await req.json();
    const { token, couponId } = payload;

    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 400 });

    const company = await Company.findOne({ checkoutToken: token });
    if (!company) {
      return NextResponse.json({ error: "Invalid checkout token" }, { status: 404 });
    }

    if (company.subscriptionStatus !== "pending_payment") {
      return NextResponse.json({ error: "Already active." }, { status: 400 });
    }

    // Mark as active
    company.status = "Active";
    company.subscriptionStatus = "active";
    // Usually you'd clear the token or leave it, we'll clear it
    company.checkoutToken = undefined;
    await company.save();

    // Increment coupon usage
    if (couponId) {
      await Coupon.findByIdAndUpdate(couponId, { $inc: { currentUses: 1 } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
