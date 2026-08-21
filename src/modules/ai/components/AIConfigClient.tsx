"use client";

import { useState, useEffect } from "react";

export default function AIConfigClient() {
  const [providers, setProviders] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "", description: "", endpointUrl: "", apiKey: "", defaultModel: "", isActive: true, allowTenantOverride: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [providersRes, permissionsRes] = await Promise.all([
        fetch("/api/admin/ai-providers"),
        fetch("/api/admin/ai-permissions")
      ]);

      if (providersRes.ok) {
        const data = await providersRes.json();
        setProviders(data.providers || []);
      }
      if (permissionsRes.ok) {
        const data = await permissionsRes.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveProvider = async () => {
    try {
      const url = editingProvider ? `/api/admin/ai-providers/${editingProvider._id}` : `/api/admin/ai-providers`;
      const method = editingProvider ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm("Are you sure you want to delete this AI Provider?")) return;
    try {
      const res = await fetch(`/api/admin/ai-providers/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePermission = async (companyId: string, providerId: string, hasAccess: boolean) => {
    try {
      const action = hasAccess ? "revoke" : "grant";
      const res = await fetch(`/api/admin/ai-permissions/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, action })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading AI Configurations...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Dynamic AI Providers</h1>
          <p className="text-sm text-zinc-400 mt-1">Create custom AI providers and manage tenant access.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProvider(null);
            setFormData({ name: "", description: "", endpointUrl: "", apiKey: "", defaultModel: "", isActive: true, allowTenantOverride: true });
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Add AI Provider
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {providers.map(provider => (
          <div key={provider._id} className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl shadow-sm border border-zinc-700/50 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${provider.color}-50 text-${provider.color}-600`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={provider.icon || "M13 10V3L4 14h7v7l9-11h-7z"} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">{provider.name}</h3>
                  <p className="text-xs text-zinc-400">{provider.defaultModel}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${provider.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {provider.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            
            <p className="text-sm text-zinc-400 mb-4 flex-grow">{provider.description}</p>
            
            <div className="text-xs text-zinc-400 bg-zinc-950/50 p-3 rounded-xl mb-4 truncate">
              <span className="font-semibold text-zinc-300">Endpoint: </span>
              {provider.endpointUrl || "N/A"}
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/60">
              <p className="text-xs text-zinc-400">
                {provider.allowTenantOverride ? "Tenants can BYOK" : "Global Billing (Owner Key)"}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingProvider(provider);
                    setFormData(provider);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteProvider(provider._id)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {providers.length > 0 && (
        <div className="mt-12 bg-zinc-900/40 backdrop-blur-xl rounded-2xl shadow-sm border border-zinc-700/50 overflow-hidden">
          <div className="p-6 border-b border-zinc-700/50 bg-zinc-950/50">
            <h2 className="text-lg font-bold text-zinc-100">Tenant Permissions</h2>
            <p className="text-sm text-zinc-400">Grant or revoke access to AI Providers for specific companies.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-zinc-950/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Plan</th>
                  {providers.map(p => (
                    <th key={p._id} className="px-6 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-zinc-900/40 backdrop-blur-xl divide-y divide-gray-200">
                {companies.map(company => (
                  <tr key={company._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-100">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                      <span className="px-2 py-1 bg-zinc-800/50 rounded-md">{company.plan || "Basic"}</span>
                    </td>
                    {providers.map(provider => {
                      const hasAccess = company.allowedAIProviders?.some((ap: any) => ap._id === provider._id || ap === provider._id);
                      return (
                        <td key={provider._id} className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleTogglePermission(company._id, provider._id, hasAccess)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${hasAccess ? 'bg-emerald-500' : 'bg-zinc-700/50'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-zinc-900/40 backdrop-blur-xl transition-transform ${hasAccess ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-700/50">
              <h2 className="text-xl font-bold text-zinc-100">{editingProvider ? 'Edit' : 'Create'} AI Provider</h2>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Provider Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. OpenAI"
                  className="w-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Endpoint URL</label>
                <input 
                  type="text" 
                  value={formData.endpointUrl}
                  onChange={(e) => setFormData({...formData, endpointUrl: e.target.value})}
                  placeholder="https://api.openai.com/v1"
                  className="w-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Global API Key</label>
                <input 
                  type="password" 
                  value={formData.apiKey}
                  onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                  placeholder="sk-..."
                  className="w-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Default Model Name</label>
                <input 
                  type="text" 
                  value={formData.defaultModel}
                  onChange={(e) => setFormData({...formData, defaultModel: e.target.value})}
                  placeholder="gpt-4o"
                  className="w-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              
              <div className="flex items-center gap-3 mt-4">
                <input 
                  type="checkbox" 
                  checked={formData.allowTenantOverride}
                  onChange={(e) => setFormData({...formData, allowTenantOverride: e.target.checked})}
                  className="h-4 w-4 text-indigo-600 rounded border-zinc-700/50" 
                />
                <label className="text-sm font-medium text-zinc-300">Allow Tenants to override with their own API Keys (BYOK)</label>
              </div>
            </div>
            <div className="p-4 bg-zinc-950/50 border-t border-zinc-700/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-sm font-medium text-zinc-300 bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-lg hover:bg-zinc-950/50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProvider}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Provider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
