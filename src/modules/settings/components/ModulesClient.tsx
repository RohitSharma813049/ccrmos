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
      cell: (mod) => <span className="font-medium text-foreground">{mod.name}</span>
    },
    {
      header: "Status",
      cell: (mod) => (
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => toggleStatus(mod)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${mod.active ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'}`}
          >
            {mod.active ? 'Published' : 'Draft'}
          </button>
          <div className="flex gap-1 mt-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border">
              {mod.tenantScope || "Global"}
            </span>
            {mod.tenantScope === "Industry" && mod.industryId && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 truncate max-w-[120px]" title={mod.industryId?.name}>
                {mod.industryId?.name || "Industry"}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: "Fields",
      cell: (mod) => <span className="text-muted-foreground">{mod.fields?.length || 0} configured</span>
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (mod) => (
        <div className="flex justify-end">
          <button 
            onClick={() => openSchemaEditor(mod)} 
            className="text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Edit Schema
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dynamic Module Builder</h1>
          <p className="text-muted-foreground mt-1">Create custom systemic modules that tenants can subscribe to.</p>
        </div>
        <button 
          onClick={openBuildModal}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full sm:w-auto"
        >
          Build New Module
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full md:w-96">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <label className="text-sm font-medium text-muted-foreground">Scope:</label>
          <select 
            value={scopeFilter}
            onChange={(e) => {
              setScopeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none min-w-[120px]"
          >
            <option value="All">All Scopes</option>
            <option value="Global">Global</option>
            <option value="Industry">Industry</option>
          </select>
        </div>

        {scopeFilter === "Industry" && (
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto ml-0 md:ml-2">
            <label className="text-sm font-medium text-muted-foreground">Filter Industry:</label>
            <select 
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none min-w-[150px]"
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
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle="No custom modules created yet"
        emptyDescription="Get started by building your first module."
      />

      {/* Build New Module Modal */}
      {isBuildModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsBuildModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Create New Module</h2>
            <div className="space-y-4 mb-4">
              <input 
                type="text" 
                placeholder="Module Name (e.g., Inventory, Tickets)" 
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
              />
              
              <div className="mb-4">
                <label className="block mb-2 font-medium text-foreground text-sm">Scope</label>
                <select
                  value={newModuleScope}
                  onChange={(e) => setNewModuleScope(e.target.value)}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-foreground focus:ring-2 focus:ring-primary outline-none shadow-sm"
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
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
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
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
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
              <button onClick={() => setIsBuildModalOpen(false)} className="px-4 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors">Cancel</button>
              <button 
                onClick={createModule} 
                disabled={!newModuleName.trim() || (newModuleScope === "Industry" && !newModuleIndustryId) || (newModuleScope === "Company" && !newModuleCompanyId)} 
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 rounded-lg font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schema Editor Modal */}
      {isSchemaModalOpen && activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsSchemaModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-foreground">Schema Editor</h2>
                <p className="text-sm text-muted-foreground">Configure fields for {activeModule.name}</p>
              </div>
              <button onClick={() => setIsSchemaModalOpen(false)} className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-muted/30">
              {activeModule.fields.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground">No fields defined yet.</p>
                  <button onClick={addField} className="mt-3 text-primary font-medium hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">+ Add First Field</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeModule.fields.map((field: any, idx: number) => (
                    <div key={idx} className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row items-start gap-4">
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Field Name</label>
                            <input 
                              type="text" 
                              value={field.name}
                              onChange={(e) => updateField(idx, "name", e.target.value)}
                              placeholder="e.g., SKU Number"
                              className="w-full bg-background border-border text-foreground rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border transition-colors"
                            />
                          </div>
                          <div className="w-full sm:w-1/3">
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Field Type</label>
                            <select 
                              value={field.type}
                              onChange={(e) => updateField(idx, "type", e.target.value)}
                              className="w-full bg-background border-border text-foreground rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border transition-colors"
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
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Options (comma separated)</label>
                            <input 
                              type="text" 
                              value={(field.options || []).join(", ")}
                              onChange={(e) => {
                                const arr = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
                                updateField(idx, "options", arr);
                              }}
                              placeholder="e.g., High, Medium, Low"
                              className="w-full bg-background border-border text-foreground rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border transition-colors"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <input 
                            type="checkbox" 
                            checked={field.required}
                            onChange={(e) => updateField(idx, "required", e.target.checked)}
                            className="rounded border-border text-primary focus:ring-primary" 
                          />
                          <span className="text-sm text-foreground">Required field</span>
                        </div>
                      </div>
                      
                      <button onClick={() => removeField(idx)} className="text-destructive/70 hover:text-destructive p-2 hover:bg-destructive/10 rounded-lg transition-colors mt-0 sm:mt-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive self-end sm:self-auto">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                  <button onClick={addField} className="w-full py-3 border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 font-medium rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    + Add Field
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-card flex justify-end gap-3">
              <button onClick={() => setIsSchemaModalOpen(false)} className="px-4 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Cancel</button>
              <button onClick={saveSchema} className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Save Schema</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
