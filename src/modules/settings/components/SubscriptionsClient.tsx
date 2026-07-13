"use client";

import { useState, useEffect } from "react";

interface SubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  billing: "Monthly" | "Yearly";
  users: string;
  features: string[];
  isActive?: boolean;
}

export default function SubscriptionsClient() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    billing: "Monthly" as "Monthly" | "Yearly",
    users: "Up to 5",
    features: [""] // Start with one empty feature input
  });

  useEffect(() => {
    fetchPlans();
  }, [showInactive]);

  async function fetchPlans() {
    setLoading(true);
    try {
      const res = await fetch(`/api/subscriptions${showInactive ? "?showAll=true" : ""}`);
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error("Failed to fetch subscription plans", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentPlanId(null);
    setFormData({
      name: "",
      price: 0,
      billing: "Monthly",
      users: "Up to 5",
      features: [""]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setIsEditMode(true);
    setCurrentPlanId(plan._id);
    setFormData({
      name: plan.name,
      price: plan.price,
      billing: plan.billing,
      users: plan.users,
      features: plan.features.length > 0 ? plan.features : [""]
    });
    setIsModalOpen(true);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeatureField = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeatureField = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures.length ? newFeatures : [""] });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up empty features before sending
    const cleanedFeatures = formData.features.filter(f => f.trim() !== "");
    const payload = { ...formData, features: cleanedFeatures };
    
    try {
      const url = isEditMode && currentPlanId ? `/api/subscriptions/${currentPlanId}` : "/api/subscriptions";
      const method = isEditMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchPlans();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save plan");
      }
    } catch (error) {
      console.error("Save error", error);
    }
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    const action = plan.isActive === false ? "activate" : "deactivate";
    if (confirm(`Are you sure you want to ${action} the "${plan.name}" tier?`)) {
      try {
        const res = await fetch(`/api/subscriptions/${plan._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: plan.isActive === false ? true : false })
        });
        if (res.ok) {
          fetchPlans();
        } else {
          const errorData = await res.json();
          alert(errorData.error || `Failed to ${action} plan`);
        }
      } catch (error) {
        console.error("Toggle error", error);
      }
    }
  };

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Subscription Management</h1>
          <p className="text-gray-600 mt-1">Manage global SaaS pricing tiers and billing cycles.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer bg-white/50 px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
              <div className={`block w-10 h-6 rounded-full transition-colors ${showInactive ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showInactive ? 'translate-x-4' : ''}`}></div>
            </div>
            <span className="text-sm font-medium text-gray-700">Show Inactive</span>
          </label>
          <button 
            onClick={openCreateModal} 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Tier
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
          <p className="text-gray-500 font-medium animate-pulse">Loading pricing tiers...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
          <p className="text-gray-500 font-medium">No active subscription plans found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan._id} className={`bg-white/60 backdrop-blur-md border border-gray-200 rounded-3xl p-8 shadow-xl flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden ${plan.isActive === false ? 'opacity-70 grayscale-[0.5]' : ''}`}>
              {plan.isActive === false && (
                <div className="absolute top-4 left-4 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">INACTIVE</div>
              )}
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                <button onClick={() => openEditModal(plan)} className="p-2 bg-gray-100 hover:bg-white text-gray-600 hover:text-blue-600 rounded-lg shadow-sm transition-all border border-gray-200" title="Edit">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button onClick={() => handleToggleActive(plan)} className={`p-2 rounded-lg shadow-sm transition-all border ${plan.isActive === false ? 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200' : 'bg-red-50 hover:bg-red-100 text-red-500 border-red-100'}`} title={plan.isActive === false ? "Activate" : "Deactivate"}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {plan.isActive === false ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    )}
                  </svg>
                </button>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-2">{plan.name}</h3>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-gray-900">
                ${plan.price}
                <span className="ml-1 text-xl font-medium text-gray-500">/{plan.billing === "Monthly" ? "mo" : "yr"}</span>
              </div>
              <p className="mt-4 text-sm text-blue-600 font-bold bg-blue-50 inline-block px-3 py-1 rounded-full">{plan.users} Users</p>
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Included Features</p>
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700 font-medium">
                      <svg className="h-5 w-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "Edit Subscription Tier" : "Create Subscription Tier"}</h2>
                <p className="text-sm text-gray-500 mt-0.5">Configure pricing and features.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <form id="plan-form" onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Plan Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" 
                    placeholder="e.g. Professional" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Price ($)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" 
                      placeholder="0.00" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Billing Cycle</label>
                    <select 
                      value={formData.billing}
                      onChange={(e) => setFormData({...formData, billing: e.target.value as "Monthly" | "Yearly"})}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">User Quota</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.users}
                    onChange={(e) => setFormData({...formData, users: e.target.value})}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" 
                    placeholder="e.g. Up to 20, Unlimited" 
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-gray-900">Included Features</label>
                    <button type="button" onClick={addFeatureField} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                      + Add Feature
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={feature}
                          onChange={(e) => handleFeatureChange(idx, e.target.value)}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                          placeholder="e.g. Custom Workflows" 
                        />
                        <button type="button" onClick={() => removeFeatureField(idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">
                Cancel
              </button>
              <button form="plan-form" type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all">
                {isEditMode ? "Save Changes" : "Create Tier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
