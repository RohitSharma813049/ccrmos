'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function IndustriesClient() {
  const [industries, setIndustries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    defaultModules: [] as string[],
  });

  const availableModules = [
    { id: 'lead', label: 'Leads' },
    { id: 'customer', label: 'Customers' },
    { id: 'project', label: 'Projects' },
    { id: 'task', label: 'Tasks' },
    { id: 'order', label: 'Orders' },
    { id: 'invoice', label: 'Invoices' },
    { id: 'partner', label: 'Partners' },
    { id: 'property', label: 'Properties' },
  ];

  const handleModuleToggle = (moduleId: string) => {
    setFormData(prev => {
      const isSelected = prev.defaultModules.includes(moduleId);
      return {
        ...prev,
        defaultModules: isSelected 
          ? prev.defaultModules.filter(m => m !== moduleId)
          : [...prev.defaultModules, moduleId]
      };
    });
  };

  const fetchIndustries = async () => {
    try {
      const res = await fetch('/api/owner/industries');
      const json = await res.json();
      if (res.ok) {
        setIndustries(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingIndustry 
        ? `/api/owner/industries/${editingIndustry._id}`
        : '/api/owner/industries';
      
      const method = editingIndustry ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save industry');

      toast.success('Industry saved successfully');
      setIsModalOpen(false);
      fetchIndustries();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save industry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this industry?')) return;
    try {
      const res = await fetch(`/api/owner/industries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete industry');
      toast.success('Industry deleted successfully');
      fetchIndustries();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete industry');
    }
  };

  const openModal = (industry: any = null) => {
    setEditingIndustry(industry);
    if (industry) {
      setFormData({
        name: industry.name || '',
        description: industry.description || '',
        icon: industry.icon || '',
        defaultModules: industry.defaultModules || [],
      });
    } else {
      setFormData({ name: '', description: '', icon: '', defaultModules: [] });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Industries</h1>
          <p className="text-gray-500 mt-1">Manage global industry types for the CRM.</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-sm transition-all flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Industry
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((ind) => (
            <div key={ind._id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all group relative">
              <h3 className="text-lg font-bold text-gray-900">{ind.name}</h3>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{ind.description || 'No description provided.'}</p>
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <button 
                  onClick={() => openModal(ind)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(ind._id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingIndustry ? 'Edit Industry' : 'Add New Industry'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry Name <span className="text-red-500">*</span></label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Healthcare, Real Estate"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Modules</label>
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
                  {availableModules.map(mod => (
                    <label key={mod.id} className="flex items-center space-x-2 cursor-pointer p-1">
                      <input 
                        type="checkbox" 
                        checked={formData.defaultModules.includes(mod.id)}
                        onChange={() => handleModuleToggle(mod.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 font-medium">{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-all"
              >
                {editingIndustry ? 'Update Industry' : 'Create Industry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
