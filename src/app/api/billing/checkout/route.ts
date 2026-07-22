import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import Company from "@/modules/companies/schemas/Company";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10" as any, // use latest or fixed version
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user || user.hierarchyLevel > 2) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId } = await req.json();
    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    await dbConnect();
    const company = await Company.findById(session.user.companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Create or retrieve Stripe Customer
    let customerId = company.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: company.adminEmail,
        name: company.name,
        metadata: {
          companyId: company._id.toString(),
        },
      });
      customerId = customer.id;
      // @ts-ignore - we added this in the next step
      company.stripeCustomerId = customerId;
      await company.save();
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/settings/billing?canceled=true`,
      metadata: {
        companyId: company._id.toString(),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
