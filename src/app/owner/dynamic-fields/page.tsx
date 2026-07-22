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
}

export default function DynamicFieldsPage() {
  const [activeTab, setActiveTab] = useState<"lead" | "customer" | "project" | "invoice" | "task" | "order" | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search, Filter, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [scopeFilter, setScopeFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50;
  
  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentFieldId, setCurrentFieldId] = useState<string | null>(null);
  
  // Industries for target
  const [industries, setIndustries] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    target: "lead",
    type: "Text String",
    required: false,
    tenantScope: "Global",
    industryId: ""
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFields();
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, currentPage, scopeFilter, industryFilter, searchTerm]);

  useEffect(() => {
    fetchIndustries();
  }, []);

  async function fetchFields() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("target", activeTab);
      params.append("page", currentPage.toString());
      params.append("limit", limit.toString());
      if (searchTerm) params.append("search", searchTerm);
      if (scopeFilter !== "All") params.append("scope", scopeFilter);
      if (industryFilter !== "All") params.append("industry", industryFilter);

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

  async function fetchIndustries() {
    try {
      const res = await fetch("/api/industries");
      if (res.ok) {
        const data = await res.json();
        setIndustries(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch industries", error);
    }
  }

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
    setFormData({ 
      name: "", 
      target: activeTab === "all" ? "lead" : activeTab, 
      type: "Text String", 
      required: false, 
      tenantScope: scopeFilter !== "All" ? scopeFilter : "Global", 
      industryId: scopeFilter === "Industry" && industryFilter !== "All" ? industryFilter : "" 
    });
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
      tenantScope: field.tenantScope || "Global",
      industryId: field.industryId?._id || ""
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure tenantScope is Industry if an industryId is selected (for convenience)
    const submitData = { ...formData };
    if (submitData.industryId) {
      submitData.tenantScope = "Industry";
    }

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

      {/* Toolbar: Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-800"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-sm font-medium text-gray-600">Scope:</label>
          <select 
            value={scopeFilter}
            onChange={(e) => {
              setScopeFilter(e.target.value);
              setCurrentPage(1); // Reset to page 1 on filter
            }}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="All">All Scopes</option>
            <option value="Global">Global</option>
            <option value="Industry">Industry</option>
          </select>
        </div>

        {scopeFilter === "Industry" && (
          <div className="flex items-center gap-2 w-full md:w-auto ml-0 md:ml-2">
            <label className="text-sm font-medium text-gray-600">Filter Industry:</label>
            <select 
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setCurrentPage(1); // Reset to page 1 on filter
              }}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="All">All Industries</option>
              {industries.map(i => (
                <option key={i._id} value={i._id}>{i.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setCurrentPage(1);
            }}
            className={`whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors relative ${
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
            <p className="text-gray-500 animate-pulse">Loading fields...</p>
          </div>
        ) : fields.length > 0 ? (
          fields.map(field => (
            <div key={field._id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between shadow-sm hover:border-gray-300 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 shadow-inner">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold text-lg flex items-center gap-2">
                    {field.name}
                    {field.tenantScope === "Industry" && field.industryId && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {field.industryId.name}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 block shadow-sm shadow-blue-500/50"></span> Type: {field.type}</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 block shadow-sm shadow-purple-500/50"></span> Required: {field.required ? "Yes" : "No"}</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shadow-sm shadow-emerald-500/50"></span> Scope: {field.tenantScope}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(field)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-200">Edit</button>
                <button onClick={() => handleDelete(field._id, field.name)} className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">Remove</button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">No fields found</h3>
            <p className="text-gray-500 font-medium mt-1">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600">
            Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

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
                    {tabs.filter(t => t.id !== "all").map(t => <option key={t.id} value={t.id}>{t.label.replace(" Fields", "")}</option>)}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Industry <span className="text-gray-400 font-normal">(Optional)</span></label>
                <select 
                  value={formData.industryId}
                  onChange={(e) => setFormData({...formData, industryId: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                >
                  <option value="">All Industries</option>
                  {industries.map(i => (
                    <option key={i._id} value={i._id}>{i.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1.5">If selected, this field will only be deployed to companies in this industry.</p>
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
