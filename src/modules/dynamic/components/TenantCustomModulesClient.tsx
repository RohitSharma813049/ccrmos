"use client";

import { useState, useEffect } from "react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { useSession } from "next-auth/react";

export default function TenantCustomModulesClient() {
  const { data: session } = useSession();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");

  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<any>(null);

  // We consider a module editable by the tenant if it is specifically scoped to their Company.
  // Global or Industry modules are read-only.
  const isEditable = (mod: any) => {
    if (!session?.user) return false;
    const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    return mod.tenantScope === "Company" && mod.companyId?._id === userCompanyId;
  };

  useEffect(() => {
    fetchModules();
  }, [page, search]);

  async function fetchModules() {
    setLoading(true);
    try {
      // The backend GET /api/settings/modules automatically filters based on the user's hierarchyLevel/companyId.
      let url = `/api/settings/modules?page=${page}&limit=10&search=${search}`;
      
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
      // API automatically sets tenantScope="Company" and companyId for non-SuperAdmins
      const res = await fetch("/api/settings/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newModuleName, 
          active: false, 
          fields: [],
          tenantScope: "Company" // Required for backend fallback check
        })
      });
      if (res.ok) {
        setIsBuildModalOpen(false);
        setNewModuleName("");
        fetchModules();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to create module");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create module due to a network error.");
    }
  }

  const openBuildModal = () => {
    setNewModuleName("");
    setIsBuildModalOpen(true);
  };

  async function toggleEnable(mod: any) {
    try {
      const res = await fetch(`/api/settings/modules/${mod._id}/toggle-enable`, {
        method: "PUT"
      });
      if (res.ok) {
        fetchModules();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to toggle module");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to toggle module due to a network error.");
    }
  }

  async function toggleStatus(mod: any) {
    if (!isEditable(mod)) return alert("You cannot edit a global module.");
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
    if (!isEditable(mod)) return alert("You can only view schema for global modules, not edit them.");
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
        <div className="flex flex-col gap-1 items-start">
          <button 
            onClick={() => isEditable(mod) ? toggleStatus(mod) : undefined}
            disabled={!isEditable(mod)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${mod.active ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-700/50 dark:bg-slate-800 dark:text-zinc-400 dark:border-slate-700'} ${!isEditable(mod) && 'opacity-50 cursor-not-allowed'}`}
          >
            {mod.active ? 'Published' : 'Draft'}
          </button>
          <div className="flex gap-1 mt-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${mod.tenantScope === 'Global' || mod.tenantScope === 'Industry' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 dark:bg-slate-800 dark:text-zinc-400 dark:border-slate-700'}`}>
              {mod.tenantScope || "Global"}
            </span>
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
      cell: (mod) => {
        const userCompanyId = (session?.user as any)?.companyId || (session?.user as any)?.impersonatedFounderId;
        const isEnabled = mod.enabledBy?.includes(userCompanyId);

        return (
          <div className="flex justify-end gap-2 items-center">
            {isEditable(mod) ? (
              <button 
                onClick={() => openSchemaEditor(mod)} 
                className="text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Edit Schema
              </button>
            ) : (
              <button 
                onClick={() => toggleEnable(mod)} 
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isEnabled ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'}`}
              >
                {isEnabled ? 'Disable' : 'Enable for my Workspace'}
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Custom Modules</h1>
          <p className="text-muted-foreground mt-1">Build and manage custom databases tailored specifically to your business needs.</p>
        </div>
        {/* Removed Build Custom Module button per request */}
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
      </div>

      <DataTable 
        data={modules}
        columns={columns}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle="No custom modules created yet"
        emptyDescription="Get started by building your first tenant-specific module."
      />

      {/* Build New Module Modal */}
      {isBuildModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsBuildModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Create New Custom Module</h2>
            <p className="text-sm text-muted-foreground mb-4">This module will be strictly accessible only by your organization.</p>
            <div className="space-y-4 mb-6">
              <input 
                type="text" 
                placeholder="Module Name (e.g., Inventory, Tickets)" 
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsBuildModalOpen(false)} className="px-4 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors">Cancel</button>
              <button 
                onClick={createModule} 
                disabled={!newModuleName.trim()} 
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
                <p className="text-sm text-muted-foreground">Configure custom fields for {activeModule.name}</p>
              </div>
              <button onClick={() => setIsSchemaModalOpen(false)} className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-muted/30">
              {activeModule.fields.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground">No custom fields defined yet.</p>
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
                              placeholder="e.g., Serial Number"
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
                              <option value="phone">Phone Number</option>
                              <option value="whatsapp">WhatsApp</option>
                              <option value="checkbox">Checkbox (Boolean)</option>
                              <option value="score">Score (1-10)</option>
                              <option value="relation">Relation (Link to Module)</option>
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
                              placeholder="e.g., Action Required, In Progress, Complete"
                              className="w-full bg-background border-border text-foreground rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border transition-colors"
                            />
                          </div>
                        )}

                        {field.type === 'relation' && (
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Relation Target</label>
                            <select 
                              value={field.relationTarget || "Project"}
                              onChange={(e) => updateField(idx, "relationTarget", e.target.value)}
                              className="w-full bg-background border-border text-foreground rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border transition-colors"
                            >
                              <option value="Project">Project</option>
                              <option value="Lead">Lead</option>
                              <option value="Customer">Customer</option>
                            </select>
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
