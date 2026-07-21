import { requireAuthenticatedUser } from "@/lib/auth-utils";
import mongoose from "mongoose";
import Company from "@/modules/companies/schemas/Company";
import SubscriptionPlan from "@/modules/settings/schemas/SubscriptionPlan";
import RazorpayCheckout from "@/modules/billing/components/RazorpayCheckout";
import CancelSubscriptionButton from "@/modules/billing/components/CancelSubscriptionButton";

export default async function BillingPage() {
  const user = await requireAuthenticatedUser();
  const companyId = user.companyId || user.impersonatedFounderId;
  
  if (!mongoose.connection.readyState) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }

  let currentCompany = null;
  if (companyId) {
    currentCompany = await Company.findById(companyId).populate("subscriptionPlanId");
  }

  // Fetch active plans
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });

  return (
    <div className="space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Billing & Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your plan and payment methods.</p>
      </div>

      {currentCompany && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Current Status</h2>
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg font-bold text-sm ${currentCompany.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                Status: {currentCompany.subscriptionStatus?.toUpperCase() || "TRIALING"}
              </div>
              {currentCompany.subscriptionPlanId && (
                <div className="text-gray-700 font-medium">
                  Current Plan: <span className="font-bold text-gray-900">{(currentCompany.subscriptionPlanId as any).name}</span>
                </div>
              )}
            </div>
          </div>
          
          {currentCompany.subscriptionStatus === 'active' && (
            <div>
              <CancelSubscriptionButton />
            </div>
          )}
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-900 pt-6">Available Plans</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan._id.toString()} className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-3xl p-8 shadow-xl flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold text-gray-900">
              ₹{plan.price}
              <span className="ml-1 text-xl font-medium text-gray-500">/{plan.billing === "Monthly" ? "mo" : "yr"}</span>
            </div>
            <p className="mt-4 text-sm text-blue-600 font-bold bg-blue-50 inline-block px-3 py-1 rounded-full w-max">{plan.users} Users</p>
            
            <div className="mt-8 pt-6 border-t border-gray-100 flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Included Features</p>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-700 font-medium">
                    <svg className="h-5 w-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              {(currentCompany?.subscriptionPlanId as any)?._id?.toString() === plan._id.toString() && currentCompany?.subscriptionStatus === 'active' ? (
                <button disabled className="w-full px-6 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl border border-gray-200">
                  Current Plan
                </button>
              ) : (
                <RazorpayCheckout 
                  planId={plan._id.toString()} 
                  planName={plan.name}
                  planPrice={plan.price}
                  companyName={currentCompany?.name}
                  userEmail={user.email || ""}
                  buttonClassName="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
