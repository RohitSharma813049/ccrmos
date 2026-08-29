"use client";

import { useState, useEffect } from "react";

export default function SecurityClient() {
  const [require2FA, setRequire2FA] = useState(false);
  const [strictSession, setStrictSession] = useState(false);
  const [passwordRegex, setPasswordRegex] = useState("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$");
  const [rateLimit, setRateLimit] = useState(1000);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<{name: string, key: string} | null>(null);
  const [newlyGeneratedWebhook, setNewlyGeneratedWebhook] = useState<{name: string, secret: string} | null>(null);

  async function fetchSettings() {
    try {
      const [settingsRes, apiKeysRes, webhooksRes] = await Promise.all([
        fetch("/api/settings/security"),
        fetch("/api/settings/api-keys"),
        fetch("/api/settings/webhooks")
      ]);
      
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.value) {
          if (data.value.require2FA !== undefined) setRequire2FA(data.value.require2FA);
          if (data.value.strictSession !== undefined) setStrictSession(data.value.strictSession);
          if (data.value.passwordRegex) setPasswordRegex(data.value.passwordRegex);
          if (data.value.rateLimit) setRateLimit(data.value.rateLimit);
        }
      }

      if (apiKeysRes.ok) {
        const keysData = await apiKeysRes.json();
        if (keysData.keys) setApiKeys(keysData.keys);
      }
      
      if (webhooksRes.ok) {
        const whData = await webhooksRes.json();
        if (whData.webhooks) setWebhooks(whData.webhooks);
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
      await fetch("/api/settings/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global: true,
          value: { 
            require2FA, strictSession, passwordRegex, rateLimit, 
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

  const generateApiKey = async () => {
    const name = prompt("Enter a name for the new API Key:");
    if (!name) return;
    
    try {
      const res = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.apiKey) {
          setNewlyGeneratedKey({ name: data.apiKey.name, key: data.apiKey.key });
          fetchSettings(); // Refresh list to show masked version
        }
      } else {
        alert("Failed to generate API Key");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const revokeKey = async (id: string) => {
    if (!confirm("Revoke this key? It will immediately stop working.")) return;
    
    try {
      const res = await fetch(`/api/settings/api-keys?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchSettings();
      } else {
        alert("Failed to revoke API Key");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addWebhook = async () => {
    const name = prompt("Enter a name for the Webhook (e.g. Zapier Integration):");
    if (!name) return;
    const endpointUrl = prompt("Enter the endpoint URL to receive POST events:");
    if (!endpointUrl) return;
    
    try {
      const res = await fetch("/api/settings/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, endpointUrl, events: ["*"] })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.webhook) {
          setNewlyGeneratedWebhook({ name: data.webhook.name, secret: data.webhook.secret });
          fetchSettings();
        }
      } else {
        alert("Failed to add Webhook");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteWebhook = async (id: string) => {
    const confirmation = window.prompt("Are you sure you want to permanently delete this webhook?\n\nType DELETE to confirm:");
    if (confirmation !== "DELETE") return;
    
    try {
      const res = await fetch(`/api/settings/webhooks?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchSettings();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleWebhookStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/settings/webhooks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });
      if (res.ok) fetchSettings();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading settings...</div>;

  return (
    <div className="space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Security & API Management</h1>
        <p className="text-muted-foreground mt-1">Enforce global security policies and manage tenant API access limits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-foreground mb-6">Security Policies</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
              <div>
                <p className="font-semibold text-foreground">Require 2FA Globally</p>
                <p className="text-xs text-muted-foreground mt-1">Force all users across all tenants to use 2FA.</p>
              </div>
              <button onClick={toggle2FA} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${require2FA ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${require2FA ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
              <div>
                <p className="font-semibold text-foreground">Strict Session Timeout</p>
                <p className="text-xs text-muted-foreground mt-1">Automatically log users out after 15 minutes of inactivity.</p>
              </div>
              <button onClick={toggleSession} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${strictSession ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${strictSession ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password Complexity Regex</label>
              <input 
                type="text" 
                value={passwordRegex}
                onChange={(e) => setPasswordRegex(e.target.value)}
                onBlur={handleRegexBlur}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground font-mono text-xs focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
              />
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">API Management</h2>
            <button onClick={generateApiKey} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              + Generate Key
            </button>
          </div>
          <div className="space-y-5">
             <div>
              <label className="block text-sm font-medium text-foreground mb-2">Global Rate Limit (Req/min)</label>
              <input 
                type="number" 
                value={rateLimit}
                onChange={(e) => setRateLimit(Number(e.target.value))}
                onBlur={handleRateLimitBlur}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
              />
            </div>
            <div className="pt-2">
               <h3 className="text-sm font-semibold text-foreground mb-3">API Keys Created by Tenants</h3>
               <div className="space-y-2">
                 {apiKeys.map(key => (
                   <div key={key._id} className="p-3 border border-border bg-background rounded-lg flex justify-between items-center group shadow-sm hover:shadow-md transition-shadow">
                     <div>
                       <span className="text-sm font-medium text-foreground block">{key.name}</span>
                       <span className="text-xs text-muted-foreground font-mono block mt-1">{key.maskedKey}</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">Active</span>
                       <button onClick={() => revokeKey(key._id)} className="text-destructive text-xs opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:underline hover:underline">Revoke</button>
                     </div>
                   </div>
                 ))}
                 {apiKeys.length === 0 && <p className="text-sm text-muted-foreground">No active API keys.</p>}
               </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-10 mb-6">
            <h2 className="text-xl font-bold text-foreground">Webhooks</h2>
            <button onClick={addWebhook} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              + Add Webhook
            </button>
          </div>
          <div className="space-y-2">
            {webhooks.map(wh => (
              <div key={wh._id} className="p-4 border border-border bg-background rounded-xl flex justify-between items-start group shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">{wh.name}</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${wh.isActive ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                      {wh.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono block mt-1 truncate">{wh.endpointUrl}</span>
                  <span className="text-xs text-primary/80 font-medium block mt-1 truncate">Events: {wh.events.join(", ")}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleWebhookStatus(wh._id, wh.isActive)} className="text-primary hover:text-primary/80 hover:underline text-xs font-medium focus-visible:outline-none focus-visible:underline">
                      {wh.isActive ? "Pause" : "Resume"}
                    </button>
                    <button onClick={() => deleteWebhook(wh._id)} className="text-destructive hover:text-destructive/80 hover:underline text-xs font-medium focus-visible:outline-none focus-visible:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {webhooks.length === 0 && <p className="text-sm text-muted-foreground bg-muted/30 border border-dashed border-border p-4 rounded-xl text-center">No active webhooks. Add one to listen to real-time events.</p>}
          </div>
        </div>
      </div>

      {newlyGeneratedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="key-modal-title">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setNewlyGeneratedKey(null)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 id="key-modal-title" className="text-xl font-bold text-foreground">API Key Generated</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Please copy this key immediately. For security reasons, it will never be shown again.
              </p>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">{newlyGeneratedKey.name}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    readOnly
                    value={newlyGeneratedKey.key}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm pr-20" 
                  />
                  <button 
                    onClick={() => navigator.clipboard.writeText(newlyGeneratedKey.key).then(() => alert("Copied to clipboard!"))}
                    className="absolute right-2 top-2 bottom-2 px-3 bg-muted border border-border hover:bg-muted/80 text-foreground text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setNewlyGeneratedKey(null)} 
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  I have copied it safely
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {newlyGeneratedWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="webhook-modal-title">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setNewlyGeneratedWebhook(null)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 id="webhook-modal-title" className="text-xl font-bold text-foreground">Webhook Created!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your webhook is now live. Please copy the <strong>Signing Secret</strong> below. You will use this to verify that incoming POST requests are actually coming from our platform.
              </p>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">Signing Secret for: {newlyGeneratedWebhook.name}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    readOnly
                    value={newlyGeneratedWebhook.secret}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm pr-20" 
                  />
                  <button 
                    onClick={() => navigator.clipboard.writeText(newlyGeneratedWebhook.secret).then(() => alert("Copied to clipboard!"))}
                    className="absolute right-2 top-2 bottom-2 px-3 bg-muted border border-border hover:bg-muted/80 text-foreground text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setNewlyGeneratedWebhook(null)} 
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  I have copied the secret safely
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
