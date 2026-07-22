"use client";

import { useState, useEffect } from "react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

export default function ModulesClient() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [industries, setIndustries] = useState<any[]>([]);
  const [companyFilter, setCompanyFilter] = useState("All");
  const [companies, setCompanies] = useState<any[]>([]);

  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [newModuleScope, setNewModuleScope] = useState("Global");
  const [newModuleIndustryId, setNewModuleIndustryId] = useState("");
  const [newModuleCompanyId, setNewModuleCompanyId] = useState("");

  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<any>(null);

  useEffect(() => {
    fetchIndustries();
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchModules();
  }, [page, search, scopeFilter, industryFilter, companyFilter]);

  async function fetchIndustries() {
    try {
      const res = await fetch("/api/industries");
      if (res.ok) {
        const data = await res.json();
        setIndustries(data || []);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchCompanies() {
    try {
      const res = await fetch("/api/companies");
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchModules() {
    setLoading(true);
    try {
      let url = `/api/settings/modules?page=${page}&limit=10&search=${search}`;
      if (scopeFilter !== "All") url += `&scope=${scopeFilter}`;
      if (scopeFilter === "Industry" && industryFilter !== "All") url += `&industry=${industryFilter}`;
      if (scopeFilter === "Company" && companyFilter !== "All") url += `&company=${companyFilter}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setModules(data.modules || []);
        if (data.totalPages) setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function createModule() {
    if (!newModuleName.trim()) return;
    try {
      const res = await fetch("/api/settings/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newModuleName, 
          active: false, 
          fields: [],
          tenantScope: newModuleScope,
          industryId: newModuleScope === "Industry" ? newModuleIndustryId : undefined,
          companyId: newModuleScope === "Company" ? newModuleCompanyId : undefined
        })
      });
      if (res.ok) {
        setIsBuildModalOpen(false);
        setNewModuleName("");
        fetchModules();
      } else {
        alert("Failed to create module");
      }
    } catch (e) {
      console.error(e);
    }
  }

  const openBuildModal = () => {
    setNewModuleScope(scopeFilter !== "All" ? scopeFilter : "Global");
    if (scopeFilter === "Industry" && industryFilter !== "All") {
      setNewModuleIndustryId(industryFilter);
    } else {
      setNewModuleIndustryId("");
    }
    if (scopeFilter === "Company" && companyFilter !== "All") {
      setNewModuleCompanyId(companyFilter);
    } else {
      setNewModuleCompanyId("");
    }
    setNewModuleName("");
    setIsBuildModalOpen(true);
  };

  async function toggleStatus(mod: any) {
    try {
      await fetch(`/api/settings/modules/${mod._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !mod.active })
      });
      fetchModules();
    } catch (e) {
      console.error(e);
    }
  }

  const openSchemaEditor = (mod: any) => {
    setActiveModule(JSON.parse(JSON.stringify(mod))); // deep copy
    setIsSchemaModalOpen(true);
  };

  const addField = () => {
    setActiveModule({
      ...activeModule,
      fields: [...activeModule.fields, { name: "", type: "text", required: false, options: [] }]
    });
  };

  const updateField = (index: number, key: string, value: any) => {
    const updatedFields = [...activeModule.fields];
    updatedFields[index][key] = value;
    setActiveModule({ ...activeModule, fields: updatedFields });
  };

  const removeField = (index: number) => {
    const updatedFields = [...activeModule.fields];
    updatedFields.splice(index, 1);
    setActiveModule({ ...activeModule, fields: updatedFields });
  };

  const saveSchema = async () => {
    try {
      const res = await fetch(`/api/settings/modules/${activeModule._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: activeModule.fields })
      });
      if (res.ok) {
        setIsSchemaModalOpen(false);
        fetchModules();
      } else {
        alert("Failed to save schema");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      header: "Module Name",
      cell: (mod) => <span className="font-medium text-gray-900">{mod.name}</span>
    },
    {
      header: "Status",
      cell: (mod) => (
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => toggleStatus(mod)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${mod.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
          >
            {mod.active ? 'Published' : 'Draft'}
          </button>
          <div className="flex gap-1 mt-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
              {mod.tenantScope || "Global"}
            </span>
            {mod.tenantScope === "Industry" && mod.industryId && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200 truncate max-w-[120px]" title={mod.industryId?.name}>
                {mod.industryId?.name || "Industry"}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: "Fields",
      cell: (mod) => <span className="text-gray-700">{mod.fields?.length || 0} configured</span>
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (mod) => (
        <div className="flex justify-end">
          <button 
            onClick={() => openSchemaEditor(mod)} 
            className="text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            Edit Schema
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dynamic Module Builder</h1>
          <p className="text-gray-600 mt-1">Create custom systemic modules that tenants can subscribe to.</p>
        </div>
        <button 
          onClick={openBuildModal}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all"
        >
          Build New Module
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
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
              setPage(1);
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
                setPage(1);
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

      <DataTable 
        data={modules}
        columns={columns}
        loading={loading}
        search=""
        onSearchChange={() => {}}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle="No custom modules created yet"
        emptyDescription="Get started by building your first module."
      />

      {/* Build New Module Modal */}
      {isBuildModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsBuildModalOpen(false)} />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Module</h2>
            <div className="space-y-4 mb-4">
              <input 
                type="text" 
                placeholder="Module Name (e.g., Inventory, Tickets)" 
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
              
              <div className="mb-4">
                <label className="block mb-2 font-medium">Scope</label>
                <select
                  value={newModuleScope}
                  onChange={(e) => setNewModuleScope(e.target.value)}
                  className="w-full border p-2 rounded text-gray-900"
                >
                  <option value="Global">Global Scope (All Companies)</option>
                  <option value="Industry">Industry Scope</option>
                  <option value="Company">Company Scope (Specific Tenant)</option>
                </select>
              </div>

              {newModuleScope === "Industry" && (
                <div className="mb-4">
                  <select 
                    value={newModuleIndustryId} 
                    onChange={(e) => setNewModuleIndustryId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    required
                  >
                    <option value="" disabled>Select Industry...</option>
                    {industries.map(i => (
                      <option key={i._id} value={i._id}>{i.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {newModuleScope === "Company" && (
                <div className="mb-4">
                  <select 
                    value={newModuleCompanyId} 
                    onChange={(e) => setNewModuleCompanyId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    required
                  >
                    <option value="" disabled>Select Company...</option>
                    {companies.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsBuildModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button 
                onClick={createModule} 
                disabled={!newModuleName.trim() || (newModuleScope === "Industry" && !newModuleIndustryId) || (newModuleScope === "Company" && !newModuleCompanyId)} 
                className="px-4 py-2 bg-purple-600 disabled:opacity-50 hover:bg-purple-500 text-white rounded-lg font-medium shadow"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schema Editor Modal */}
      {isSchemaModalOpen && activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSchemaModalOpen(false)} />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Schema Editor</h2>
                <p className="text-sm text-gray-500">Configure fields for {activeModule.name}</p>
              </div>
              <button onClick={() => setIsSchemaModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              {activeModule.fields.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">No fields defined yet.</p>
                  <button onClick={addField} className="mt-3 text-purple-600 font-medium hover:text-purple-700">+ Add First Field</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeModule.fields.map((field: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Field Name</label>
                            <input 
                              type="text" 
                              value={field.name}
                              onChange={(e) => updateField(idx, "name", e.target.value)}
                              placeholder="e.g., SKU Number"
                              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm px-3 py-2 border"
                            />
                          </div>
                          <div className="w-1/3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Field Type</label>
                            <select 
                              value={field.type}
                              onChange={(e) => updateField(idx, "type", e.target.value)}
                              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm px-3 py-2 border"
                            >
                              <option value="text">Short Text</option>
                              <option value="textarea">Long Text</option>
                              <option value="number">Number</option>
                              <option value="date">Date</option>
                              <option value="select">Dropdown (Select)</option>
                            </select>
                          </div>
                        </div>

                        {field.type === 'select' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Options (comma separated)</label>
                            <input 
                              type="text" 
                              value={(field.options || []).join(", ")}
                              onChange={(e) => {
                                const arr = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
                                updateField(idx, "options", arr);
                              }}
                              placeholder="e.g., High, Medium, Low"
                              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm px-3 py-2 border"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <input 
                            type="checkbox" 
                            checked={field.required}
                            onChange={(e) => updateField(idx, "required", e.target.checked)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
                          />
                          <span className="text-sm text-gray-600">Required field</span>
                        </div>
                      </div>
                      
                      <button onClick={() => removeField(idx)} className="text-red-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors mt-5">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                  <button onClick={addField} className="w-full py-3 border border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 font-medium rounded-xl transition-all">
                    + Add Field
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button onClick={() => setIsSchemaModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
              <button onClick={saveSchema} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium shadow transition-colors">Save Schema</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
