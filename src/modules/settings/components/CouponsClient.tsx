"use client";

import { useState, useEffect } from "react";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
  validUntil: string | null;
}

export default function CouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
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

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    maxUses: "",
    validUntil: ""
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error("Failed to fetch coupons", error);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentId(null);
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: 0,
      maxUses: "",
      validUntil: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setIsEditMode(true);
    setCurrentId(coupon._id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses ? coupon.maxUses.toString() : "",
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : ""
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null
    };
    
    try {
      const url = isEditMode && currentId ? `/api/coupons/${currentId}` : "/api/coupons";
      const method = isEditMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save coupon");
      }
    } catch (error) {
      console.error("Save error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const action = coupon.isActive ? "deactivate" : "activate";
    if (confirm(`Are you sure you want to ${action} the "${coupon.code}" coupon?`)) {
      try {
        const res = await fetch(`/api/coupons/${coupon._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !coupon.isActive })
        });
        if (res.ok) {
          fetchCoupons();
        } else {
          const errorData = await res.json();
          alert(errorData.error || `Failed to ${action} coupon`);
        }
      } catch (error) {
        console.error("Toggle error", error);
      }
    }
  };

  const handleDelete = async (id: string, code: string) => {
    const confirmation = window.prompt(`Are you sure you want to permanently delete the "${code}" coupon? This action cannot be undone.\n\nType DELETE to confirm:`);
    if (confirmation === "DELETE") {
      try {
        const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchCoupons();
        } else {
          const errorData = await res.json();
          alert(errorData.error || "Failed to delete coupon");
        }
      } catch (error) {
        console.error("Delete error", error);
      }
    }
  };

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Offers & Coupons</h1>
          <p className="text-muted-foreground mt-1">Manage promotional discount codes and limits.</p>
        </div>
        <button 
          onClick={openCreateModal} 
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Coupon
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-card/50">
          <p className="text-muted-foreground font-medium animate-pulse">Loading coupons...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-card/50">
          <p className="text-muted-foreground font-medium">No coupons found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map(coupon => (
            <div key={coupon._id} className={`bg-card/60 backdrop-blur-md border border-border rounded-3xl p-8 shadow-xl flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden ${!coupon.isActive ? 'opacity-70 grayscale-[0.5]' : ''}`}>
              {!coupon.isActive && (
                <div className="absolute top-4 left-4 bg-destructive/10 text-destructive text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">INACTIVE</div>
              )}
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                <button onClick={() => openEditModal(coupon)} className="p-2 bg-background hover:bg-muted text-muted-foreground hover:text-primary rounded-lg shadow-sm transition-all border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" title="Edit">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button onClick={() => handleToggleActive(coupon)} className={`p-2 rounded-lg shadow-sm transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${!coupon.isActive ? 'bg-green-500/10 hover:bg-green-500/20 text-green-600 border-green-500/20' : 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 border-yellow-500/20'}`} title={!coupon.isActive ? "Activate" : "Deactivate"}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {!coupon.isActive ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </button>
                <button onClick={() => handleDelete(coupon._id, coupon.code)} className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg shadow-sm transition-all border border-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive" title="Permanently Delete">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <h3 className="text-2xl font-bold text-foreground font-mono tracking-wider">{coupon.code}</h3>
              </div>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-primary">
                {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                <span className="ml-2 text-lg font-medium text-muted-foreground uppercase tracking-wide">Off</span>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Uses</p>
                  <p className="text-sm font-medium text-foreground">
                    {coupon.currentUses} / {coupon.maxUses === null ? "Unlimited" : coupon.maxUses}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Expires</p>
                  <p className="text-sm font-medium text-foreground">
                    {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : "Never"}
                  </p>
                </div>
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
                <h2 id="slide-over-title" className="text-xl font-bold text-foreground">{isEditMode ? "Edit Coupon" : "Create Coupon"}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Configure discount details.</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <form id="coupon-form" onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Coupon Code <span className="text-destructive">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm font-mono uppercase placeholder:text-muted-foreground" 
                    placeholder="e.g. WELCOME20" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Discount Type</label>
                    <select 
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value as "percentage" | "fixed"})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Value <span className="text-destructive">*</span>
                    </label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step={formData.discountType === "percentage" ? "1" : "0.01"}
                      max={formData.discountType === "percentage" ? "100" : undefined}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                      placeholder={formData.discountType === "percentage" ? "20" : "50.00"} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Maximum Uses <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm placeholder:text-muted-foreground" 
                    placeholder="Leave empty for unlimited" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Expiration Date <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <input 
                    type="date" 
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                  />
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted bg-background border border-border rounded-xl transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                Cancel
              </button>
              <button 
                form="coupon-form" 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 text-sm font-semibold rounded-xl shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center gap-2"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isEditMode ? "Save Changes" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
