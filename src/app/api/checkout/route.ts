import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/modules/companies/schemas/Company";
import Coupon from "@/modules/coupons/schemas/Coupon";
import Stripe from "stripe";

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

// Process Payment via Stripe Checkout (or Mock if no keys)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const payload = await req.json();
    const { token, couponId } = payload;

    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 400 });

    const company = await Company.findOne({ checkoutToken: token }).populate("subscriptionPlanId");
    if (!company) {
      return NextResponse.json({ error: "Invalid checkout token" }, { status: 404 });
    }

    if (company.subscriptionStatus !== "pending_payment") {
      return NextResponse.json({ error: "Already active." }, { status: 400 });
    }

    // Check if Stripe is configured
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-06-20", // or whatever the current TS bindings expect
      });

      const plan = company.subscriptionPlanId as any;
      const priceAmount = (plan?.price || 0) * 100; // Stripe expects cents

      // We'll create a simple one-time payment session for this boilerplate, 
      // but in a full SaaS this would be mode: 'subscription' with Stripe Prices
      const sessionData: any = {
        payment_method_types: ["card"],
        mode: "payment", 
        client_reference_id: company._id.toString(), // Important for webhook matching
        customer_email: company.adminEmail,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: plan?.name ? `CRM OS - ${plan.name} Plan` : "CRM OS Subscription",
                description: "Full access to your tenant workspace",
              },
              unit_amount: priceAmount,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout?token=${token}&canceled=true`,
      };

      // Add Stripe Coupon logic if you wanted to generate a coupon on the fly here
      // (For now, we just pass the raw price)

      const session = await stripe.checkout.sessions.create(sessionData);

      return NextResponse.json({ checkout_url: session.url });
    } else {
      // Mock Fallback
      company.status = "Active";
      company.subscriptionStatus = "active";
      company.checkoutToken = undefined;
      await company.save();

      if (couponId) {
        await Coupon.findByIdAndUpdate(couponId, { $inc: { currentUses: 1 } });
      }

      return NextResponse.json({ success: true, mock: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

