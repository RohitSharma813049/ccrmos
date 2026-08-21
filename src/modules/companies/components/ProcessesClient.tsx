"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

export default function ProcessesClient() {
  const [processes, setProcesses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dynamicFields, setDynamicFields] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [processCode, setProcessCode] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchProcesses();
    fetchDynamicFields();
  }, [page, search]);

  useEffect(() => {
    if (isModalOpen) {
      fetchDepartments();
    }
  }, [isModalOpen]);

  async function fetchDynamicFields() {
    try {
      const res = await fetch(`/api/dynamic-fields?target=process&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setDynamicFields(data.fields || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchDepartments() {
    try {
      const res = await fetch(`/api/companies/departments?limit=1000`);
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchProcesses() {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/processes?page=${page}&limit=10&search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setProcesses(data.processes || []);
        if (data.totalPages) setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function provisionProcess(e: React.FormEvent) {
    e.preventDefault();
    if (!departmentId) {
      alert("Please select a department.");
      return;
    }
    
    try {
      const payload = {
        name,
        processCode,
        departmentId,
        dynamicData: formData
      };

      const res = await fetch("/api/companies/processes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setName("");
        setProcessCode("");
        setDepartmentId("");
        setFormData({});
        fetchProcesses();
      } else {
        const err = await res.json();
        alert(`Failed to create process: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function toggleStatus(proc: any) {
    try {
      await fetch(`/api/companies/processes/${proc._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !proc.isActive })
      });
      fetchProcesses();
    } catch (e) {
      console.error(e);
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      header: "Process",
      cell: (proc) => (
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-xs text-primary border border-primary/30">
            {proc.name?.substring(0, 2).toUpperCase() || "PR"}
          </div>
          <div>
            <p className="font-medium text-zinc-100">{proc.name}</p>
            {proc.processCode && <p className="text-xs text-zinc-400 font-mono mt-0.5">{proc.processCode}</p>}
          </div>
        </div>
      )
    },
    {
      header: "Department",
      cell: (proc) => (
        <span className="text-sm font-medium text-zinc-300">
          {proc.departmentId?.name || "Unknown"}
        </span>
      )
    },
    ...dynamicFields.slice(0, 3).map((field) => ({
      header: field.name,
      cell: (proc: any) => {
        const val = proc.dynamicData?.[field.name];
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
      cell: (proc) => (
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${proc.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
          {proc.isActive ? 'Active' : 'Suspended'}
        </span>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (proc) => (
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => toggleStatus(proc)}
            className={`${proc.isActive ? 'text-red-400 hover:text-red-600' : 'text-emerald-500 hover:text-emerald-600'} font-medium transition-colors`}
          >
            {proc.isActive ? 'Suspend' : 'Restore'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 fade-in pb-12">
      <PageHeader
        title="Process Management"
        description="Provision and manage processes for your departments."
      >
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Provision Process
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 backdrop-blur-xl/40 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-6 shadow-lg">
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Total Processes</p>
          <p className="text-3xl font-bold text-zinc-100">{processes.length}</p>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl/40 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-6 shadow-lg">
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Active</p>
          <p className="text-3xl font-bold text-emerald-500">{processes.filter(p => p.isActive).length}</p>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl/40 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-6 shadow-lg">
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Suspended</p>
          <p className="text-3xl font-bold text-amber-400">{processes.filter(p => !p.isActive).length}</p>
        </div>
      </div>

      <DataTable 
        data={processes}
        columns={columns}
        loading={loading}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle="No processes provisioned yet"
        emptyDescription="Get started by provisioning your first process."
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-700/50">
              <h2 className="text-xl font-bold text-zinc-100">Provision Process</h2>
              <p className="text-sm text-zinc-400 mt-1">Create a new process and assign it to a department.</p>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={provisionProcess}>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Process Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Department <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none" 
                >
                  <option value="">Select a department...</option>
                  {departments.map((dept: any) => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Process ID / Code</label>
                <input 
                  type="text" 
                  value={processCode}
                  onChange={(e) => setProcessCode(e.target.value)}
                  placeholder="e.g. INBOUND-CALLS (Optional)"
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors bg-gray-100 hover:bg-gray-200 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl shadow-lg transition-all">
                  Create Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
