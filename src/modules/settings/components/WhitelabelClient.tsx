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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isPlatformOwner, setIsPlatformOwner] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData?.user?.hierarchyLevel === 1) {
            setIsPlatformOwner(true);
          }
        }

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

    fetchSettings();
  }, []);


  async function saveBranding() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/whitelabel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global: isPlatformOwner, // Platform owner saves globally, tenants save specifically for their company
          value: { platformName, primaryColor, logoUrl, domains }
        })
      });
      if (res.ok) {
        alert("Branding saved successfully!");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save branding");
    } finally {
      setSaving(false);
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
          global: isPlatformOwner, 
          value: { platformName, primaryColor, logoUrl, domains: newDomains }
        })
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function verifyDomain(domainName: string) {
    setVerifyingDomain(domainName);
    try {
      const res = await fetch("/api/settings/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainName })
      });
      const data = await res.json();
      
      if (res.ok && data.status === "Active") {
        const updatedDomains = domains.map(d => 
          d.name === domainName ? { ...d, status: "Active" } : d
        );
        setDomains(updatedDomains);
        
        // Save the updated status to DB
        await fetch("/api/settings/whitelabel", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            global: isPlatformOwner, 
            value: { platformName, primaryColor, logoUrl, domains: updatedDomains }
          })
        });
        alert(`Successfully verified DNS records for ${domainName}!`);
      } else {
        alert(data.error || "Failed to verify domain.");
      }
    } catch (e) {
      console.error(e);
      alert("Error verifying domain.");
    } finally {
      setVerifyingDomain(null);
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <div className="space-y-6 md:space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">White-Label Management</h1>
        <p className="text-muted-foreground mt-1">Configure {isPlatformOwner ? 'global platform' : 'your tenant'} branding, custom domains, and visual identities.</p>
        {!isPlatformOwner && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary">
            <strong>Tenant Mode:</strong> Your branding configurations here will securely override the platform's default branding across all your customer-facing portals.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-foreground mb-6">{isPlatformOwner ? 'Global Brand Identity' : 'Your Brand Identity'}</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Platform Name</label>
              <input 
                type="text" 
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Logo Image (Upload)</label>
              <div className="flex flex-col gap-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/png, image/jpeg, image/svg+xml"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                />
                
                {logoUrl && (
                  <div className="mt-2 p-4 bg-background rounded-xl border border-border inline-flex flex-col items-start gap-3">
                    <img src={logoUrl} alt="Logo Preview" className="max-h-16 object-contain" />
                    <button 
                      type="button" 
                      onClick={() => setLogoUrl("")}
                      className="text-xs text-destructive hover:text-destructive/80 font-medium px-3 py-1 bg-destructive/10 hover:bg-destructive/20 rounded-full transition-colors"
                    >
                      Remove Logo
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Primary Theme Color</label>
              <div className="flex flex-wrap gap-4 items-center">
                {[
                  { name: "Indigo", value: "#4f46e5" },
                  { name: "Blue", value: "#2563eb" },
                  { name: "Rose", value: "#e11d48" },
                  { name: "Violet", value: "#7c3aed" },
                  { name: "Emerald", value: "#059669" },
                  { name: "Orange", value: "#ea580c" },
                  { name: "Slate", value: "#475569" },
                ].map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setPrimaryColor(c.value)}
                    className={`w-10 h-10 rounded-full transition-all ${primaryColor === c.value ? 'ring-4 ring-offset-2 ring-border shadow-lg scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
                <div className="h-8 w-px bg-border mx-2"></div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    title="Custom Color"
                  />
                  <span className="text-sm font-medium text-muted-foreground uppercase">{primaryColor}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-end">
              <button 
                onClick={saveBranding}
                disabled={saving || uploading}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center justify-center gap-2"
              >
                {saving && (
                  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {saving ? 'Saving...' : 'Save Branding Settings'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-4 md:p-6 shadow-xl">
          <h2 className="text-xl font-bold text-foreground mb-6">Custom Domains</h2>
          <p className="text-sm text-muted-foreground mb-6">Allow tenant companies to map their own domains to your application.</p>
          
          <div className="space-y-4">
            {domains.map((domain, i) => (
              <div key={i} className={`p-4 border rounded-xl flex items-center justify-between ${domain.status === 'Active' ? 'border-primary/30 bg-primary/5' : 'border-border bg-background'}`}>
                <div>
                  <p className="font-semibold text-foreground">{domain.name}</p>
                  <p className={`text-xs mt-1 flex items-center gap-1.5 ${domain.status === 'Active' ? 'text-primary font-medium' : 'text-amber-500'}`}>
                    {domain.status === 'Active' && <span className="w-2 h-2 rounded-full bg-primary"></span>}
                    {domain.status === 'Pending DNS Verification' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
                    Status: {domain.status}
                  </p>
                </div>
                <button 
                  onClick={() => domain.status === 'Active' ? null : verifyDomain(domain.name)} 
                  disabled={verifyingDomain === domain.name}
                  className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:underline ${domain.status === 'Active' ? 'text-muted-foreground/50 cursor-default' : 'text-primary hover:text-primary/80 hover:underline'} ${verifyingDomain === domain.name ? 'opacity-50' : ''}`}
                >
                  {verifyingDomain === domain.name ? 'Checking DNS...' : (domain.status === 'Active' ? 'Configured' : 'Verify DNS')}
                </button>
              </div>
            ))}
            
            <button onClick={registerDomain} className="w-full py-3 border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground font-medium rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              + Register New Domain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
