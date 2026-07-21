"use client";

import { useState, useEffect } from "react";

const SYSTEM_MODULES = ["Leads", "Customers", "Projects", "Orders", "Invoices", "Tasks", "Settings"];
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
        setIsModalOpen(false);
        fetchRoles();
      } else {
        alert("Failed to save role");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, isSystem: boolean) => {
    if (isSystem) {
      alert("Cannot delete system roles.");
      return;
    }
    if (!confirm("Delete this role?")) return;
    
    try {
      const res = await fetch(`/api/roles?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchRoles();
    } catch (e) {
      console.error(e);
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Custom Roles & Permissions</h2>
          <p className="text-gray-600 mt-1">Define granular access control for your team.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm"
        >
          + Create Role
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Loading...</p>
        ) : roles.map((r) => (
          <div key={r._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 text-lg">{r.name}</h3>
                {r.isSystem && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">System</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{r.description || "No description provided."}</p>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => openModal(r)}
                className="flex-1 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                Edit Matrix
              </button>
              {!r.isSystem && (
                <button 
                  onClick={() => handleDelete(r._id, r.isSystem)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 border border-transparent rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">{currentRole ? "Edit Role" : "Create New Role"}</h2>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="role-form" onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                    <input 
                      required
                      type="text" 
                      value={roleName}
                      onChange={e => setRoleName(e.target.value)}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. Sales Manager"
                      disabled={currentRole?.isSystem}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input 
                      type="text" 
                      value={roleDesc}
                      onChange={e => setRoleDesc(e.target.value)}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Role responsibilities..."
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Permission Matrix</h3>
                  <div className="border border-gray-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Module</th>
                          <th className="px-4 py-3 font-semibold">Record Scope</th>
                          {ACTIONS.map(a => (
                            <th key={a} className="px-4 py-3 font-semibold capitalize text-center">{a}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {modules.map(mod => (
                          <tr key={mod} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 font-medium text-gray-900">{mod}</td>
                            <td className="px-4 py-4">
                              <select 
                                value={permissions[mod]?.recordScope || "Own"}
                                onChange={(e) => handleScopeChange(mod, e.target.value)}
                                className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm py-1"
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
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
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
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="role-form"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-sm transition-colors"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
