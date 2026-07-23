"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SettingsClient() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [globalCurrency, setGlobalCurrency] = useState("USD ($)");
  const [loading, setLoading] = useState(true);

  const [templates, setTemplates] = useState<any[]>([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">("create");
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings/global");
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          if (data.value.maintenanceMode !== undefined) setMaintenanceMode(data.value.maintenanceMode);
          if (data.value.globalCurrency) setGlobalCurrency(data.value.globalCurrency);
        }
      }
      const tRes = await fetch("/api/settings/templates");
      if (tRes.ok) {
        const tData = await tRes.json();
        setTemplates(tData.templates || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  async function saveSettings(updates: any) {
    try {
      await fetch("/api/settings/global", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global: true,
          value: { maintenanceMode, globalCurrency, ...updates }
        })
      });
    } catch (e) {
      console.error(e);
    }
  }

  const toggleMaintenance = () => {
    const val = !maintenanceMode;
    setMaintenanceMode(val);
    saveSettings({ maintenanceMode: val });
  };

  const handleCurrencyChange = (e: any) => {
    const val = e.target.value;
    setGlobalCurrency(val);
    saveSettings({ globalCurrency: val });
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({ name: "", description: "" });
    setModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setModalMode("edit");
    setActiveTemplate(t);
    setFormData({ name: t.name, description: t.description || "" });
    setModalOpen(true);
  };

  const openDeleteModal = (t: any) => {
    setModalMode("delete");
    setActiveTemplate(t);
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (modalMode === "create") {
        const res = await fetch("/api/settings/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const newT = await res.json();
          setTemplates([newT.template, ...templates]);
          setModalOpen(false);
        } else {
          alert("Failed to create template");
        }
      } else if (modalMode === "edit") {
        const res = await fetch(`/api/settings/templates/${activeTemplate._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const updatedT = await res.json();
          setTemplates(templates.map(t => t._id === activeTemplate._id ? updatedT.template : t));
          setModalOpen(false);
        } else {
          alert("Failed to update template");
        }
      } else if (modalMode === "delete") {
        const res = await fetch(`/api/settings/templates/${activeTemplate._id}`, { method: "DELETE" });
        if (res.ok) {
          setTemplates(templates.filter(t => t._id !== activeTemplate._id));
          setModalOpen(false);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <div className="space-y-8 fade-in pb-12 relative">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Global Settings & Templates</h1>
        <p className="text-muted-foreground mt-1">Configure systemic variables, maintenance modes, and industry templates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-foreground mb-6">System Configuration</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div>
                <p className="font-semibold text-amber-500">Maintenance Mode</p>
                <p className="text-xs text-amber-400/80 mt-1">Locks all non-owners out of the CRM.</p>
              </div>
              <button onClick={toggleMaintenance} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${maintenanceMode ? 'bg-amber-500' : 'bg-muted'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Default Global Currency</label>
              <select 
                value={globalCurrency}
                onChange={handleCurrencyChange}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm transition-colors"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="INR (₹)">INR (₹)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-foreground mb-6">Industry Templates</h2>
          <p className="text-sm text-muted-foreground mb-6">Pre-packaged modules and dynamic fields designed for specific verticals.</p>
          
          <div className="space-y-4">
            {templates.map((t: any) => (
              <div key={t._id} className="p-4 border border-primary/20 bg-primary/5 rounded-xl flex flex-col">
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.description || "No description provided"}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center mt-4 pt-4 border-t border-primary/10">
                  <span className="text-xs text-primary font-medium bg-primary/10 px-3 py-1 rounded-full w-fit">{t.modules?.length || 0} Modules</span>
                  <div className="sm:ml-auto flex flex-wrap gap-4 items-center">
                    <Link href={`/owner/settings/templates/${t._id}`} className="text-sm text-primary hover:text-primary/80 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Configure Bundle</Link>
                    <button onClick={() => openEditModal(t)} className="text-sm text-muted-foreground hover:text-foreground font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Edit Config</button>
                    <button onClick={() => openDeleteModal(t)} className="text-sm text-destructive/70 hover:text-destructive font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive rounded">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            
            {templates.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground bg-muted/50 rounded-xl border border-dashed border-border">
                No custom templates exist yet.
              </div>
            )}
            
            <button onClick={openCreateModal} className="w-full py-3 border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 font-medium rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              + Scaffold New Template
            </button>
          </div>
        </div>
      </div>

      {/* Modern Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm fade-in" role="dialog" aria-modal="true">
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md overflow-hidden flex flex-col slide-up">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="text-lg font-bold text-foreground">
                {modalMode === "create" && "Create New Template"}
                {modalMode === "edit" && "Edit Template Configuration"}
                {modalMode === "delete" && "Confirm Deletion"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
              {modalMode === "delete" ? (
                <div>
                  <p className="text-muted-foreground mb-6">Are you sure you want to permanently delete the template <strong className="text-foreground">{activeTemplate?.name}</strong>? This action cannot be undone.</p>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Cancel</button>
                    <button type="button" onClick={handleModalSubmit} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-lg transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive">
                      {isSubmitting ? "Deleting..." : "Delete Template"}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleModalSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Template Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none shadow-sm transition-colors"
                      placeholder="e.g. Real Estate CRM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none h-24 resize-none shadow-sm transition-colors"
                      placeholder="Briefly describe what this template is for..."
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-3">
                    <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center gap-2">
                      {isSubmitting && (
                        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isSubmitting ? "Saving..." : "Save Template"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
