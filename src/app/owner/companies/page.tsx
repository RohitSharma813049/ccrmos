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
  
  const [formData, setFormData] = useState({
    name: "",
    adminEmail: "",
    subscriptionPlanId: "",
    industryId: "",
    usersQuota: 5,
    status: "Active"
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    avgUsers: 0
  });

  useEffect(() => {
    fetchPlans();
    fetchIndustries();
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
      }
    } catch (error) {
      console.error("Failed to fetch companies", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setFormData({ name: "", adminEmail: "", subscriptionPlanId: plans[0]?._id || "", industryId: "", usersQuota: 5, status: "Active" });
    setIsModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setIsEditMode(true);
    setCurrentCompanyId(company._id);
    // Find the plan ID that matches the company's plan name, or default to the first one
    const matchingPlan = plans.find(p => p.name === company.plan);
    setFormData({
      name: company.name,
      adminEmail: company.adminEmail,
      subscriptionPlanId: matchingPlan ? matchingPlan._id : (plans[0]?._id || ""),
      industryId: "", // Cannot edit industry after creation for now
      usersQuota: company.usersQuota,
      status: company.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        <Link href={`/owner/companies/${company._id}`} className="hover:text-blue-600 hover:underline font-medium text-gray-900">
          {company.name}
        </Link>
      )
    },
    {
      header: "Founder / Owner",
      cell: (company) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
            {company.adminEmail?.[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-gray-900 font-medium text-sm">{company.adminEmail}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Tenant Owner</span>
          </div>
        </div>
      )
    },
    {
      header: "Plan",
      cell: (company) => (
        <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-xs font-semibold">
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
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${company.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
          {company.status}
        </span>
      )
    },
    {
      header: "Payment Status",
      cell: (company) => (
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${company.subscriptionStatus === 'active' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
          {company.subscriptionStatus?.toUpperCase() || 'TRIALING'}
        </span>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (company) => (
        <div className="flex justify-end gap-3">
          <button onClick={() => openEditModal(company)} className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Edit</button>
          <button onClick={() => handleDelete(company._id, company.name)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/owner" className="inline-flex items-center text-sm text-blue-400 hover:text-blue-500 transition-colors mb-2 font-medium">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Overview
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Companies</h1>
          <p className="text-gray-600 mt-1">View, provision, and manage tenant accounts globally.</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Register New Tenant
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox label="Total Tenants" value={stats.total.toString()} />
        <StatBox label="Active Accounts" value={stats.active.toString()} />
        <StatBox label="Suspended" value={stats.suspended.toString()} color="text-red-500" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "Edit Tenant" : "Register New Tenant"}</h2>
              <p className="text-sm text-gray-600 mt-1">{isEditMode ? "Modify existing tenant details." : "Provision a new CRM instance for a client."}</p>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={handleFormSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                  placeholder="e.g. Acme Corp" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Admin Email</label>
                <input 
                  type="email" 
                  required 
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                  placeholder="admin@company.com" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subscription Plan</label>
                  <select 
                    value={formData.subscriptionPlanId}
                    onChange={(e) => setFormData({...formData, subscriptionPlanId: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    {plans.map(p => (
                      <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>
                    ))}
                  </select>
                </div>
                {!isEditMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Industry</label>
                    <select 
                      value={formData.industryId}
                      onChange={(e) => setFormData({...formData, industryId: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">None (Blank CRM)</option>
                      {industries.map(i => (
                        <option key={i._id} value={i._id}>{i.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={isEditMode ? "col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Users Quota</label>
                  <input 
                    type="number" 
                    min={1} 
                    value={formData.usersQuota}
                    onChange={(e) => setFormData({...formData, usersQuota: parseInt(e.target.value) || 1})}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                  />
                </div>
              </div>

              {isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
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

function StatBox({ label, value, color = "text-gray-900" }: { label: string, value: string, color?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
