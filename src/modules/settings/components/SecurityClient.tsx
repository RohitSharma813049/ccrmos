"use client";

import { useState, useEffect } from "react";

export default function SecurityClient() {
  const [require2FA, setRequire2FA] = useState(false);
  const [strictSession, setStrictSession] = useState(false);
  const [passwordRegex, setPasswordRegex] = useState("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$");
  const [rateLimit, setRateLimit] = useState(1000);
  const [apiKeys, setApiKeys] = useState<any[]>([
    { id: 1, name: "Acme Corp Integration Key", status: "Active" },
    { id: 2, name: "Globex Zapier Link", status: "Active" }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings/security");
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          if (data.value.require2FA !== undefined) setRequire2FA(data.value.require2FA);
          if (data.value.strictSession !== undefined) setStrictSession(data.value.strictSession);
          if (data.value.passwordRegex) setPasswordRegex(data.value.passwordRegex);
          if (data.value.rateLimit) setRateLimit(data.value.rateLimit);
          if (data.value.apiKeys) setApiKeys(data.value.apiKeys);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(updates: any) {
    try {
      await fetch("/api/settings/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global: true,
          value: { 
            require2FA, strictSession, passwordRegex, rateLimit, apiKeys, 
            ...updates 
          }
        })
      });
    } catch (e) {
      console.error(e);
    }
  }

  const toggle2FA = () => {
    const val = !require2FA;
    setRequire2FA(val);
    saveSettings({ require2FA: val });
  };

  const toggleSession = () => {
    const val = !strictSession;
    setStrictSession(val);
    saveSettings({ strictSession: val });
  };

  const handleRegexBlur = (e: any) => {
    saveSettings({ passwordRegex: e.target.value });
  };

  const handleRateLimitBlur = (e: any) => {
    saveSettings({ rateLimit: Number(e.target.value) });
  };

  const generateApiKey = () => {
    const name = prompt("Enter a name for the new API Key:");
    if (!name) return;
    const newKeys = [...apiKeys, { id: Date.now(), name, status: "Active" }];
    setApiKeys(newKeys);
    saveSettings({ apiKeys: newKeys });
  };

  const revokeKey = (id: number) => {
    if (!confirm("Revoke this key? It will immediately stop working.")) return;
    const newKeys = apiKeys.filter(k => k.id !== id);
    setApiKeys(newKeys);
    saveSettings({ apiKeys: newKeys });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Security & API Management</h1>
        <p className="text-gray-600 mt-1">Enforce global security policies and manage tenant API access limits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Security Policies</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">Require 2FA Globally</p>
                <p className="text-xs text-gray-500 mt-1">Force all users across all tenants to use 2FA.</p>
              </div>
              <button onClick={toggle2FA} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${require2FA ? 'bg-blue-600' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${require2FA ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">Strict Session Timeout</p>
                <p className="text-xs text-gray-500 mt-1">Automatically log users out after 15 minutes of inactivity.</p>
              </div>
              <button onClick={toggleSession} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${strictSession ? 'bg-blue-600' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${strictSession ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Complexity Regex</label>
              <input 
                type="text" 
                value={passwordRegex}
                onChange={(e) => setPasswordRegex(e.target.value)}
                onBlur={handleRegexBlur}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">API Management</h2>
            <button onClick={generateApiKey} className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
              + Generate Key
            </button>
          </div>
          <div className="space-y-5">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Global Rate Limit (Req/min)</label>
              <input 
                type="number" 
                value={rateLimit}
                onChange={(e) => setRateLimit(Number(e.target.value))}
                onBlur={handleRateLimitBlur}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>
            <div className="pt-2">
               <h3 className="text-sm font-semibold text-gray-900 mb-3">API Keys Created by Tenants</h3>
               <div className="space-y-2">
                 {apiKeys.map(key => (
                   <div key={key.id} className="p-3 border border-gray-200 bg-gray-50 rounded-lg flex justify-between items-center group">
                     <span className="text-sm text-gray-700">{key.name}</span>
                     <div className="flex items-center gap-3">
                       <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Active</span>
                       <button onClick={() => revokeKey(key.id)} className="text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Revoke</button>
                     </div>
                   </div>
                 ))}
                 {apiKeys.length === 0 && <p className="text-sm text-gray-500">No active API keys.</p>}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
