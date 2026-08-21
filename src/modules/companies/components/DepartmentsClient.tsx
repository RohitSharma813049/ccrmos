"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

export default function DepartmentsClient() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dynamicFields, setDynamicFields] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchDepartments();
    fetchDynamicFields();
  }, [page, search]);

  async function fetchDynamicFields() {
    try {
      const res = await fetch(`/api/dynamic-fields?target=department&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setDynamicFields(data.fields || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchDepartments() {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/departments?page=${page}&limit=10&search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || []);
        if (data.totalPages) setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function provisionDepartment(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name,
        departmentCode,
        dynamicData: formData
      };

      const res = await fetch("/api/companies/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setName("");
        setDepartmentCode("");
        setFormData({});
        fetchDepartments();
      } else {
        const err = await res.json();
        alert(`Failed to create department: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function toggleStatus(dept: any) {
    try {
      await fetch(`/api/companies/departments/${dept._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !dept.isActive })
      });
      fetchDepartments();
    } catch (e) {
      console.error(e);
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      header: "Department",
      cell: (dept) => (
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-xs text-primary border border-primary/30">
            {dept.name?.substring(0, 2).toUpperCase() || "DP"}
          </div>
          <div>
            <p className="font-medium text-zinc-100">{dept.name}</p>
            {dept.departmentCode && <p className="text-xs text-zinc-400 font-mono mt-0.5">{dept.departmentCode}</p>}
          </div>
        </div>
      )
    },
    ...dynamicFields.slice(0, 3).map((field) => ({
      header: field.name,
      cell: (dept: any) => {
        const val = dept.dynamicData?.[field.name];
        if (field.type === "Dropdown (Select)") {
           const color = field.optionColors?.[val] || "#6b7280"; // default gray
           return (
             <span 
               className="px-2.5 py-1 rounded-md text-xs font-semibold border shadow-sm"
               style={{ backgroundColor: `${color}1A`, color: color, borderColor: `${color}33` }}
             >
               {val || "N/A"}
             </span>
           );
        }
        return <span className="text-zinc-300">{val?.toString() || "N/A"}</span>;
      }
    })),
    {
      header: "Status",
      cell: (dept) => (
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${dept.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
          {dept.isActive ? 'Active' : 'Suspended'}
        </span>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (dept) => (
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => toggleStatus(dept)}
            className={`${dept.isActive ? 'text-red-400 hover:text-red-600' : 'text-emerald-500 hover:text-emerald-600'} font-medium transition-colors`}
          >
            {dept.isActive ? 'Suspend' : 'Restore'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 fade-in pb-12">
      <PageHeader
        title="Department Management"
        description="Provision and manage departments for your company."
      >
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Provision Department
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 backdrop-blur-xl/40 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-6 shadow-lg">
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Total Departments</p>
          <p className="text-3xl font-bold text-zinc-100">{departments.length}</p>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl/40 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-6 shadow-lg">
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Active</p>
          <p className="text-3xl font-bold text-emerald-500">{departments.filter(d => d.isActive).length}</p>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl/40 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-6 shadow-lg">
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Suspended</p>
          <p className="text-3xl font-bold text-amber-400">{departments.filter(d => !d.isActive).length}</p>
        </div>
      </div>

      <DataTable 
        data={departments}
        columns={columns}
        loading={loading}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle="No departments provisioned yet"
        emptyDescription="Get started by provisioning your first department."
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-700/50">
              <h2 className="text-xl font-bold text-zinc-100">Provision Department</h2>
              <p className="text-sm text-zinc-400 mt-1">Create a new department and fill in details.</p>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={provisionDepartment}>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Department Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Department ID / Code</label>
                <input 
                  type="text" 
                  value={departmentCode}
                  onChange={(e) => setDepartmentCode(e.target.value)}
                  placeholder="e.g. SALES-US (Optional)"
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                />
              </div>

              {/* Dynamic Fields */}
              {dynamicFields.length > 0 && (
                <div className="pt-2 border-t border-zinc-800/60">
                  <h3 className="text-sm font-semibold text-zinc-100 mb-3">Additional Details</h3>
                  <div className="space-y-4">
                    {dynamicFields.map(field => (
                      <div key={field._id}>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                          {field.name} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        
                        {field.type === "Text String" && (
                          <input 
                            type="text" 
                            required={field.required}
                            value={formData[field.name] || ""}
                            onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                            className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                          />
                        )}

                        {field.type === "Number" && (
                          <input 
                            type="number" 
                            required={field.required}
                            value={formData[field.name] || ""}
                            onChange={(e) => setFormData({...formData, [field.name]: Number(e.target.value)})}
                            className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                          />
                        )}

                        {field.type === "Dropdown (Select)" && (
                          <select 
                            required={field.required}
                            value={formData[field.name] || ""}
                            onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                            className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none" 
                          >
                            <option value="">Select...</option>
                            {field.options?.map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800/60 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl shadow-lg transition-all">
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
