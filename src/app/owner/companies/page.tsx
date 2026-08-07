"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { DataTable, ColumnDef } from "@/components/ui/DataTable";

interface Company {
  _id: string;
  name: string;
  adminEmail: string;
  plan: string;
  usersQuota: number;
  status: string;
  subscriptionStatus?: string;
  users?: number;
  industryId?: string;
  enabledModules?: string[];
  createdAt: string;
}



export default function ManageCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [availableModules, setAvailableModules] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    adminEmail: "",
    subscriptionPlanId: "",
    industryId: "",
    enabledModules: [] as string[],
    usersQuota: 5,
    status: "Active"
  });

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedIndustry = industries.find(i => i._id === selectedId);
    
    setFormData(prev => ({
      ...prev,
      industryId: selectedId,
      // Auto-fill modules if an industry is selected, otherwise keep existing
      enabledModules: selectedIndustry && selectedIndustry.defaultModules 
        ? selectedIndustry.defaultModules 
        : prev.enabledModules
    }));
  };

  const toggleModule = (mod: string) => {
    setFormData(prev => ({
      ...prev,
      enabledModules: prev.enabledModules.includes(mod) 
        ? prev.enabledModules.filter(m => m !== mod)
        : [...prev.enabledModules, mod]
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    avgUsers: 0
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
    fetchPlans();
    fetchIndustries();
    fetchModules();
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [page, search]);

  async function fetchPlans() {
    try {
      const res = await fetch("/api/subscriptions");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
    }
  }

  async function fetchModules() {
    try {
      const res = await fetch("/api/settings/modules?limit=1000");
      if (res.ok) {
        const data = await res.json();
        setAvailableModules(data.modules || []);
      }
    } catch (error) {
      console.error("Failed to fetch modules", error);
    }
  }

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

  async function fetchCompanies() {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies?page=${page}&limit=10&search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
        if (data.totalPages) setTotalPages(data.totalPages);
        
        // Calculate basic stats from the current view or ideally an API endpoint,
        // but for now we update it based on current data for simplicity (might not reflect total accurate stats globally)
        setStats({
          total: data.total || 0,
          active: (data.companies || []).filter((c: any) => c.status === "Active").length,
          suspended: (data.companies || []).filter((c: any) => c.status === "Suspended").length,
          avgUsers: data.companies?.length > 0 ? Math.round(data.companies.reduce((acc: number, c: any) => acc + (c.users || 0), 0) / data.companies.length) : 0
        });
      } else {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error("Failed to fetch companies:", err);
        // Show the error on UI
        setStats(s => ({ ...s, total: 0, active: 0, suspended: 0, avgUsers: 0 }));
        alert("Failed to load data: " + (err.error || 'Unknown Error'));
      }
    } catch (error) {
      console.error("Failed to fetch companies", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentCompanyId(null);
    setFormData({
      name: "",
      adminEmail: "",
      subscriptionPlanId: plans.length > 0 ? plans[0]._id : "",
      industryId: "",
      enabledModules: [],
      usersQuota: 5,
      status: "Active"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setIsEditMode(true);
    setCurrentCompanyId(company._id);
    setFormData({
      name: company.name,
      adminEmail: company.adminEmail,
      subscriptionPlanId: company.plan || "", 
      industryId: company.industryId || "",
      enabledModules: company.enabledModules || [],
      usersQuota: company.usersQuota || 5,
      status: company.status || "Active"
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = isEditMode && currentCompanyId ? `/api/companies/${currentCompanyId}` : "/api/companies";
      const method = isEditMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchCompanies();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save company");
      }
    } catch (error) {
      console.error("Save error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete ${name}? This will cascade delete all associated users and data.`)) {
      try {
        const res = await fetch(`/api/companies/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchCompanies();
        } else {
          const errorData = await res.json();
          alert(errorData.error || "Failed to delete company");
        }
      } catch (error) {
        console.error("Delete error", error);
      }
    }
  };

  const columns: ColumnDef<Company>[] = [
    {
      header: "Company Name",
      cell: (company) => (
        <Link href={`/owner/companies/${company._id}`} className="hover:text-primary hover:underline font-medium text-foreground">
          {company.name}
        </Link>
      )
    },
    {
      header: "Founder / Owner",
      cell: (company) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
            {company.adminEmail?.[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-foreground font-medium text-sm">{company.adminEmail}</span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Tenant Owner</span>
          </div>
        </div>
      )
    },
    {
      header: "Plan",
      cell: (company) => (
        <span className="bg-purple-500/20 text-purple-500 px-2.5 py-1 rounded-md text-xs font-semibold">
          {company.plan}
        </span>
      )
    },
    {
      header: "Users",
      cell: (company) => `${company.users || 0} / ${company.usersQuota}`
    },
    {
      header: "Tenant Status",
      cell: (company) => (
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${company.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
          {company.status}
        </span>
      )
    },
    {
      header: "Payment Status",
      cell: (company) => (
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${company.subscriptionStatus === 'active' ? 'text-green-500 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
          {company.subscriptionStatus?.toUpperCase() || 'TRIALING'}
        </span>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (company) => (
        <div className="flex justify-end gap-3">
          <button onClick={() => openEditModal(company)} className="text-primary hover:text-primary/80 font-medium transition-colors">Edit</button>
          <button onClick={() => handleDelete(company._id, company.name)} className="text-destructive hover:text-destructive/80 font-medium transition-colors">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/owner" className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors mb-2 font-medium">
            <svg className="w-4 h-4 mr-1" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Overview
          </Link>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Manage Companies</h1>
          <p className="text-muted-foreground mt-1">View, provision, and manage tenant accounts globally.</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Register New Tenant
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox label="Total Tenants" value={stats.total.toString()} />
        <StatBox label="Active Accounts" value={stats.active.toString()} />
        <StatBox label="Suspended" value={stats.suspended.toString()} color="text-destructive" />
        <StatBox label="Avg Users/Tenant" value={stats.avgUsers.toString()} />
      </div>

      <DataTable 
        data={companies}
        columns={columns}
        loading={loading}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle="No tenants registered yet"
        emptyDescription="Get started by provisioning a new CRM instance for a client."
      />

      {/* Registration / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border">
              <h2 id="modal-title" className="text-xl font-bold text-foreground">{isEditMode ? "Edit Tenant" : "Register New Tenant"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{isEditMode ? "Modify existing tenant details." : "Provision a new CRM instance for a client."}</p>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={handleFormSubmit}>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Company Name <span className="text-destructive">*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                  placeholder="e.g. Acme Corp" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Primary Admin Email <span className="text-destructive">*</span>
                </label>
                <input 
                  type="email" 
                  required 
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                  placeholder="admin@company.com" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Subscription Plan</label>
                  <select 
                    value={formData.subscriptionPlanId}
                    onChange={(e) => setFormData({...formData, subscriptionPlanId: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                  >
                    {plans.map(p => (
                      <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Target Industry</label>
                  <select 
                    value={formData.industryId}
                    onChange={handleIndustryChange}
                    className={`w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all`}
                  >
                    <option value="">None (Blank CRM)</option>
                    {industries.map(i => (
                      <option key={i._id} value={i._id}>{i.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Users Quota</label>
                  <input 
                    type="number" 
                    min={1} 
                    value={formData.usersQuota}
                    onChange={(e) => setFormData({...formData, usersQuota: parseInt(e.target.value) || 1})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-foreground mb-2">Selected Modules</label>
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/30 border border-border rounded-xl min-h-[50px]">
                  {formData.enabledModules.length === 0 ? (
                    <span className="text-sm text-muted-foreground italic">No modules selected</span>
                  ) : (
                    formData.enabledModules.map(modName => (
                      <span key={modName} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                        {modName}
                        <button 
                          type="button" 
                          onClick={() => toggleModule(modName)}
                          className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <label className="block text-sm font-medium text-foreground mb-2">Available Modules (Grouped by Scope)</label>
                <div className="bg-muted/10 p-4 border border-border rounded-xl max-h-60 overflow-y-auto space-y-4">
                  {['Global', 'Industry', 'Company'].map(scope => {
                    const scopedModules = availableModules.filter(m => m.tenantScope === scope);
                    if (scopedModules.length === 0) return null;
                    return (
                      <div key={scope}>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2 tracking-wider">{scope} Scope</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {scopedModules.map(mod => {
                            const isSelected = formData.enabledModules.includes(mod.name);
                            if (isSelected) return null;
                            return (
                              <label key={mod._id} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-muted/50 rounded transition-colors">
                                <input 
                                  type="checkbox" 
                                  checked={false}
                                  onChange={() => toggleModule(mod.name)}
                                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                                />
                                <span className="text-sm text-foreground font-medium truncate" title={mod.name}>{mod.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Account Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted bg-background border border-border rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-semibold rounded-xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center gap-2"
                >
                  {isSubmitting && (
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isEditMode ? "Save Changes" : "Provision Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color = "text-foreground" }: { label: string, value: string, color?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
