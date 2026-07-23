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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

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
    setIsSubmitting(true);
    
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
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground mt-1">Manage global SaaS pricing tiers and billing cycles.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer bg-card/50 px-4 py-2 rounded-xl border border-border shadow-sm">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
              <div className={`block w-10 h-6 rounded-full transition-colors ${showInactive ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showInactive ? 'translate-x-4' : ''}`}></div>
            </div>
            <span className="text-sm font-medium text-foreground">Show Inactive</span>
          </label>
          <button 
            onClick={openCreateModal} 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Tier
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-card/50">
          <p className="text-muted-foreground font-medium animate-pulse">Loading pricing tiers...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-card/50">
          <p className="text-muted-foreground font-medium">No active subscription plans found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan._id} className={`bg-card/60 backdrop-blur-md border border-border rounded-3xl p-8 shadow-xl flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden ${plan.isActive === false ? 'opacity-70 grayscale-[0.5]' : ''}`}>
              {plan.isActive === false && (
                <div className="absolute top-4 left-4 bg-destructive/10 text-destructive text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">INACTIVE</div>
              )}
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                <button onClick={() => openEditModal(plan)} className="p-2 bg-background hover:bg-muted text-muted-foreground hover:text-primary rounded-lg shadow-sm transition-all border border-border" title="Edit">
                  <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button onClick={() => handleToggleActive(plan)} className={`p-2 rounded-lg shadow-sm transition-all border ${plan.isActive === false ? 'bg-success/10 hover:bg-success/20 text-success border-success/20' : 'bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20'}`} title={plan.isActive === false ? "Activate" : "Deactivate"}>
                  <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {plan.isActive === false ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    )}
                  </svg>
                </button>
              </div>

              <h3 className="text-xl font-bold text-foreground mt-2">{plan.name}</h3>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-foreground">
                ${plan.price}
                <span className="ml-1 text-xl font-medium text-muted-foreground">/{plan.billing === "Monthly" ? "mo" : "yr"}</span>
              </div>
              <p className="mt-4 text-sm text-primary font-bold bg-primary/10 inline-block px-3 py-1 rounded-full">{plan.users} Users</p>
              
              <div className="mt-8 pt-6 border-t border-border flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Included Features</p>
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-foreground font-medium">
                      <svg className="h-5 w-5 text-primary shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="slide-over-title">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-border">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
              <div>
                <h2 id="slide-over-title" className="text-xl font-bold text-foreground">{isEditMode ? "Edit Subscription Tier" : "Create Subscription Tier"}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Configure pricing and features.</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <form id="plan-form" onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Plan Name <span className="text-destructive">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                    placeholder="e.g. Professional" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Price ($) <span className="text-destructive">*</span>
                    </label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                      placeholder="0.00" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Billing Cycle</label>
                    <select 
                      value={formData.billing}
                      onChange={(e) => setFormData({...formData, billing: e.target.value as "Monthly" | "Yearly"})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    User Quota <span className="text-destructive">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={formData.users}
                    onChange={(e) => setFormData({...formData, users: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                    placeholder="e.g. Up to 20, Unlimited" 
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-foreground">Included Features</label>
                    <button type="button" onClick={addFeatureField} className="text-xs font-bold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
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
                          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" 
                          placeholder="e.g. Custom Workflows" 
                        />
                        <button type="button" onClick={() => removeFeatureField(idx)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive">
                          <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted bg-background border border-border rounded-xl transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                Cancel
              </button>
              <button 
                form="plan-form" 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-semibold rounded-xl shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center gap-2"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isEditMode ? "Save Changes" : "Create Tier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
