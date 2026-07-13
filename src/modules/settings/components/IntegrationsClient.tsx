"use client";

import React, { useState, useEffect } from "react";

export default function IntegrationsClient() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [justGeneratedKey, setJustGeneratedKey] = useState<{name: string, key: string} | null>(null);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch("/api/settings/api-keys");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch API keys");
      setApiKeys(data.keys || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const generateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    
    setError(null);
    try {
      const res = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate key");
      
      setJustGeneratedKey({ name: data.apiKey.name, key: data.apiKey.key });
      setNewKeyName("");
      fetchApiKeys();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const revokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Integrations using it will immediately break.")) return;
    
    try {
      const res = await fetch(`/api/settings/api-keys?id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to revoke key");
      fetchApiKeys();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading API Keys...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">API & Integrations</h1>
        <p className="text-slate-500 max-w-2xl text-lg">
          Manage your API keys to securely connect your CRM tenant to external websites and applications.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {justGeneratedKey && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-emerald-900 font-bold text-lg mb-1">New API Key Generated!</h3>
              <p className="text-emerald-700 text-sm mb-4">
                Please copy this key immediately. For security reasons, <span className="font-semibold">you will not be able to see it again.</span>
              </p>
              
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-emerald-200 px-4 py-3 rounded-xl text-slate-800 font-mono text-sm break-all shadow-inner">
                  {justGeneratedKey.key}
                </code>
                <button 
                  onClick={() => copyToClipboard(justGeneratedKey.key)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap shadow-sm"
                >
                  Copy Key
                </button>
              </div>
              
              <button 
                onClick={() => setJustGeneratedKey(null)}
                className="mt-4 text-emerald-600 hover:text-emerald-800 text-sm font-medium transition-colors"
              >
                I have saved it securely
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col: Generator */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Key</h2>
            <form onSubmit={generateKey} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Key Name</label>
                <input 
                  type="text" 
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  placeholder="e.g., Marketing Website"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-sm"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={!newKeyName.trim()}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-sm"
              >
                Generate API Key
              </button>
            </form>
          </div>
          
          <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
            <h3 className="text-blue-900 font-bold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Website Embed Code
            </h3>
            <p className="text-blue-800/80 text-sm mb-4 leading-relaxed">
              Use this code snippet to embed a Lead Capture form directly into your external website.
            </p>
            <div className="relative group">
              <pre className="bg-slate-900 text-blue-100 p-4 rounded-2xl text-xs overflow-x-auto font-mono shadow-inner leading-relaxed">
{`<!-- CRM Lead Capture Form -->
<script 
  src="https://yourcrm.com/embed.js" 
  data-key="YOUR_API_KEY"
></script>
<div id="crm-form-container"></div>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Right Col: Key List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-between">
              Active API Keys
              <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">
                {apiKeys.length} Total
              </span>
            </h2>
            
            {apiKeys.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-slate-900 font-semibold mb-1">No API keys yet</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Generate an API key to securely connect your CRM to external services.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all gap-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-1">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                          {key.name}
                          {key.isActive ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                            {key.maskedKey}
                          </code>
                          <span className="text-xs text-slate-400">
                            Created {new Date(key.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => revokeKey(key._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
