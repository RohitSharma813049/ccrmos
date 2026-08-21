"use client";

import { useState, useEffect } from "react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

const HIERARCHY_LEVELS = [
  { level: 2, label: "Founder" },
  { level: 3, label: "Director" },
  { level: 4, label: "Manager" },
  { level: 5, label: "Team Leader" },
  { level: 6, label: "Team Member" }
];

export default function UsersClient({ isOwner = false }: { isOwner?: boolean }) {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

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
  }, [page, search]);

  useEffect(() => {
    fetchRoles();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?page=${page}&limit=10&search=${search}`);
      const data = await res.json();
      setUsers(data.users || []);
      if (data.totalPages) setTotalPages(data.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRoles() {
    try {
      const endpoint = isOwner ? "/api/owner/roles" : "/api/roles";
      const res = await fetch(endpoint);
      const data = await res.json();
      setRoles(isOwner ? (data.data || []) : (data.roles || []));
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
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to save user: ${errData.error || res.statusText}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
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

  const columns: ColumnDef<any>[] = [
    {
      header: "Employee",
      cell: (item) => (
        <div>
          <p className="font-semibold text-zinc-100">{item.name || "N/A"}</p>
          <p className="text-xs text-zinc-400">{item.email}</p>
        </div>
      )
    },
    {
      header: "Role",
      cell: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.role?.name || "No Role"}
        </span>
      )
    },
    {
      header: "Hierarchy",
      cell: (item) => (
        <span className="font-medium">
          {HIERARCHY_LEVELS.find(l => l.level === item.hierarchyLevel)?.label || `Level ${item.hierarchyLevel}`}
        </span>
      )
    },
    {
      header: "Reports To",
      cell: (item) => (
        <div className="text-xs space-y-1">
          {item.directorId && <p><span className="text-zinc-400">Dir:</span> {item.directorId.name}</p>}
          {item.managerId && <p><span className="text-zinc-400">Mgr:</span> {item.managerId.name}</p>}
          {item.teamLeaderId && <p><span className="text-zinc-400">TL:</span> {item.teamLeaderId.name}</p>}
          {!item.directorId && !item.managerId && !item.teamLeaderId && <span className="text-zinc-400">None</span>}
        </div>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <div className="flex justify-end gap-3">
          <button onClick={() => openModal(item)} className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
          <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">User Management</h2>
          <p className="text-zinc-400 mt-1">Manage employees, assign roles, and define reporting structures.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm"
        >
          + Add User
        </button>
      </div>

      <DataTable 
        data={users}
        columns={columns}
        loading={loading}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle="No users found"
        emptyDescription="There are no users matching your criteria."
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900/40 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-zinc-800/60 flex-shrink-0">
              <h2 className="text-xl font-bold text-zinc-100">{currentId ? "Edit User" : "Add New User"}</h2>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="user-form" onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full border-zinc-700/50 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full border-zinc-700/50 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Role (Permissions)</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full border-zinc-700/50 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border"
                    >
                      <option value="">-- Select Role --</option>
                      {roles.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Hierarchy Level</label>
                    <select
                      value={formData.hierarchyLevel}
                      onChange={e => setFormData({...formData, hierarchyLevel: Number(e.target.value)})}
                      className="w-full border-zinc-700/50 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border"
                    >
                      {HIERARCHY_LEVELS.map(l => (
                        <option key={l.level} value={l.level}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800/60">
                  <h3 className="text-lg font-bold text-zinc-100 mb-4">Reporting Structure</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {formData.hierarchyLevel > 3 && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Assign to Director</label>
                        <select
                          value={formData.directorId}
                          onChange={e => setFormData({...formData, directorId: e.target.value})}
                          className="w-full border-zinc-700/50 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border"
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
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Assign to Manager</label>
                        <select
                          value={formData.managerId}
                          onChange={e => setFormData({...formData, managerId: e.target.value})}
                          className="w-full border-zinc-700/50 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border"
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
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Assign to Team Leader</label>
                        <select
                          value={formData.teamLeaderId}
                          onChange={e => setFormData({...formData, teamLeaderId: e.target.value})}
                          className="w-full border-zinc-700/50 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 border"
                        >
                          <option value="">-- None --</option>
                          {getSuperiors(5).map(u => (
                            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {formData.hierarchyLevel <= 3 && (
                      <p className="text-sm text-zinc-400 italic">This level does not report to other unit leaders within the company.</p>
                    )}

                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-zinc-800/60 flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-zinc-700/50 text-zinc-300 font-medium rounded-lg hover:bg-zinc-950/50 transition-colors"
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
