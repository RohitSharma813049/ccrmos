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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Industries and Modules for target
  const [industries, setIndustries] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);

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
    fetchModules();
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

  async function fetchModules() {
    try {
      const res = await fetch("/api/settings/modules?limit=1000");
      if (res.ok) {
        const data = await res.json();
        setModules(data.modules || []);
      }
    } catch (error) {
      console.error("Failed to fetch modules", error);
    }
  }

  const baseTabs = [
    { id: "lead", label: "Lead Fields" },
    { id: "customer", label: "Customer Fields" },
    { id: "project", label: "Project Fields" },
    { id: "invoice", label: "Invoice Fields" },
    { id: "task", label: "Task Fields" },
    { id: "order", label: "Order Fields" }
  ];

  const customTabs = modules.map(m => ({
    id: m.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
    label: `${m.name} Fields`
  }));

  const tabs = [...baseTabs, ...customTabs, { id: "all", label: "All Entities" }];

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
    setIsSubmitting(true);
    
    const submitData = { ...formData };

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
    } finally {
      setIsSubmitting(false);
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
          <Link href="/owner" className="inline-flex items-center text-sm text-primary/80 hover:text-primary transition-colors mb-2 focus-visible:outline-none focus-visible:underline">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Overview
          </Link>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dynamic Engine: Fields</h1>
          <p className="text-muted-foreground mt-1">Configure global custom fields pushed to all tenant databases.</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all border border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Deploy Global Field
        </button>
      </div>

      {/* Toolbar: Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full md:w-96">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-foreground shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-sm font-medium text-muted-foreground">Scope:</label>
          <select 
            value={scopeFilter}
            onChange={(e) => {
              setScopeFilter(e.target.value);
              setCurrentPage(1); // Reset to page 1 on filter
            }}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none shadow-sm"
          >
            <option value="All">All Scopes</option>
            <option value="Global">Global</option>
            <option value="Industry">Industry</option>
          </select>
        </div>

        {scopeFilter === "Industry" && (
          <div className="flex items-center gap-2 w-full md:w-auto ml-0 md:ml-2">
            <label className="text-sm font-medium text-muted-foreground">Filter Industry:</label>
            <select 
               value={industryFilter}
               onChange={(e) => {
                 setIndustryFilter(e.target.value);
                 setCurrentPage(1); // Reset to page 1 on filter
               }}
               className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none shadow-sm"
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
      <div className="flex border-b border-border overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setCurrentPage(1);
            }}
            className={`whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors relative focus-visible:outline-none focus-visible:bg-muted ${
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-sm" />
            )}
          </button>
        ))}
      </div>

      {/* Field List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground animate-pulse">Loading fields...</p>
          </div>
        ) : fields.length > 0 ? (
          fields.map(field => (
            <div key={field._id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-primary/50 hover:shadow-md transition-all">
              <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto min-w-0">
                <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border flex shrink-0 items-center justify-center text-muted-foreground shadow-inner">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground font-bold text-lg flex flex-wrap items-center gap-2">
                    {field.name}
                    {field.tenantScope === "Industry" && field.industryId && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        {field.industryId.name}
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 block shadow-sm shadow-blue-500/50 shrink-0"></span> Type: {field.type}</span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 block shadow-sm shadow-purple-500/50 shrink-0"></span> Required: {field.required ? "Yes" : "No"}</span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shadow-sm shadow-emerald-500/50 shrink-0"></span> Scope: {field.tenantScope}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => openEditModal(field)} className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-foreground hover:text-primary bg-background hover:bg-primary/10 rounded-lg transition-colors border border-border hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Edit</button>
                <button onClick={() => handleDelete(field._id, field.name)} className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-destructive hover:text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors border border-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive">Remove</button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-card/50">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground">No fields found</h3>
            <p className="text-muted-foreground font-medium mt-1">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Showing page <span className="font-semibold text-foreground">{currentPage}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Deploy Field Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">{isEditMode ? "Edit Global Field" : "Deploy Global Dynamic Field"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{isEditMode ? "Modify the configuration of this field." : "This field will instantly appear in all tenant databases."}</p>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={handleFormSubmit}>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Field Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                  placeholder="e.g. VAT Number" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Target Entity</label>
                  <select 
                    value={formData.target}
                    onChange={(e) => setFormData({...formData, target: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all capitalize shadow-sm"
                  >
                    {tabs.filter(t => t.id !== "all").map(t => <option key={t.id} value={t.id}>{t.label.replace(" Fields", "")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Data Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
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
                <label className="block text-sm font-medium text-foreground mb-1.5">Target Scope</label>
                <select 
                  value={formData.tenantScope}
                  onChange={(e) => setFormData({...formData, tenantScope: e.target.value, industryId: ''})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm appearance-none"
                >
                  <option value="Global">Global Scope</option>
                  <option value="Industry">Industry Scope</option>
                  <option value="Company">Company Scope</option>
                </select>
              </div>

              {formData.tenantScope === "Industry" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Target Industry</label>
                  <select 
                    value={formData.industryId}
                    onChange={(e) => setFormData({...formData, industryId: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                  >
                    <option value="">Select an Industry</option>
                    {industries.map(i => (
                      <option key={i._id} value={i._id}>{i.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1.5">This field will only be deployed to companies in this industry.</p>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-muted/50 border border-border rounded-xl">
                <input 
                  type="checkbox" 
                  id="req" 
                  checked={formData.required}
                  onChange={(e) => setFormData({...formData, required: e.target.checked})}
                  className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background" 
                />
                <label htmlFor="req" className="text-sm text-foreground font-medium cursor-pointer">Make this field mandatory across all tenants</label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isEditMode ? (isSubmitting ? "Saving..." : "Save Changes") : (isSubmitting ? "Deploying..." : "Deploy to Database")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
