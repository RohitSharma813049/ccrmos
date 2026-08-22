"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { Key, Webhook, CheckCircle2, Copy, Plus, Trash2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

export default function IntegrationsHub() {
  const { data: session } = useSession();
  const isPlatformOwner = (session?.user as any)?.hierarchyLevel === 1;

  const [activeTab, setActiveTab] = useState<"apikeys" | "webhooks" | "app" | "platform">("apikeys");

  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loadingWebhooks, setLoadingWebhooks] = useState(true);

  // Platform Config state
  const [platformLoading, setPlatformLoading] = useState(false);
  const [platformSaving, setPlatformSaving] = useState(false);
  const [twilioConfig, setTwilioConfig] = useState({ accountSid: "", authToken: "", twimlAppSid: "", apiKeySid: "", apiKeySecret: "" });
  const [stripeConfig, setStripeConfig] = useState({ publishableKey: "", secretKey: "", webhookSecret: "" });
  const [metaConfig, setMetaConfig] = useState({ accessToken: "", phoneNumberId: "", businessAccountId: "", webhookVerifyToken: "" });
  
  // Tenant App Config state
  const [tenantTwilio, setTenantTwilio] = useState({ accountSid: "", authToken: "", fromNumber: "" });
  const [tenantEmail, setTenantEmail] = useState({ resendApiKey: "", fromEmail: "" });
  const [isSavingTwilio, setIsSavingTwilio] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  
  useEffect(() => {
    // Simulate fetching API keys
    setTimeout(() => {
      setApiKeys([
        { _id: "1", name: "Zapier Integration", key: "crm_live_8f9d2...3b1a", createdAt: new Date(Date.now() - 864000000).toISOString(), lastUsedAt: new Date().toISOString() },
        { _id: "2", name: "Make.com Sync", key: "crm_live_9x8e1...4c2z", createdAt: new Date(Date.now() - 1504000000).toISOString(), lastUsedAt: null }
      ]);
      setLoadingKeys(false);
    }, 500);

    fetchTenantConfig();
    fetchWebhooks();

    if (isPlatformOwner) {
      fetchPlatformConfig();
    }
  }, [isPlatformOwner]);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/settings/webhooks");
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWebhooks(false);
    }
  };

  const fetchTenantConfig = async () => {
    try {
      const resTwilio = await fetch("/api/settings/twilio_config");
      if (resTwilio.ok) {
        const data = await resTwilio.json();
        if (data.value) setTenantTwilio({ accountSid: data.value.accountSid || "", authToken: data.value.authToken || "", fromNumber: data.value.fromNumber || "" });
      }
      
      const resEmail = await fetch("/api/settings/email_config");
      if (resEmail.ok) {
        const data = await resEmail.json();
        if (data.value) setTenantEmail({ resendApiKey: data.value.resendApiKey || "", fromEmail: data.value.fromEmail || "" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPlatformConfig = async () => {
    setPlatformLoading(true);
    try {
      const res = await fetch("/api/settings/platform");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setTwilioConfig(data.config.twilio_config || { accountSid: "", authToken: "", twimlAppSid: "", apiKeySid: "", apiKeySecret: "" });
          setStripeConfig(data.config.stripe_config || { publishableKey: "", secretKey: "", webhookSecret: "" });
          setMetaConfig(data.config.meta_config || { accessToken: "", phoneNumberId: "", businessAccountId: "", webhookVerifyToken: "" });
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load platform configuration");
    } finally {
      setPlatformLoading(false);
    }
  };

  const savePlatformConfig = async () => {
    setPlatformSaving(true);
    try {
      const res = await fetch("/api/settings/platform", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twilio_config: twilioConfig,
          stripe_config: stripeConfig,
          meta_config: metaConfig
        })
      });
      if (res.ok) {
        toast.success("Platform credentials securely saved!");
      } else {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setPlatformSaving(false);
    }
  };

  const saveTenantTwilio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTwilio(true);
    try {
      const res = await fetch("/api/settings/twilio_config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: tenantTwilio })
      });
      if (!res.ok) throw new Error("Failed to save Twilio settings");
      toast.success("Twilio settings saved successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingTwilio(false);
    }
  };

  const saveTenantEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmail(true);
    try {
      const res = await fetch("/api/settings/email_config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: tenantEmail })
      });
      if (!res.ok) throw new Error("Failed to save Email settings");
      toast.success("Email settings saved successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleCreateKey = () => {
    const name = prompt("Enter a name for the new API Key (e.g. 'Stripe Webhook'):");
    if (!name) return;
    
    // Simulate creation
    const newKey = {
      _id: Date.now().toString(),
      name,
      key: `crm_live_${Math.random().toString(36).substring(2, 15)}...${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString(),
      lastUsedAt: null
    };
    setApiKeys([newKey, ...apiKeys]);
    toast.success(`API Key '${name}' created!`);
  };

  const handleDeleteKey = (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Any integration using it will immediately break.")) return;
    setApiKeys(apiKeys.filter(k => k._id !== id));
    toast.success("API Key revoked");
  };

  const handleCreateWebhook = async () => {
    const name = prompt("Enter a name for the Webhook (e.g. 'Zapier Catch Hook'):");
    if (!name) return;
    const endpointUrl = prompt("Enter the Endpoint URL:");
    if (!endpointUrl) return;

    try {
      const res = await fetch("/api/settings/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, endpointUrl, events: ["*"] })
      });
      if (!res.ok) throw new Error("Failed to create webhook");
      const data = await res.json();
      setWebhooks([data.webhook, ...webhooks]);
      alert(`Webhook created! Your secret is: \n\n${data.webhook.secret}\n\nPlease save this secret now as it will not be shown again.`);
      toast.success("Webhook created!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;
    try {
      const res = await fetch(`/api/settings/webhooks?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete webhook");
      setWebhooks(webhooks.filter(w => w._id !== id));
      toast.success("Webhook deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-6xl mx-auto">
      <PageHeader 
        title="Developer Integrations" 
        description="Manage API Keys and Webhooks to connect CRM OS with external applications like Zapier, Make, and Slack."
      />

      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6 overflow-x-auto">
        <button 
          className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'apikeys' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          onClick={() => setActiveTab('apikeys')}
        >
          <Key size={16} /> API Keys
        </button>
        <button 
          className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'webhooks' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          onClick={() => setActiveTab('webhooks')}
        >
          <Webhook size={16} /> Webhooks
        </button>
        <button 
          className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'app' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          onClick={() => setActiveTab('app')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          App Integrations
        </button>
        
        {isPlatformOwner && (
          <button 
            className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'platform' ? 'border-red-500 text-red-500' : 'border-transparent text-red-400/70 hover:text-red-500'}`}
            onClick={() => setActiveTab('platform')}
          >
            <ShieldAlert size={16} /> Platform Config (Owner Only)
          </button>
        )}
      </div>

      {activeTab === 'apikeys' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Secret API Keys</h3>
                <p className="text-sm text-zinc-500">Do not share your API keys in publicly accessible areas such as GitHub, client-side code, and so forth.</p>
              </div>
              <Button onClick={handleCreateKey} className="gap-2 shrink-0"><Plus size={16}/> Create new secret key</Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Secret Key</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium">Last Used</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loadingKeys ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Loading keys...</td></tr>
                  ) : apiKeys.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No API keys generated yet.</td></tr>
                  ) : (
                    apiKeys.map(key => (
                      <tr key={key._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{key.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <code className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-xs">
                              {key.key}
                            </code>
                            <button onClick={() => copyToClipboard(key.key)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-500">{new Date(key.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-zinc-500">
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteKey(key._id)} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 px-2 py-1.5 rounded transition-colors inline-flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            <Trash2 size={14} /> Revoke
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Webhooks</h3>
                <p className="text-sm text-zinc-500">Subscribe to real-time events and send JSON payloads directly to your external servers.</p>
              </div>
              <Button onClick={handleCreateWebhook} className="gap-2 shrink-0"><Plus size={16}/> Add Webhook</Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Endpoint URL</th>
                    <th className="px-6 py-4 font-medium">Events</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loadingWebhooks ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Loading webhooks...</td></tr>
                  ) : webhooks.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No webhooks configured yet.</td></tr>
                  ) : (
                    webhooks.map(hook => (
                      <tr key={hook._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{hook.name}</td>
                        <td className="px-6 py-4">
                           <span className="text-xs text-zinc-500 max-w-[200px] truncate block" title={hook.endpointUrl}>{hook.endpointUrl}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="bg-zinc-100 dark:bg-zinc-800 text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">{hook.events.join(', ')}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500">{new Date(hook.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteWebhook(hook._id)} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 px-2 py-1.5 rounded transition-colors inline-flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            <Trash2 size={14} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'app' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 grid lg:grid-cols-2 gap-6">
          {/* Twilio Integration */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.03 1 4.38L1.6 22l5.72-1.5c1.32.6 2.78.94 4.31.94 5.52 0 10-4.48 10-10S17.52 2 12 2zm0 17.55c-1.35 0-2.65-.34-3.83-.98l-.27-.15-2.85.75.76-2.77-.17-.28a8.55 8.55 0 01-1.19-4.34c0-4.72 3.84-8.56 8.55-8.56 4.72 0 8.56 3.84 8.56 8.56s-3.84 8.56-8.56 8.56zm4.7-6.42c-.26-.13-1.53-.75-1.77-.84-.24-.09-.42-.13-.59.13-.18.26-.67.84-.82 1.01-.15.18-.3.2-.56.07-1.76-.88-2.9-2.18-3.7-4-.13-.26.07-.25.32-.75.09-.18.04-.34-.02-.47-.07-.13-.59-1.42-.81-1.95-.21-.5-.43-.44-.59-.45-.15 0-.32-.01-.5-.01-.17 0-.46.06-.7.32-.24.26-.92.9-.92 2.19 0 1.29.94 2.54 1.07 2.71.13.18 1.85 2.82 4.48 3.95 2.19.95 2.71.79 3.2.75.49-.04 1.53-.62 1.75-1.22.21-.59.21-1.1.15-1.22-.06-.11-.23-.18-.49-.31z"/>
              </svg>
              Twilio SMS & WhatsApp
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Configure Twilio to send automated SMS and WhatsApp messages.</p>
            <form onSubmit={saveTenantTwilio} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Account SID</label>
                <input type="text" value={tenantTwilio.accountSid} onChange={e => setTenantTwilio({...tenantTwilio, accountSid: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Auth Token</label>
                <input type="password" value={tenantTwilio.authToken} onChange={e => setTenantTwilio({...tenantTwilio, authToken: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Sender Phone Number</label>
                <input type="text" placeholder="+1234567890 (or whatsapp:+1234567890)" value={tenantTwilio.fromNumber} onChange={e => setTenantTwilio({...tenantTwilio, fromNumber: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground" required />
              </div>
              <Button type="submit" disabled={isSavingTwilio} className="w-full">
                {isSavingTwilio ? "Saving..." : "Save Configuration"}
              </Button>
            </form>
          </div>

          {/* Email Integration */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Email Marketing (Resend)
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Configure your Resend API Key to launch bulk email campaigns.</p>
            <form onSubmit={saveTenantEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Resend API Key</label>
                <input type="password" value={tenantEmail.resendApiKey} onChange={e => setTenantEmail({...tenantEmail, resendApiKey: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground" placeholder="re_123456789" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Sender Email Address</label>
                <input type="email" placeholder="sales@yourdomain.com" value={tenantEmail.fromEmail} onChange={e => setTenantEmail({...tenantEmail, fromEmail: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground" required />
              </div>
              <Button type="submit" disabled={isSavingEmail} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                {isSavingEmail ? "Saving..." : "Save Configuration"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {isPlatformOwner && activeTab === 'platform' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-600 dark:text-red-400">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <ShieldAlert size={20} /> Danger Zone: Core Platform Credentials
            </h3>
            <p className="text-sm opacity-90">
              These credentials power the entire platform (Twilio WebRTC, Stripe Payments, Meta WhatsApp). Only the Platform Owner can view or modify these values. Proceed with extreme caution.
            </p>
          </div>

          {platformLoading ? (
            <div className="p-12 text-center text-zinc-500">Loading secure credentials...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Twilio Section */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <h4 className="text-md font-bold mb-4">Twilio Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Account SID</label>
                    <input type="password" value={twilioConfig.accountSid || ""} onChange={(e) => setTwilioConfig({...twilioConfig, accountSid: e.target.value})} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Auth Token</label>
                    <input type="password" value={twilioConfig.authToken || ""} onChange={(e) => setTwilioConfig({...twilioConfig, authToken: e.target.value})} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">TwiML App SID (Voice)</label>
                    <input type="password" value={twilioConfig.twimlAppSid || ""} onChange={(e) => setTwilioConfig({...twilioConfig, twimlAppSid: e.target.value})} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">API Key SID (Optional)</label>
                      <input type="password" value={twilioConfig.apiKeySid || ""} onChange={(e) => setTwilioConfig({...twilioConfig, apiKeySid: e.target.value})} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">API Key Secret (Optional)</label>
                      <input type="password" value={twilioConfig.apiKeySecret || ""} onChange={(e) => setTwilioConfig({...twilioConfig, apiKeySecret: e.target.value})} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stripe Section */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <h4 className="text-md font-bold mb-4">Stripe Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Publishable Key</label>
                    <input type="password" value={stripeConfig.publishableKey || ""} onChange={(e) => setStripeConfig({...stripeConfig, publishableKey: e.target.value})} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Secret Key</label>
                    <input type="password" value={stripeConfig.secretKey || ""} onChange={(e) => setStripeConfig({...stripeConfig, secretKey: e.target.value})} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Webhook Secret</label>
                    <input type="password" value={stripeConfig.webhookSecret || ""} onChange={(e) => setStripeConfig({...stripeConfig, webhookSecret: e.target.value})} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                  </div>
                </div>
              </div>

              {/* Meta (WhatsApp) Section */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm lg:col-span-2">
                <h4 className="text-md font-bold mb-4">Meta (WhatsApp) Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">System User Access Token</label>
                    <input type="password" value={metaConfig.accessToken || ""} onChange={(e) => setMetaConfig({...metaConfig, accessToken: e.target.value})} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Phone Number ID</label>
                    <input type="password" value={metaConfig.phoneNumberId || ""} onChange={(e) => setMetaConfig({...metaConfig, phoneNumberId: e.target.value})} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Business Account ID</label>
                    <input type="password" value={metaConfig.businessAccountId || ""} onChange={(e) => setMetaConfig({...metaConfig, businessAccountId: e.target.value})} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Webhook Verify Token</label>
                    <input type="password" value={metaConfig.webhookVerifyToken || ""} onChange={(e) => setMetaConfig({...metaConfig, webhookVerifyToken: e.target.value})} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                  </div>
                </div>
              </div>

            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button onClick={savePlatformConfig} disabled={platformSaving || platformLoading} className="gap-2">
              <CheckCircle2 size={16} /> {platformSaving ? "Saving..." : "Save Platform Credentials"}
            </Button>
          </div>

        </div>
      )}
    </div>
  );
}
