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
  industryId?: { _id: string; name: string };
  options?: string[];
  optionColors?: Record<string, string>;
}

export default function TenantDynamicFieldsPage() {
  const [activeTab, setActiveTab] = useState<"lead" | "customer" | "project" | "invoice" | "task" | "order" | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50;
  
  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentFieldId, setCurrentFieldId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    target: string;
    type: string;
    required: boolean;
    section: string;
    order: number;
    options: string[];
    optionColors: Record<string, string>;
  }>({
    name: "",
    target: "lead",
    type: "Text String",
    required: false,
    section: "General",
    order: 0,
    options: [],
    optionColors: {}
  });

  const [newOption, setNewOption] = useState("");
  const [newOptionColor, setNewOptionColor] = useState("bg-blue-500");
  
  const colors = [
    { label: 'Blue', value: 'bg-blue-500' },
    { label: 'Green', value: 'bg-green-500' },
    { label: 'Red', value: 'bg-red-500' },
    { label: 'Purple', value: 'bg-purple-500' },
    { label: 'Pink', value: 'bg-pink-500' },
    { label: 'Teal', value: 'bg-teal-600' },
    { label: 'Orange', value: 'bg-orange-500' },
    { label: 'Slate', value: 'bg-slate-500' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFields();
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, currentPage, searchTerm]);

  async function fetchFields() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("target", activeTab);
      params.append("page", currentPage.toString());
      params.append("limit", limit.toString());
      if (searchTerm) params.append("search", searchTerm);

      const res = await fetch(`/api/dynamic-fields?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFields(data.fields || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || 1);
      }
    } catch (error) {
      console.error("Failed to fetch dynamic fields", error);
    } finally {
      setLoading(false);
    }
  };

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
    setFormData({ name: "", target: activeTab === "all" ? "lead" : activeTab, type: "Text String", required: false, section: "General", order: 0, options: [], optionColors: {} });
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
      section: (field as any).section || "General",
      order: (field as any).order || 0,
      options: field.options || [],
      optionColors: field.optionColors || {}
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Always force company scope for tenant fields
    const submitData = { ...formData, tenantScope: "Company" };

    try {
      const url = isEditMode && currentFieldId ? `/api/dynamic-fields/${currentFieldId}` : "/api/dynamic-fields";
      const method = isEditMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData)
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
    if (confirm(`Are you sure you want to permanently delete the custom field "${name}"?`)) {
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
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Custom Fields</h1>
          <p className="text-zinc-400 mt-1">Configure custom fields specific to your company.</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all border border-indigo-500/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Custom Field
        </button>
      </div>

      {/* Toolbar: Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-zinc-900/40 backdrop-blur-xl p-4 rounded-xl border border-zinc-700/50 shadow-sm">
        <div className="relative w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search fields by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
            className="w-full pl-10 pr-4 py-2 bg-zinc-950/50 border border-zinc-700/50 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-zinc-100"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-700/50 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setCurrentPage(1);
            }}
            className={`whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors relative ${
              activeTab === tab.id ? "text-indigo-600" : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_-2px_10px_rgba(99,102,241,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* Field List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-700/50 rounded-2xl">
            <p className="text-zinc-400 animate-pulse">Loading fields...</p>
          </div>
        ) : fields.length > 0 ? (
          fields.map(field => {
            const isCompanyField = field.tenantScope === "Company";
            
            return (
              <div key={field._id} className={`bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-all ${isCompanyField ? 'hover:border-zinc-700/50 hover:shadow-md' : 'opacity-80'}`}>
                <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto min-w-0">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-inner ${isCompanyField ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100 text-indigo-500' : 'bg-zinc-950/50 border-zinc-700/50 text-zinc-400'}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-zinc-100 font-bold text-lg flex flex-wrap items-center gap-2">
                      {field.name}
                      {!isCompanyField && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                          {field.tenantScope} {field.tenantScope === "Industry" && field.industryId ? `(${field.industryId.name})` : ''}
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400 font-medium">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 block shadow-sm shadow-blue-500/50"></span> Type: {field.type}</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 block shadow-sm shadow-purple-500/50"></span> Required: {field.required ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isCompanyField ? (
                    <>
                      <button onClick={() => openEditModal(field)} className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-indigo-600 bg-zinc-950/50 hover:bg-indigo-50 rounded-lg transition-colors border border-zinc-700/50 hover:border-indigo-200">Edit</button>
                      <button onClick={() => handleDelete(field._id, field.name)} className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">Remove</button>
                    </>
                  ) : (
                    <span className="px-3 py-1.5 text-xs font-semibold text-zinc-400 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Read Only
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-zinc-700/50 rounded-2xl bg-zinc-900/40 backdrop-blur-xl/50">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-100">No fields found</h3>
            <p className="text-zinc-400 font-medium mt-1">Try adjusting your search term or add a new field.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-700/50 pt-6">
          <p className="text-sm text-zinc-400">
            Showing page <span className="font-semibold text-zinc-100">{currentPage}</span> of <span className="font-semibold text-zinc-100">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-zinc-700/50 rounded-lg text-sm font-medium text-zinc-300 bg-zinc-900/40 backdrop-blur-xl hover:bg-zinc-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-zinc-700/50 rounded-lg text-sm font-medium text-zinc-300 bg-zinc-900/40 backdrop-blur-xl hover:bg-zinc-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Field Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800/60">
              <h2 className="text-xl font-bold text-zinc-100">{isEditMode ? "Edit Custom Field" : "Create Custom Field"}</h2>
              <p className="text-sm text-zinc-400 mt-1">{isEditMode ? "Modify this field configuration." : "This field will be available specifically for your company."}</p>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={handleFormSubmit}>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Field Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                  placeholder="e.g. Internal Project ID" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Section Name</label>
                  <input 
                    type="text" 
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    placeholder="e.g. Financials, General"
                    className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Order/Sequence</label>
                  <input 
                    type="number" 
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                    className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Target Entity</label>
                  <select 
                    value={formData.target}
                    onChange={(e) => setFormData({...formData, target: e.target.value})}
                    className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all capitalize"
                  >
                    {tabs.filter(t => t.id !== "all").map(t => <option key={t.id} value={t.id}>{t.label.replace(" Fields", "")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Data Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="Text String">Text String</option>
                    <option value="Number">Number</option>
                    <option value="Dropdown (Select)">Dropdown (Select)</option>
                    <option value="Date">Date</option>
                    <option value="Currency">Currency</option>
                    <option value="File Upload">File Upload</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-zinc-950/50 border border-zinc-700/50 rounded-xl">
                <input 
                  type="checkbox" 
                  id="req" 
                  checked={formData.required}
                  onChange={(e) => setFormData({...formData, required: e.target.checked})}
                  className="w-4 h-4 rounded border-zinc-700/50 bg-zinc-900/40 backdrop-blur-xl text-indigo-600 focus:ring-indigo-500" 
                />
                <label htmlFor="req" className="text-sm text-zinc-300 font-medium cursor-pointer">Make this field mandatory</label>
              </div>

              {formData.type === "Dropdown (Select)" && (
                <div className="border border-zinc-700/50 rounded-xl p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-100">Dropdown Options</h3>
                  
                  {/* List existing options */}
                  {formData.options.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {formData.options.map(opt => (
                        <div key={opt} className="flex items-center justify-between bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/60">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${formData.optionColors[opt] || 'bg-gray-400'}`}></div>
                            <span className="text-sm font-medium text-zinc-300">{opt}</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              const newOptions = formData.options.filter(o => o !== opt);
                              const newColors = { ...formData.optionColors };
                              delete newColors[opt];
                              setFormData({ ...formData, options: newOptions, optionColors: newColors });
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new option */}
                  <div className="flex flex-col gap-3 pt-2 border-t border-zinc-800/60">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newOption}
                        onChange={e => setNewOption(e.target.value)}
                        placeholder="Option label (e.g. In Progress)"
                        className="flex-1 bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (newOption.trim() && !formData.options.includes(newOption.trim())) {
                            setFormData({
                              ...formData,
                              options: [...formData.options, newOption.trim()],
                              optionColors: { ...formData.optionColors, [newOption.trim()]: newOptionColor }
                            });
                            setNewOption("");
                          }
                        }}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-zinc-400 font-medium mr-2">Color:</span>
                      {colors.map(c => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setNewOptionColor(c.value)}
                          className={`w-6 h-6 rounded-full ${c.value} transition-all ${newOptionColor === c.value ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
                  {isEditMode ? "Save Changes" : "Create Field"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
