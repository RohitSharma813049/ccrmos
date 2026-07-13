"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DynamicField {
  _id: string;
  name: string;
  target: string;
  type: string;
  required: boolean;
  tenantScope: string;
}

export default function DynamicFieldsPage() {
  const [activeTab, setActiveTab] = useState<"lead" | "customer" | "project" | "invoice" | "task" | "order" | "all">("lead");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentFieldId, setCurrentFieldId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    target: "lead",
    type: "Text String",
    required: false,
    tenantScope: "Global"
  });

  useEffect(() => {
    fetchFields();
  }, []);

  async function fetchFields() {
    setLoading(true);
    try {
      const res = await fetch("/api/dynamic-fields");
      if (res.ok) {
        const data = await res.json();
        setFields(data.fields || []);
      }
    } catch (error) {
      console.error("Failed to fetch dynamic fields", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFields = fields.filter(f => f.target === activeTab);

  const tabs = [
    { id: "lead", label: "Lead Fields" },
    { id: "customer", label: "Customer Fields" },
    { id: "project", label: "Project Fields" },
    { id: "invoice", label: "Invoice Fields" },
    { id: "task", label: "Task Fields" },
    { id: "order", label: "Order Fields" },
    { id: "all", label: "All Entities" },
  ] as const;

  const openCreateModal = () => {
    setIsEditMode(false);
    setFormData({ name: "", target: activeTab, type: "Text String", required: false, tenantScope: "Global" });
    setIsModalOpen(true);
  };

  const openEditModal = (field: DynamicField) => {
    setIsEditMode(true);
    setCurrentFieldId(field._id);
    setFormData({
      name: field.name,
      target: field.target,
      type: field.type,
      required: field.required,
      tenantScope: field.tenantScope || "Global"
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = isEditMode && currentFieldId ? `/api/dynamic-fields/${currentFieldId}` : "/api/dynamic-fields";
      const method = isEditMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchFields();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save field");
      }
    } catch (error) {
      console.error("Save error", error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete the global field "${name}"?`)) {
      try {
        const res = await fetch(`/api/dynamic-fields/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchFields();
        } else {
          const errorData = await res.json();
          alert(errorData.error || "Failed to delete field");
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
          <Link href="/owner" className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors mb-2">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Overview
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dynamic Engine: Fields</h1>
          <p className="text-gray-600 mt-1">Configure global custom fields pushed to all tenant databases.</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all border border-purple-500/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Deploy Global Field
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-4 text-sm font-medium transition-colors relative ${
              activeTab === tab.id ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_-2px_10px_rgba(59,130,246,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* Field List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500">Loading fields...</p>
          </div>
        ) : filteredFields.length > 0 ? (
          filteredFields.map(field => (
            <div key={field._id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between shadow-sm hover:border-gray-300 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold">{field.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 block"></span> Type: {field.type}</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 block"></span> Required: {field.required ? "Yes" : "No"}</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span> Scope: {field.tenantScope}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(field)} className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200">Edit</button>
                <button onClick={() => handleDelete(field._id, field.name)} className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">Remove</button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
            <p className="text-gray-500 font-medium">No global fields defined for {activeTab}s yet.</p>
          </div>
        )}
      </div>

      {/* Deploy Field Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "Edit Global Field" : "Deploy Global Dynamic Field"}</h2>
              <p className="text-sm text-gray-600 mt-1">{isEditMode ? "Modify the configuration of this field." : "This field will instantly appear in all tenant databases."}</p>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={handleFormSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Field Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
                  placeholder="e.g. VAT Number" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Entity</label>
                  <select 
                    value={formData.target}
                    onChange={(e) => setFormData({...formData, target: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all capitalize"
                  >
                    {tabs.map(t => <option key={t.id} value={t.id}>{t.label.replace(" Fields", "")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Data Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  >
                    <option value="Text String">Text String</option>
                    <option value="Number">Number</option>
                    <option value="Dropdown (Select)">Dropdown (Select)</option>
                    <option value="Date">Date</option>
                    <option value="Currency">Currency</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <input 
                  type="checkbox" 
                  id="req" 
                  checked={formData.required}
                  onChange={(e) => setFormData({...formData, required: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 bg-white text-purple-600 focus:ring-purple-500" 
                />
                <label htmlFor="req" className="text-sm text-gray-700 font-medium cursor-pointer">Make this field mandatory across all tenants</label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all">
                  {isEditMode ? "Save Changes" : "Deploy to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
