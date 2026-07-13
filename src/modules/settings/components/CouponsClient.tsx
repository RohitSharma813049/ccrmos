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
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

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
    if (confirm(`Are you sure you want to permanently delete the "${code}" coupon? This action cannot be undone.`)) {
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Offers & Coupons</h1>
          <p className="text-gray-600 mt-1">Manage promotional discount codes and limits.</p>
        </div>
        <button 
          onClick={openCreateModal} 
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Coupon
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
          <p className="text-gray-500 font-medium animate-pulse">Loading coupons...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
          <p className="text-gray-500 font-medium">No coupons found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map(coupon => (
            <div key={coupon._id} className={`bg-white/60 backdrop-blur-md border border-gray-200 rounded-3xl p-8 shadow-xl flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden ${!coupon.isActive ? 'opacity-70 grayscale-[0.5]' : ''}`}>
              {!coupon.isActive && (
                <div className="absolute top-4 left-4 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">INACTIVE</div>
              )}
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                <button onClick={() => openEditModal(coupon)} className="p-2 bg-gray-100 hover:bg-white text-gray-600 hover:text-blue-600 rounded-lg shadow-sm transition-all border border-gray-200" title="Edit">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button onClick={() => handleToggleActive(coupon)} className={`p-2 rounded-lg shadow-sm transition-all border ${!coupon.isActive ? 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200' : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600 border-yellow-200'}`} title={!coupon.isActive ? "Activate" : "Deactivate"}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {!coupon.isActive ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </button>
                <button onClick={() => handleDelete(coupon._id, coupon.code)} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg shadow-sm transition-all border border-red-100" title="Permanently Delete">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <h3 className="text-2xl font-bold text-gray-900 font-mono tracking-wider">{coupon.code}</h3>
              </div>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-blue-600">
                {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                <span className="ml-2 text-lg font-medium text-gray-500 uppercase tracking-wide">Off</span>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Uses</p>
                  <p className="text-sm font-medium text-gray-800">
                    {coupon.currentUses} / {coupon.maxUses === null ? "Unlimited" : coupon.maxUses}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Expires</p>
                  <p className="text-sm font-medium text-gray-800">
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
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "Edit Coupon" : "Create Coupon"}</h2>
                <p className="text-sm text-gray-500 mt-0.5">Configure discount details.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <form id="coupon-form" onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Coupon Code</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm font-mono uppercase placeholder-gray-400" 
                    placeholder="e.g. WELCOME20" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Discount Type</label>
                    <select 
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value as "percentage" | "fixed"})}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Value</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step={formData.discountType === "percentage" ? "1" : "0.01"}
                      max={formData.discountType === "percentage" ? "100" : undefined}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" 
                      placeholder={formData.discountType === "percentage" ? "20" : "50.00"} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Maximum Uses <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" 
                    placeholder="Leave empty for unlimited" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Expiration Date <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input 
                    type="date" 
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" 
                  />
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">
                Cancel
              </button>
              <button form="coupon-form" type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all">
                {isEditMode ? "Save Changes" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
