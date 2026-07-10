"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function WhitelabelClient() {
  const [platformName, setPlatformName] = useState("CRM OS");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [logoUrl, setLogoUrl] = useState("");
  const [domains, setDomains] = useState<any[]>([
    { name: "app.acmecorp.com", status: "Active" },
    { name: "portal.globex.io", status: "Pending DNS Verification" }
  ]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings/whitelabel");
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          if (data.value.platformName) setPlatformName(data.value.platformName);
          if (data.value.primaryColor) setPrimaryColor(data.value.primaryColor);
          if (data.value.logoUrl) setLogoUrl(data.value.logoUrl);
          if (data.value.domains) setDomains(data.value.domains);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveBranding() {
    try {
      const res = await fetch("/api/settings/whitelabel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global: true, // Assuming this user is a super admin
          value: { platformName, primaryColor, logoUrl, domains }
        })
      });
      if (res.ok) {
        alert("Branding saved successfully!");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save branding");
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/settings/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setLogoUrl(data.url);
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function registerDomain() {
    const domain = prompt("Enter new custom domain (e.g. crm.yourcompany.com):");
    if (!domain) return;
    
    const newDomains = [...domains, { name: domain, status: "Pending DNS Verification" }];
    setDomains(newDomains);

    try {
      await fetch("/api/settings/whitelabel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global: false, // domains are usually tenant-specific
          value: { platformName, primaryColor, logoUrl, domains: newDomains }
        })
      });
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">White-Label Management</h1>
        <p className="text-gray-600 mt-1">Configure global branding, custom domains, and visual identities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Global Branding</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
              <input 
                type="text" 
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color (Hex)</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                />
                <div className="w-12 h-12 rounded-xl shrink-0 border border-gray-300" style={{ backgroundColor: primaryColor }}></div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo Upload</label>
              
              <div className="flex flex-col gap-4">
                {logoUrl && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-center">
                    <img src={logoUrl} alt="Logo Preview" className="max-h-24 object-contain" />
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/png, image/jpeg, image/svg+xml"
                  className="hidden" 
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-500 transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <svg className="w-8 h-8 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Click to upload or drag and drop SVG/PNG'}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={saveBranding} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20">
              Save Branding Options
            </button>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Custom Domains</h2>
          <p className="text-sm text-gray-600 mb-6">Allow tenant companies to map their own domains to your application.</p>
          
          <div className="space-y-4">
            {domains.map((domain, i) => (
              <div key={i} className={`p-4 border rounded-xl flex items-center justify-between ${domain.status === 'Active' ? 'border-blue-500/30 bg-blue-500/5' : 'border-gray-200 bg-gray-50'}`}>
                <div>
                  <p className="font-semibold text-gray-900">{domain.name}</p>
                  <p className={`text-xs mt-1 ${domain.status === 'Active' ? 'text-blue-400' : 'text-amber-500'}`}>Status: {domain.status}</p>
                </div>
                <button onClick={() => alert("Verification check simulated.")} className="text-sm text-gray-600 hover:text-gray-900">
                  {domain.status === 'Active' ? 'Configure' : 'Verify'}
                </button>
              </div>
            ))}
            
            <button onClick={registerDomain} className="w-full py-3 border border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-500 font-medium rounded-xl transition-all">
              + Register New Domain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
