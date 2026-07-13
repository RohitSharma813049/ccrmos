"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function SubscriptionAlert({ status }: { status: string }) {
  const pathname = usePathname();

  if (status !== "past_due" && status !== "canceled") {
    return null;
  }

  // Allow them to access the billing page to renew
  if (pathname === "/dashboard/settings/billing") {
    return (
      <div className="bg-red-500 text-white p-3 text-center text-sm font-semibold shadow-md z-[60] relative">
        Your subscription has expired. Please renew your plan below to continue using CRM OS.
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Expired</h2>
        <p className="text-gray-600 mb-8">
          Your CRM OS subscription has expired or is past due. To restore access to your workspace and tools, please update your billing details or renew your plan.
        </p>
        <Link 
          href="/dashboard/settings/billing" 
          className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
        >
          Manage Billing & Renew
        </Link>
      </div>
    </div>
  );
}
