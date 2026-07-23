import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import Company from "@/modules/companies/schemas/Company";
import Stripe from "stripe";

let stripeClient: Stripe;
function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
      apiVersion: "2024-04-10" as any,
    });
  }
  return stripeClient;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    
    // Ensure the user is a Founder (level 2) attempting to cancel their own company's plan
    if (user.hierarchyLevel !== 2) {
      return NextResponse.json({ error: "Only the company founder can cancel subscriptions." }, { status: 403 });
    }

    const companyId = user.companyId || user.id;

    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    if (company.subscriptionStatus !== "active") {
      return NextResponse.json({ error: "No active subscription found to cancel." }, { status: 400 });
    }

    // Cancel the subscription in Stripe if ID exists
    if (company.stripeSubscriptionId) {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(company.stripeSubscriptionId);
    }

    // Cancel the subscription locally
    company.subscriptionStatus = "canceled";
    await company.save();

    return NextResponse.json({ success: true, message: "Subscription canceled successfully." });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
