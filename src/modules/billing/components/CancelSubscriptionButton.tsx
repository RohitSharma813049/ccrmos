"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will lose access to premium features immediately.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        alert("Your subscription has been canceled.");
        router.refresh(); // Refresh the page to reflect the new status
      } else {
        const data = await res.json();
        alert(data.error || "Failed to cancel subscription.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while canceling.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCancel}
      disabled={loading}
      className="px-4 py-2 bg-zinc-900/40 backdrop-blur-xl text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 font-semibold rounded-lg shadow-sm transition-all text-sm disabled:opacity-50"
    >
      {loading ? "Canceling..." : "Cancel Subscription"}
    </button>
  );
}
