"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const SYSTEM_MODULES = ["Leads", "Customers", "Projects", "Invoices", "Tasks", "Settings"];
const ACTIONS = ["view", "create", "edit", "delete", "assign", "export", "import", "approve"];
const SCOPES = ["Own", "Team", "Department", "Director", "Company", "Platform"];

export default function RolesManager() {
  const [roles, setRoles] = useState<any[]>([]);
  const [modules, setModules] = useState<string[]>(SYSTEM_MODULES);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [currentRole, setCurrentRole] = useState<any>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [permissions, setPermissions] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    fetchRoles();
  }, []);

  async function fetchRoles() {
    setLoading(true);
    try {
      // Fetch Roles
      const res = await fetch("/api/roles");
      const data = await res.json();
      setRoles(data.roles || []);

      // Fetch Custom Modules to dynamically populate the matrix
      const modRes = await fetch("/api/settings/modules?limit=100");
      if (modRes.ok) {
        const modData = await modRes.json();
        const customModuleNames = (modData.modules || []).map((m: any) => m.name);
        // Merge system modules with custom modules, removing duplicates just in case
        setModules(Array.from(new Set([...SYSTEM_MODULES, ...customModuleNames])));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handlePermissionToggle = (mod: string, action: string) => {
    setPermissions((prev: any) => ({
      ...prev,
      [mod]: {
        ...(prev[mod] || {}),
        [action]: !(prev[mod]?.[action])
      }
    }));
  };

  const handleScopeChange = (mod: string, scope: string) => {
    setPermissions((prev: any) => ({
      ...prev,
      [mod]: {
        ...(prev[mod] || {}),
        recordScope: scope
      }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        id: currentRole?._id,
        name: roleName,
        description: roleDesc,
        permissions,
      };

      const url = "/api/roles";
      const method = currentRole ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(currentRole ? "Role updated successfully!" : "Role created successfully!");
        setIsModalOpen(false);
        fetchRoles();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(`Failed to save role: ${errData.error || res.statusText}`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(`Error: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, isSystem: boolean) => {
    if (isSystem) {
      toast.error("System roles cannot be deleted.");
      return;
    }
    if (!confirm("Are you sure you want to delete this role?")) return;
    
    try {
      const res = await fetch(`/api/owner/roles?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Role deleted successfully!");
        fetchRoles();
      } else {
        toast.error("Failed to delete role.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while deleting.");
    }
  };

  const openModal = (role?: any) => {
    if (role) {
      setCurrentRole(role);
      setRoleName(role.name);
      setRoleDesc(role.description || "");
      setPermissions(role.permissions || {});
    } else {
      setCurrentRole(null);
      setRoleName("");
      setRoleDesc("");
      setPermissions({});
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Custom Roles & Permissions</h2>
          <p className="text-muted-foreground mt-1">Define granular access control for your team.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          + Create Role
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        ) : roles.map((r) => (
          <div key={r._id} className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-foreground text-lg">{r.name}</h3>
                {r.isSystem && (
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-semibold">System</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.description || "No description provided."}</p>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => openModal(r)}
                className="flex-1 px-4 py-2 bg-background hover:bg-muted border border-border rounded-lg text-sm font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Edit Matrix
              </button>
              {!r.isSystem && (
                <button 
                  onClick={() => handleDelete(r._id, r.isSystem)}
                  className="px-4 py-2 text-destructive hover:bg-destructive/10 border border-transparent rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex-shrink-0">
              <h2 id="modal-title" className="text-xl font-bold text-foreground">{currentRole ? "Edit Role" : "Create New Role"}</h2>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="role-form" onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Role Name <span className="text-destructive">*</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      value={roleName}
                      onChange={e => setRoleName(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="e.g. Sales Manager"
                      disabled={currentRole?.isSystem}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Description <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <input 
                      type="text" 
                      value={roleDesc}
                      onChange={e => setRoleDesc(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="Role responsibilities..."
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">Permission Matrix</h3>
                  <div className="border border-border rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-sm text-foreground whitespace-nowrap">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Module</th>
                          <th className="px-4 py-3 font-semibold">Record Scope</th>
                          {ACTIONS.map(a => (
                            <th key={a} className="px-4 py-3 font-semibold capitalize text-center">{a}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {modules.map(mod => (
                          <tr key={mod} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-4 font-medium text-foreground">{mod}</td>
                            <td className="px-4 py-4">
                              <select 
                                value={permissions[mod]?.recordScope || "Own"}
                                onChange={(e) => handleScopeChange(mod, e.target.value)}
                                className="bg-background border border-border rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm py-1.5 px-3"
                              >
                                {SCOPES.map(scope => (
                                  <option key={scope} value={scope}>{scope}</option>
                                ))}
                              </select>
                            </td>
                            {ACTIONS.map(action => {
                              const isChecked = permissions[mod]?.[action] || false;
                              return (
                                <td key={`${mod}-${action}`} className="px-4 py-4 text-center">
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handlePermissionToggle(mod, action)}
                                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary cursor-pointer"
                                  />
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3 flex-shrink-0 rounded-b-2xl">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 border border-border bg-background text-foreground font-medium rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="role-form"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 font-medium rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center gap-2"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
