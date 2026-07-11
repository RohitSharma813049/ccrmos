"use client";

import { useState, useEffect } from "react";

export default function SettingsClient() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [globalCurrency, setGlobalCurrency] = useState("USD ($)");
  const [loading, setLoading] = useState(true);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings/global");
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          if (data.value.maintenanceMode !== undefined) setMaintenanceMode(data.value.maintenanceMode);
          if (data.value.globalCurrency) setGlobalCurrency(data.value.globalCurrency);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  async function saveSettings(updates: any) {
    try {
      await fetch("/api/settings/global", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global: true,
          value: { maintenanceMode, globalCurrency, ...updates }
        })
      });
    } catch (e) {
      console.error(e);
    }
  }

  const toggleMaintenance = () => {
    const val = !maintenanceMode;
    setMaintenanceMode(val);
    saveSettings({ maintenanceMode: val });
  };

  const handleCurrencyChange = (e: any) => {
    const val = e.target.value;
    setGlobalCurrency(val);
    saveSettings({ globalCurrency: val });
  };

  const scaffoldTemplate = () => {
    const name = prompt("Enter template name (e.g., Dental Practice CRM):");
    if (!name) return;
    alert(`Successfully scaffolded base structure for ${name}. This would trigger a backend module generation script.`);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Global Settings & Templates</h1>
        <p className="text-gray-600 mt-1">Configure systemic variables, maintenance modes, and industry templates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Configuration</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div>
                <p className="font-semibold text-amber-500">Maintenance Mode</p>
                <p className="text-xs text-amber-400/80 mt-1">Locks all non-owners out of the CRM.</p>
              </div>
              <button onClick={toggleMaintenance} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${maintenanceMode ? 'bg-amber-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Global Currency</label>
              <select 
                value={globalCurrency}
                onChange={handleCurrencyChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="INR (₹)">INR (₹)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Industry Templates</h2>
          <p className="text-sm text-gray-600 mb-6">Pre-packaged modules and dynamic fields designed for specific verticals.</p>
          
          <div className="space-y-4">
            <div className="p-4 border border-blue-500/30 bg-blue-500/5 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Real Estate CRM</p>
                <p className="text-xs text-gray-600 mt-1">Includes Properties, Listings, Agents</p>
              </div>
              <button onClick={() => alert("Loading template schema editor...")} className="text-sm text-blue-400 hover:text-blue-300 font-medium">Edit Config</button>
            </div>
            <div className="p-4 border border-blue-500/30 bg-blue-500/5 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">IT Agency CRM</p>
                <p className="text-xs text-gray-600 mt-1">Includes Tickets, SLAs, Assets</p>
              </div>
              <button onClick={() => alert("Loading template schema editor...")} className="text-sm text-blue-400 hover:text-blue-300 font-medium">Edit Config</button>
            </div>
            <button onClick={scaffoldTemplate} className="w-full py-3 border border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-500 font-medium rounded-xl transition-all">
              + Scaffold New Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
