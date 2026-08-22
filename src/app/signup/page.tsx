"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const planId = searchParams.get("planId");
  const billing = searchParams.get("billing") || "Monthly";

  const [formData, setFormData] = useState({
    companyName: "",
    adminName: "",
    adminEmail: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!planId) {
        throw new Error("No subscription plan selected. Please return to pricing.");
      }

      const res = await fetch("/api/public/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subscriptionPlanId: planId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Redirect to checkout with the new token
      router.push(`/checkout?token=${data.checkoutToken}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-[slide-up_0.5s_ease-out_forwards]">
        <div className="glass-panel border border-surface-border rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create Workspace</h1>
            <p className="text-foreground/60 text-sm">
              Let's get your CRM OS set up in seconds.
            </p>
            {planId && (
              <div className="mt-3 inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold">
                Selected Plan: {billing} Billing
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Company Name</label>
              <input 
                type="text" 
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                placeholder="Acme Corp" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Your Name</label>
              <input 
                type="text" 
                name="adminName"
                required
                value={formData.adminName}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                placeholder="John Doe" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Work Email</label>
              <input 
                type="email" 
                name="adminEmail"
                required
                value={formData.adminEmail}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                placeholder="john@acme.com" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Password</label>
              <input 
                type="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                placeholder="••••••••" 
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full h-11 text-base mt-2" 
              disabled={loading}
            >
              {loading ? "Provisioning Workspace..." : "Continue to Payment"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-foreground/50">
            Already have an account? <a href="/login" className="text-primary hover:underline transition-colors">Login here</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
