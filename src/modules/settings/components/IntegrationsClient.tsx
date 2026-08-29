"use client";

import React, { useState, useEffect } from "react";

export default function IntegrationsClient() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [justGeneratedKey, setJustGeneratedKey] = useState<{name: string, key: string} | null>(null);
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioToken, setTwilioToken] = useState("");
  const [twilioFrom, setTwilioFrom] = useState("");
  const [resendKey, setResendKey] = useState("");
  const [emailFrom, setEmailFrom] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const [metaAccessToken, setMetaAccessToken] = useState("");
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState("");
  const [metaBusinessAccountId, setMetaBusinessAccountId] = useState("");
  const [metaWebhookToken, setMetaWebhookToken] = useState("");
  const [isSavingMeta, setIsSavingMeta] = useState(false);

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

  const fetchIntegrations = async () => {
    try {
      const res = await fetch("/api/integrations/twilio");
      const data = await res.json();
      if (res.ok && data.config) {
        setTwilioSid(data.config.accountSid || "");
        setTwilioToken(data.config.authToken || "");
        setTwilioFrom(data.config.fromNumber || "");
      }
    } catch (e) {}

    try {
      const res = await fetch("/api/whatsapp/config");
      const data = await res.json();
      if (res.ok && data.config) {
        setMetaAccessToken(data.config.accessToken || "");
        setMetaPhoneNumberId(data.config.phoneNumberId || "");
        setMetaBusinessAccountId(data.config.businessAccountId || "");
        setMetaWebhookToken(data.config.webhookVerifyToken || "");
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchApiKeys();
    fetchIntegrations();
    
    // Fetch Email Config
    fetch("/api/settings/email_config").then(res => res.json()).then(data => {
      if (data.value) {
        setResendKey(data.value.resendApiKey || "");
        setEmailFrom(data.value.fromEmail || "");
      }
    }).catch(e => console.error(e));
  }, []);

  const [isSavingTwilio, setIsSavingTwilio] = useState(false);

  const saveTwilio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTwilio(true);
    try {
      const res = await fetch("/api/integrations/twilio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountSid: twilioSid, authToken: twilioToken, fromNumber: twilioFrom })
      });
      if (!res.ok) throw new Error("Failed to save Twilio settings");
      alert("Twilio settings saved successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingTwilio(false);
    }
  };

  const saveMetaWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMeta(true);
    try {
      const res = await fetch("/api/whatsapp/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: metaAccessToken,
          phoneNumberId: metaPhoneNumberId,
          businessAccountId: metaBusinessAccountId,
          webhookVerifyToken: metaWebhookToken
        })
      });
      if (!res.ok) throw new Error("Failed to save Meta WhatsApp settings");
      alert("Meta WhatsApp settings saved successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingMeta(false);
    }
  };

  const saveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmail(true);
    try {
      const res = await fetch("/api/settings/twilio_config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: 'email_config', value: { resendApiKey: resendKey, fromEmail: emailFrom } })
      });
      if (!res.ok) throw new Error("Failed to save Email settings");
      alert("Email settings saved successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingEmail(false);
    }
  };

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
    return <div className="p-8 text-center text-muted-foreground">Loading API Keys...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">API & Integrations</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Manage your API keys to securely connect your CRM tenant to external websites and applications.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {justGeneratedKey && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 p-2 rounded-full text-primary">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-foreground font-bold text-lg mb-1">New API Key Generated!</h3>
              <p className="text-foreground/80 text-sm mb-4">
                Please copy this key immediately. For security reasons, <span className="font-semibold text-destructive">you will not be able to see it again.</span>
              </p>
              
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background border border-border px-4 py-3 rounded-xl text-foreground font-mono text-sm break-all shadow-inner">
                  {justGeneratedKey.key}
                </code>
                <button 
                  onClick={() => copyToClipboard(justGeneratedKey.key)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Copy Key
                </button>
              </div>
              
              <button 
                onClick={() => setJustGeneratedKey(null)}
                className="mt-4 text-primary hover:text-primary/80 hover:underline text-sm font-medium transition-colors focus-visible:outline-none focus-visible:underline"
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
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Create New Key</h2>
            <form onSubmit={generateKey} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Key Name</label>
                <input 
                  type="text" 
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  placeholder="e.g., Marketing Website"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground text-sm"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={!newKeyName.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Generate API Key
              </button>
            </form>
          </div>
          
          <div className="bg-muted/30 rounded-3xl p-6 border border-border">
            <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Website Embed Code
            </h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Use this code snippet to embed a Lead Capture form directly into your external website.
            </p>
            <div className="relative group">
              <pre className="bg-card text-foreground p-4 rounded-2xl text-xs overflow-x-auto font-mono shadow-inner leading-relaxed border border-border">
{`<!-- CRM Lead Capture Form -->
<script 
  src="https://yourcrm.com/embed.js" 
  data-key="YOUR_API_KEY"
></script>
<div id="crm-form-container"></div>`}
              </pre>
            </div>
          </div>

          {/* Twilio Integration */}
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.03 1 4.38L1.6 22l5.72-1.5c1.32.6 2.78.94 4.31.94 5.52 0 10-4.48 10-10S17.52 2 12 2zm0 17.55c-1.35 0-2.65-.34-3.83-.98l-.27-.15-2.85.75.76-2.77-.17-.28a8.55 8.55 0 01-1.19-4.34c0-4.72 3.84-8.56 8.55-8.56 4.72 0 8.56 3.84 8.56 8.56s-3.84 8.56-8.56 8.56zm4.7-6.42c-.26-.13-1.53-.75-1.77-.84-.24-.09-.42-.13-.59.13-.18.26-.67.84-.82 1.01-.15.18-.3.2-.56.07-1.76-.88-2.9-2.18-3.7-4-.13-.26.07-.25.32-.75.09-.18.04-.34-.02-.47-.07-.13-.59-1.42-.81-1.95-.21-.5-.43-.44-.59-.45-.15 0-.32-.01-.5-.01-.17 0-.46.06-.7.32-.24.26-.92.9-.92 2.19 0 1.29.94 2.54 1.07 2.71.13.18 1.85 2.82 4.48 3.95 2.19.95 2.71.79 3.2.75.49-.04 1.53-.62 1.75-1.22.21-.59.21-1.1.15-1.22-.06-.11-.23-.18-.49-.31z"/>
              </svg>
              Twilio SMS & WhatsApp
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Configure Twilio to send automated SMS and WhatsApp messages from CRM workflows.</p>
            <form onSubmit={saveTwilio} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Account SID</label>
                <input type="text" value={twilioSid} onChange={e => setTwilioSid(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Auth Token</label>
                <input type="password" value={twilioToken} onChange={e => setTwilioToken(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Sender Phone Number</label>
                <input type="text" placeholder="+1234567890" value={twilioFrom} onChange={e => setTwilioFrom(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background" required />
              </div>
              <button type="submit" disabled={isSavingTwilio} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {isSavingTwilio ? "Saving..." : "Save Configuration"}
              </button>
            </form>
          </div>

          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.01 2.01c-5.51 0-9.98 4.47-9.98 9.98 0 1.77.46 3.44 1.28 4.9L2 22l5.24-1.28c1.42.78 3.03 1.22 4.77 1.22 5.51 0 9.98-4.47 9.98-9.98s-4.47-9.98-9.98-9.98zm5.55 14.28c-.24.68-1.39 1.27-1.92 1.33-.53.07-1.21.13-3.64-1.28-2.9-1.68-4.75-4.66-4.9-4.86-.14-.2-.17-.23-1.18-1.57-.14-.19-.48-.65-.48-1.24s.31-1.16.43-1.29c.12-.13.26-.17.34-.17s.17 0 .25.01c.08.01.2 0 .31.27.12.28.41 1.01.45 1.09.04.09.06.19.01.31-.05.11-.08.19-.16.28-.08.09-.17.21-.24.28-.08.09-.18.17-.08.35.1.18.45.74.95 1.19.65.58 1.2 1.76 1.39 2.08.18.32.2.45.1.66-.09.2-.42.49-.57.66-.14.17-.3.37-.11.69.19.32.85 1.39 1.83 2.25 1.26 1.11 2.3 1.44 2.63 1.58.33.15.53.12.72-.09.2-.21.84-1 .11 1z"/>
              </svg>
              Meta WhatsApp API
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Configure the official Meta Cloud API to power your WhatsApp CRM and automated messaging.</p>
            <form onSubmit={saveMetaWhatsApp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Access Token</label>
                <input type="password" value={metaAccessToken} onChange={e => setMetaAccessToken(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background" placeholder="EA..." required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Phone Number ID</label>
                <input type="text" value={metaPhoneNumberId} onChange={e => setMetaPhoneNumberId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Business Account ID (Optional)</label>
                <input type="text" value={metaBusinessAccountId} onChange={e => setMetaBusinessAccountId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Webhook Verify Token</label>
                <input type="text" value={metaWebhookToken} onChange={e => setMetaWebhookToken(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background" placeholder="my_secure_token_123" />
                <p className="text-xs text-muted-foreground mt-1.5">Use this exact token when setting up Webhooks in your Meta App Dashboard.</p>
              </div>
              <button type="submit" disabled={isSavingMeta} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
                {isSavingMeta ? "Saving..." : "Save Meta Configuration"}
              </button>
            </form>
          </div>

          {/* Email Integration */}
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Email Marketing (Resend)
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Configure your Resend API Key to launch bulk email campaigns directly from your tenant dashboard.</p>
            <form onSubmit={saveEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Resend API Key</label>
                <input type="password" value={resendKey} onChange={e => setResendKey(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background" placeholder="re_123456789" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Sender Email Address</label>
                <input type="email" placeholder="sales@yourdomain.com" value={emailFrom} onChange={e => setEmailFrom(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background" required />
              </div>
              <button type="submit" disabled={isSavingEmail} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                {isSavingEmail ? "Saving..." : "Save Configuration"}
              </button>
            </form>
          </div>
        </div>

        {/* Third Row (or Column extension): Google Calendar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              Google Workspace
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Connect your Google Account to sync appointments with your CRM Calendar automatically.</p>
            <a href="/api/integrations/google/auth" className="w-full inline-block text-center bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-semibold py-2.5 rounded-xl transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-200">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Connect Google Calendar
              </span>
            </a>
          </div>
        </div>

        {/* Right Col: Key List */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border h-full">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center justify-between">
              Active API Keys
              <span className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-full font-medium">
                {apiKeys.length} Total
              </span>
            </h2>
            
            {apiKeys.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-border">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-foreground font-semibold mb-1">No API keys yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Generate an API key to securely connect your CRM to external services.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/50 hover:shadow-sm transition-all gap-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary mt-1">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          {key.name}
                          {key.isActive ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-muted"></span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded font-mono">
                            {key.maskedKey}
                          </code>
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(key.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => revokeKey(key._id)}
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
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
