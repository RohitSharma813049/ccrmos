"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function BrandingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    platformName: "CRM OS",
    logoUrl: "",
    primaryColor: "#4f46e5"
  });

  const colors = [
    { name: "Indigo", value: "#4f46e5" },
    { name: "Blue", value: "#2563eb" },
    { name: "Rose", value: "#e11d48" },
    { name: "Violet", value: "#7c3aed" },
    { name: "Emerald", value: "#059669" },
    { name: "Orange", value: "#ea580c" },
    { name: "Slate", value: "#475569" },
  ];

  useEffect(() => {
    async function fetchBranding() {
      try {
        const res = await fetch("/api/settings/whitelabel");
        if (res.ok) {
          const data = await res.json();
          if (data?.value) {
            setFormData(prev => ({ ...prev, ...data.value }));
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchBranding();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings/whitelabel", {
        method: "POST", // The [key] route usually handles POST/PUT for updating settings
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: formData })
      });
      if (res.ok) {
        toast.success("Branding settings saved successfully. Refresh to see changes.");
      } else {
        toast.error("Failed to save settings.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Branding & Appearance</h1>
        <p className="text-gray-600 mt-1">Configure your global platform appearance.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform Name</label>
          <input 
            type="text" 
            required 
            value={formData.platformName}
            onChange={(e) => setFormData({...formData, platformName: e.target.value})}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            placeholder="e.g. Acme CRM" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo Image (Upload)</label>
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Create a local object URL to show preview
                  const url = URL.createObjectURL(file);
                  setFormData({...formData, logoUrl: url});
                }
              }}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
            />
          </div>
          {formData.logoUrl && (
            <div className="mt-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50 inline-block">
              <img src={formData.logoUrl} alt="Logo Preview" className="max-h-12 w-auto object-contain" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Primary Theme Color</label>
          <div className="flex flex-wrap gap-4 items-center">
            {colors.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setFormData({...formData, primaryColor: c.value})}
                className={`w-10 h-10 rounded-full transition-all ${formData.primaryColor === c.value ? 'ring-4 ring-offset-2 ring-gray-300 shadow-lg scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                title="Custom Color"
              />
              <span className="text-sm font-medium text-gray-500 uppercase">{formData.primaryColor}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex items-center justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Branding Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
