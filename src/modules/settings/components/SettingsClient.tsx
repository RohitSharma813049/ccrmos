"use client";

import { useState, useEffect } from "react";

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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-8 fade-in pb-12 relative">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Global Settings & Templates</h1>
        <p className="text-gray-600 mt-1">Configure systemic variables, maintenance modes, and industry templates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Configuration</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div>
                <p className="font-semibold text-amber-500">Maintenance Mode</p>
                <p className="text-xs text-amber-400/80 mt-1">Locks all non-owners out of the CRM.</p>
              </div>
              <button onClick={toggleMaintenance} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${maintenanceMode ? 'bg-amber-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Global Currency</label>
              <select 
                value={globalCurrency}
                onChange={handleCurrencyChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="INR (₹)">INR (₹)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Industry Templates</h2>
          <p className="text-sm text-gray-600 mb-6">Pre-packaged modules and dynamic fields designed for specific verticals.</p>
          
          <div className="space-y-4">
            {templates.map((t: any) => (
              <div key={t._id} className="p-4 border border-blue-500/30 bg-blue-500/5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{t.description || "No description provided"}</p>
                </div>
                <div className="flex gap-3 items-center">
                  <button onClick={() => openEditModal(t)} className="text-sm text-blue-400 hover:text-blue-300 font-medium">Edit Config</button>
                  <button onClick={() => openDeleteModal(t)} className="text-sm text-red-400 hover:text-red-300 font-medium">Delete</button>
                </div>
              </div>
            ))}
            
            {templates.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No custom templates exist yet.
              </div>
            )}
            
            <button onClick={openCreateModal} className="w-full py-3 border border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-500 font-medium rounded-xl transition-all">
              + Scaffold New Template
            </button>
          </div>
        </div>
      </div>

      {/* Modern Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col slide-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === "create" && "Create New Template"}
                {modalMode === "edit" && "Edit Template Configuration"}
                {modalMode === "delete" && "Confirm Deletion"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
              {modalMode === "delete" ? (
                <div>
                  <p className="text-gray-600 mb-6">Are you sure you want to permanently delete the template <strong className="text-gray-900">{activeTemplate?.name}</strong>? This action cannot be undone.</p>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                    <button type="button" onClick={handleModalSubmit} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
                      {isSubmitting ? "Deleting..." : "Delete Template"}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleModalSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Real Estate CRM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                      placeholder="Briefly describe what this template is for..."
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-3">
                    <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
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
