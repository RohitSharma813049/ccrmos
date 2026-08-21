"use client";

import { useState, useEffect } from "react";

export default function TemplateBuilderClient({ template }: { template: any }) {
  const [globalModules, setGlobalModules] = useState<any[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Initialize selected modules from existing template data
    if (template.modules && Array.isArray(template.modules)) {
      setSelectedModules(template.modules.map((m: any) => m.name)); // Match by name to avoid _id cloning mismatch
    }
    fetchGlobalModules();
  }, [template]);

  async function fetchGlobalModules() {
    try {
      // Platform owner has hierarchyLevel 1, so /api/settings/modules returns companyId: null (global)
      const res = await fetch("/api/settings/modules?limit=100");
      if (res.ok) {
        const data = await res.json();
        setGlobalModules(data.modules || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const toggleModule = (module: any) => {
    setSelectedModules(prev => {
      if (prev.includes(module.name)) {
        return prev.filter(name => name !== module.name);
      } else {
        return [...prev, module.name];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Find the full module objects based on the selected names
      const modulesToBundle = globalModules.filter(m => selectedModules.includes(m.name));
      
      const payload = {
        modules: modulesToBundle
      };

      const res = await fetch(`/api/settings/templates/${template._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Template bundle saved successfully!");
      } else {
        alert("Failed to save template bundle");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading modules...</div>;

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">{template.name} - Bundle Configuration</h1>
          <p className="text-zinc-400 mt-1">Select the global modules that should be cloned into this template.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.history.back()} className="px-4 py-2 bg-gray-100 text-zinc-300 rounded-lg hover:bg-gray-200 transition-colors">
            Back
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Bundle"}
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-zinc-100 mb-6">Available Global Modules</h2>
        
        {globalModules.length === 0 ? (
          <div className="p-8 text-center bg-zinc-950/50 rounded-xl border border-dashed border-zinc-700/50">
            <p className="text-zinc-400">No global modules exist. Go to Module Builder and create some generic modules first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalModules.map(mod => {
              const isSelected = selectedModules.includes(mod.name);
              return (
                <div 
                  key={mod._id} 
                  onClick={() => toggleModule(mod)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? "border-blue-500 bg-blue-50/50" 
                      : "border-zinc-700/50 hover:border-blue-300 hover:bg-zinc-950/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-zinc-100">{mod.name}</h3>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? "bg-blue-500 border-blue-500" : "border-zinc-700/50 bg-zinc-900/40 backdrop-blur-xl"}`}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">{mod.description || "No description provided."}</p>
                  <div className="mt-3 text-xs font-medium text-blue-600">
                    {mod.fields?.length || 0} Fields
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
