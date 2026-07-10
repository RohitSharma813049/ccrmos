"use client";

import { useState, useEffect } from "react";

const AVAILABLE_PERMISSIONS = [
  { id: "manage_users", label: "Manage Users" },
  { id: "manage_companies", label: "Manage Tenants" },
  { id: "manage_dynamic_fields", label: "Create Custom Fields" },
  { id: "view_analytics", label: "View Dashboard Analytics" },
];

export default function SuperadminPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [newRole, setNewRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  async function fetchRoles() {
    const res = await fetch("/api/roles");
    if (res.ok) {
      const data = await res.json();
      setRoles(data.roles);
    }
  }

  const togglePermission = (id: string) => {
    setSelectedPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const createRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim()) return;

    setLoading(true);
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRole.trim(), permissions: selectedPermissions }),
    });

    if (res.ok) {
      setNewRole("");
      setSelectedPermissions([]);
      await fetchRoles();
    }
    setLoading(false);
  };

  const deleteRole = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/roles?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchRoles();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Role Management</h1>
        <p className="text-gray-600 mt-1">Create custom roles (like Founder, Manager) and assign explicit permissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Create Role Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-6">Create New Role</h2>
          <form onSubmit={createRole} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role Name</label>
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="e.g. Founder"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Assign Permissions</label>
              <div className="space-y-3">
                {AVAILABLE_PERMISSIONS.map(perm => (
                  <label key={perm.id} className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{perm.label}</p>
                      <p className="text-xs text-gray-500">{perm.id}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shadow-sm"
            >
              Save Role
            </button>
          </form>
        </div>

        {/* Roles List */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Active Roles</h2>
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-xl gap-4">
                <div>
                  <span className="text-lg font-bold text-gray-900 capitalize block mb-1">{role.name}</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map((p: string) => (
                        <span key={p} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">No special permissions</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteRole(role._id)}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium shrink-0"
                >
                  Delete Role
                </button>
              </div>
            ))}
            {roles.length === 0 && (
              <p className="text-gray-500 text-center py-8">No roles defined in the system.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
