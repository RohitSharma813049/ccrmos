"use client";

import { useState } from "react";
import Script from "next/script";

interface RazorpayCheckoutProps {
  planId: string;
  planName: string;
  planPrice: number;
  companyName?: string;
  userEmail?: string;
  onSuccess?: () => void;
  buttonClassName?: string;
}

export default function RazorpayCheckout({
  planId,
  planName,
  planPrice,
  companyName = "My Company",
  userEmail = "",
  onSuccess,
  buttonClassName = "px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all w-full",
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create order on backend
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // 2. Initialize Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TCruJXVNk47Le2", // Hardcoded fallback for testing
        amount: data.amount,
        currency: data.currency,
        name: "CRM OS",
        description: `Subscription: ${planName}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          // 3. Verify payment on backend
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: planId
              }),
            });

            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok) {
              alert("Payment successful! Your subscription is now active.");
              if (onSuccess) onSuccess();
            } else {
              alert(verifyData.error || "Payment verification failed.");
            }
          } catch (err) {
            console.error(err);
            alert("An error occurred during verification.");
          }
        },
        prefill: {
          name: companyName,
          email: userEmail,
        },
        theme: {
          color: "#2563EB", // Tailwind blue-600
        },
      };

      // 4. Open Razorpay Checkout
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      
      paymentObject.on('payment.failed', function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
      });

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button 
        onClick={handlePayment} 
        disabled={loading}
        className={buttonClassName}
      >
        {loading ? "Processing..." : `Subscribe Now (₹${planPrice})`}
      </button>
    </>
  );
}
