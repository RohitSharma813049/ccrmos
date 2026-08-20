'use client';

import React from 'react';
import { Check, CreditCard, Download, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$49',
    interval: '/mo',
    description: 'Perfect for solo agents just getting started.',
    features: ['Up to 500 contacts', 'Basic CRM features', 'Email support', '1 User seat'],
    buttonText: 'Current Plan',
    isPopular: false,
    isActive: true,
  },
  {
    name: 'Professional',
    price: '$99',
    interval: '/mo',
    description: 'Advanced tools for growing teams and agencies.',
    features: ['Unlimited contacts', 'Advanced automations', 'Priority 24/7 support', 'Up to 5 User seats', 'Custom pipelines'],
    buttonText: 'Upgrade Now',
    isPopular: true,
    isActive: false,
  },
  {
    name: 'Enterprise',
    price: '$249',
    interval: '/mo',
    description: 'Custom solutions for high-volume brokerages.',
    features: ['Everything in Pro', 'Dedicated success manager', 'Custom API integrations', 'Unlimited User seats', 'White-labeling'],
    buttonText: 'Contact Sales',
    isPopular: false,
    isActive: false,
  }
];

const mockInvoices = [
  { id: 'INV-2026-08', date: 'Aug 01, 2026', amount: '$49.00', status: 'Paid' },
  { id: 'INV-2026-07', date: 'Jul 01, 2026', amount: '$49.00', status: 'Paid' },
  { id: 'INV-2026-06', date: 'Jun 01, 2026', amount: '$49.00', status: 'Paid' },
];

export function BillingClient() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* Current Subscription Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-100">Subscription Plans</h2>
          <p className="text-sm text-zinc-400 mt-1">Upgrade your plan to unlock advanced features and more seats.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 ${
                plan.isPopular 
                  ? 'bg-zinc-900/80 border-indigo-500/50 shadow-2xl shadow-indigo-500/10 scale-105 z-10' 
                  : 'bg-zinc-900/40 border-zinc-800/60'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="flex items-center gap-1 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-indigo-500/25">
                    <Zap className="w-3 h-3" />
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-zinc-100">{plan.name}</h3>
                <p className="text-sm text-zinc-400 mt-1 h-10">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-100">{plan.price}</span>
                <span className="text-zinc-500 font-medium">{plan.interval}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className={`w-4 h-4 mt-0.5 ${plan.isPopular ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  plan.isActive 
                    ? 'bg-zinc-800 text-zinc-400 cursor-default' 
                    : plan.isPopular
                      ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md hover:shadow-indigo-500/25'
                      : 'bg-zinc-100 hover:bg-white text-zinc-900'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Payment Method */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-100">Payment Method</h2>
            <p className="text-sm text-zinc-400 mt-1">Manage how you pay for your subscription.</p>
          </div>
          
          <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/60 shadow-sm">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 mb-4">
              <div className="w-12 h-8 bg-zinc-800 rounded flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-200">Visa ending in 4242</p>
                <p className="text-xs text-zinc-500">Expires 12/2028</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                Default
              </span>
            </div>
            
            <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              + Add new payment method
            </button>
          </div>
        </section>

        {/* Invoice History */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-100">Billing History</h2>
            <p className="text-sm text-zinc-400 mt-1">Download past invoices and receipts.</p>
          </div>

          <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/60 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-950/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-800/60">
                <tr>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {mockInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-100">{invoice.id}</td>
                    <td className="px-6 py-4 text-zinc-400">{invoice.date}</td>
                    <td className="px-6 py-4">{invoice.amount}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-1 text-zinc-400 hover:text-indigo-400 transition-colors">
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
