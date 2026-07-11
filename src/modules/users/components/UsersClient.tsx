"use client";

import { useState, useEffect } from "react";

const HIERARCHY_LEVELS = [
  { level: 2, label: "Founder" },
  { level: 3, label: "Director" },
  { level: 4, label: "Manager" },
  { level: 5, label: "Team Leader" },
  { level: 6, label: "Team Member" }
];

export default function UsersClient() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    role: "",
    hierarchyLevel: 6,
    directorId: "",
    managerId: "",
    teamLeaderId: ""
  });
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRoles() {
    try {
      const res = await fetch("/api/roles");
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (e) {
      console.error(e);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      
      // Clean up empty strings to undefined
      if (!payload.directorId) delete payload.directorId;
      if (!payload.managerId) delete payload.managerId;
      if (!payload.teamLeaderId) delete payload.teamLeaderId;
      if (!payload.role) delete payload.role;

      if (currentId) payload.id = currentId;

      const url = "/api/users";
      const method = currentId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        alert("Failed to save user");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const openModal = (user?: any) => {
    if (user) {
      setCurrentId(user._id);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role?._id || "",
        hierarchyLevel: user.hierarchyLevel || 6,
        directorId: user.directorId?._id || "",
        managerId: user.managerId?._id || "",
        teamLeaderId: user.teamLeaderId?._id || ""
      });
    } else {
      setCurrentId(null);
      setFormData({
        name: "",
        email: "",
        role: "",
        hierarchyLevel: 6,
        directorId: "",
        managerId: "",
        teamLeaderId: ""
      });
    }
    setIsModalOpen(true);
  };

  // Helper to get potential superiors
  const getSuperiors = (level: number) => {
    return users.filter(u => u.hierarchyLevel === level);
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage employees, assign roles, and define reporting structures.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm"
        >
          + Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Employee</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Hierarchy</th>
              <th className="px-6 py-4 font-semibold">Reports To</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No users found.</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">{u.name || "N/A"}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {u.role?.name || "No Role"}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">
                  {HIERARCHY_LEVELS.find(l => l.level === u.hierarchyLevel)?.label || `Level ${u.hierarchyLevel}`}
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs space-y-1">
                    {u.directorId && <p><span className="text-gray-500">Dir:</span> {u.directorId.name}</p>}
                    {u.managerId && <p><span className="text-gray-500">Mgr:</span> {u.managerId.name}</p>}
                    {u.teamLeaderId && <p><span className="text-gray-500">TL:</span> {u.teamLeaderId.name}</p>}
                    {!u.directorId && !u.managerId && !u.teamLeaderId && <span className="text-gray-400">None</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openModal(u)} className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                  <button onClick={() => handleDelete(u._id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">{currentId ? "Edit User" : "Add New User"}</h2>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="user-form" onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role (Permissions)</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border"
                    >
                      <option value="">-- Select Role --</option>
                      {roles.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hierarchy Level</label>
                    <select
                      value={formData.hierarchyLevel}
                      onChange={e => setFormData({...formData, hierarchyLevel: Number(e.target.value)})}
                      className="w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border"
                    >
                      {HIERARCHY_LEVELS.map(l => (
                        <option key={l.level} value={l.level}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Reporting Structure</h3>
                  <div className="grid grid-cols-1 gap-4">
                    
                    {formData.hierarchyLevel > 3 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Director</label>
                        <select
                          value={formData.directorId}
                          onChange={e => setFormData({...formData, directorId: e.target.value})}
                          className="w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border"
                        >
                          <option value="">-- None --</option>
                          {getSuperiors(3).map(u => (
                            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {formData.hierarchyLevel > 4 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Manager</label>
                        <select
                          value={formData.managerId}
                          onChange={e => setFormData({...formData, managerId: e.target.value})}
                          className="w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border"
                        >
                          <option value="">-- None --</option>
                          {getSuperiors(4).map(u => (
                            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {formData.hierarchyLevel > 5 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Team Leader</label>
                        <select
                          value={formData.teamLeaderId}
                          onChange={e => setFormData({...formData, teamLeaderId: e.target.value})}
                          className="w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border"
                        >
                          <option value="">-- None --</option>
                          {getSuperiors(5).map(u => (
                            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {formData.hierarchyLevel <= 3 && (
                      <p className="text-sm text-gray-500 italic">This level does not report to other unit leaders within the company.</p>
                    )}

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
                form="user-form"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-sm transition-colors"
              >
                Save User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
