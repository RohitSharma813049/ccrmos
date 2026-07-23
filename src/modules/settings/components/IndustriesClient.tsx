"use client";

import { useState, useEffect } from "react";

interface Industry {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export default function IndustriesClient() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

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
    fetchIndustries();
  }, []);

  async function fetchIndustries() {
    setLoading(true);
    try {
      const res = await fetch("/api/industries");
      if (res.ok) {
        const data = await res.json();
        setIndustries(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch industries", error);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/industries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchIndustries();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to add industry");
      }
    } catch (error) {
      console.error("Save error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Industries</h1>
          <p className="text-muted-foreground mt-1">Manage global industry types for the CRM.</p>
        </div>
        <button 
          onClick={openCreateModal} 
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Industry
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-card/50">
          <p className="text-muted-foreground font-medium animate-pulse">Loading industries...</p>
        </div>
      ) : industries.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-card/50">
          <p className="text-muted-foreground font-medium">No industries found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {industries.map(industry => (
            <div key={industry._id} className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-foreground mb-2">{industry.name}</h3>
              {industry.description && (
                <p className="text-sm text-muted-foreground">{industry.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="slide-over-title">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-border">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
              <div>
                <h2 id="slide-over-title" className="text-xl font-bold text-foreground">Add Industry</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Create a new global industry.</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <form id="industry-form" onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Industry Name <span className="text-destructive">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                    placeholder="e.g. Logistics" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Description <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                    rows={3}
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted bg-background border border-border rounded-xl transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                Cancel
              </button>
              <button 
                form="industry-form" 
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
                Add Industry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
