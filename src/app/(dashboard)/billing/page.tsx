import React from 'react';
import { BillingClient } from '@/components/billing/BillingClient';

export default function BillingPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Billing & Subscription</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your pricing tier, payment methods, and invoice history.
          </p>
        </div>
      </div>

      <BillingClient />
    </div>
  );
}
