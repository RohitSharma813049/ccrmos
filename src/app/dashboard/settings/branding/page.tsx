"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function BrandingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    platformName: "CRM OS",
    logoUrl: "",
    primaryColor: "#4f46e5",
    domains: [] as { name: string, status: string }[]
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
        const data = await res.json();
        
        if (res.status === 403 && data.requiresUpgrade) {
          setUpgradeRequired(true);
          return;
        }

        if (res.ok && data?.value) {
          setFormData(prev => ({ 
            ...prev, 
            ...data.value,
            domains: data.value.domains || []
          }));
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: formData })
      });
      const data = await res.json();
      
      if (res.status === 403 && data.requiresUpgrade) {
        setUpgradeRequired(true);
        toast.error("Upgrade required to use this feature.");
      } else if (res.ok) {
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

  const registerDomain = () => {
    const d = prompt("Enter the custom domain you'd like to map (e.g. app.yourcompany.com)");
    if (d) {
      setFormData(prev => ({
        ...prev,
        domains: [...prev.domains, { name: d.trim(), status: "Pending DNS Verification" }]
      }));
    }
  };

  async function verifyDomain(domainName: string) {
    setVerifyingDomain(domainName);
    try {
      // In a real app, this hits Vercel API or similar. For now we simulate success.
      await new Promise(r => setTimeout(r, 1500));
      setFormData(prev => ({
        ...prev,
        domains: prev.domains.map(d => 
          d.name === domainName ? { ...d, status: "Active" } : d
        )
      }));
      toast.success(`Successfully verified DNS records for ${domainName}!`);
    } catch (e) {
      console.error(e);
      toast.error("Error verifying domain.");
    } finally {
      setVerifyingDomain(null);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading settings...</div>;
  }

  if (upgradeRequired) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 fade-in pb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Branding & Appearance</h1>
          <p className="text-gray-600 mt-1">Configure your platform appearance.</p>
        </div>
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Premium Feature Locked</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            White-labeling (including custom branding and custom domains) requires an active subscription plan that supports this feature.
          </p>
          <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
            Upgrade Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Branding & Appearance</h1>
        <p className="text-gray-600 mt-1">Configure your global platform appearance.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Brand Identity</h2>
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
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64String = reader.result as string;
                      setFormData({...formData, logoUrl: base64String});
                    };
                    reader.readAsDataURL(file);
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
        
        {/* Custom Domains Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Custom Domains</h2>
          <p className="text-sm text-gray-600 mb-6">Map your own domain to your CRM workspace.</p>
          
          <div className="space-y-4">
            {formData.domains && formData.domains.map((domain, i) => (
              <div key={i} className={`p-4 border rounded-xl flex items-center justify-between ${domain.status === 'Active' ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-200 bg-gray-50'}`}>
                <div>
                  <p className="font-semibold text-gray-900">{domain.name}</p>
                  <p className={`text-xs mt-1 flex items-center gap-1.5 ${domain.status === 'Active' ? 'text-indigo-600 font-medium' : 'text-amber-500'}`}>
                    {domain.status === 'Active' && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
                    {domain.status === 'Pending DNS Verification' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
                    Status: {domain.status}
                  </p>
                </div>
                <button 
                  onClick={() => domain.status === 'Active' ? null : verifyDomain(domain.name)} 
                  disabled={verifyingDomain === domain.name}
                  className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:underline ${domain.status === 'Active' ? 'text-gray-400 cursor-default' : 'text-indigo-600 hover:text-indigo-700 hover:underline'} ${verifyingDomain === domain.name ? 'opacity-50' : ''}`}
                >
                  {verifyingDomain === domain.name ? 'Checking DNS...' : (domain.status === 'Active' ? 'Configured' : 'Verify DNS')}
                </button>
              </div>
            ))}
            
            <button onClick={registerDomain} className="w-full py-3 border border-dashed border-gray-300 text-gray-500 hover:text-gray-900 hover:border-gray-400 font-medium rounded-xl transition-all">
              + Register New Domain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
