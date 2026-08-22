import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import Company from "@/modules/companies/schemas/Company";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
      if (!webhookSecret) {
        throw new Error("Missing STRIPE_WEBHOOK_SECRET");
      }
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed.`, err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    await dbConnect();

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        const companyId = session.client_reference_id;

        if (companyId) {
          await Company.findByIdAndUpdate(companyId, {
            status: "Active",
            subscriptionStatus: "active",
            checkoutToken: undefined,
          });
          console.log(`Company ${companyId} subscription activated via Stripe Webhook!`);
        }
        break;

      case "customer.subscription.deleted":
      case "invoice.payment_failed":
        // Fallback or suspension logic could go here
        console.log(`Payment failed or subscription ended for event: ${event.id}`);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
