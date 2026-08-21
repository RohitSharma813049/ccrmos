'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PermissionMatrix from './PermissionMatrix';

export default function RolesClient() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tenantScope: 'Global',
  });

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/owner/roles');
      const json = await res.json();
      if (res.ok) {
        setRoles(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRole 
        ? `/api/owner/roles/${editingRole._id}`
        : '/api/owner/roles';
      
      const method = editingRole ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save role');

      toast.success('Role saved successfully');
      setIsModalOpen(false);
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save role');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      const res = await fetch(`/api/owner/roles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete role');
      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete role');
    }
  };

  const openModal = (role: any = null) => {
    setEditingRole(role);
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        tenantScope: role.tenantScope || 'Global',
      });
    } else {
      setFormData({ name: '', description: '', tenantScope: 'Global' });
    }
    setIsModalOpen(true);
  };

  const openMatrix = (role: any) => {
    setEditingRole(role);
    setIsMatrixOpen(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Custom Roles & Permissions</h1>
          <p className="text-zinc-400 mt-1">Define granular access control for your team globally.</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-sm transition-all flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Role
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role._id} className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6 hover:shadow-xl transition-all relative flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">{role.name}</h3>
                  <span className="inline-block mt-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-gray-100 text-zinc-400 rounded">{role.tenantScope || 'Global'} Scope</span>
                </div>
                <button 
                  onClick={() => openModal(role)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-zinc-400 mb-6 flex-grow">{role.description || 'No description provided.'}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60 mt-auto">
                <button 
                  onClick={() => openMatrix(role)}
                  className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-950/50 border border-zinc-700/50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Edit Matrix
                </button>
                <button 
                  onClick={() => handleDelete(role._id)}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Basic Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900/40 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800/60 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-100">
                {editingRole ? 'Edit Role Details' : 'Create New Role'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-zinc-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Role Name <span className="text-red-500">*</span></label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sales & Revenue"
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                <input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Scope Target</label>
                <select
                  value={formData.tenantScope}
                  onChange={(e) => setFormData({ ...formData, tenantScope: e.target.value })}
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="Global">Global Scope</option>
                  <option value="Industry">Industry Scope</option>
                  <option value="Company">Company Scope</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-all"
              >
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Permission Matrix Modal */}
      {editingRole && isMatrixOpen && (
        <PermissionMatrix 
          role={editingRole} 
          isOpen={isMatrixOpen} 
          onClose={() => {
            setIsMatrixOpen(false);
            fetchRoles(); 
          }} 
        />
      )}
    </div>
  );
}
