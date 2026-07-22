"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

// Make sure to set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function StripeCheckoutClient({
  planId,
  planName,
  planPrice,
  buttonClassName,
}: {
  planId: string;
  planName: string;
  planPrice: number;
  companyName?: string;
  userEmail?: string;
  buttonClassName?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Create Checkout Session
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: planId, // Assuming planId in DB maps to the Stripe Price ID
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to initiate checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={buttonClassName || "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"}
    >
      {loading ? "Processing..." : `Upgrade to ${planName}`}
    </button>
  );
}
