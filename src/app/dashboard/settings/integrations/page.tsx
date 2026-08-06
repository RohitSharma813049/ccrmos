"use client";

import { useState, useEffect } from "react";
import { usePermissions } from "@/hooks/usePermissions";

export default function IntegrationsPage() {
  const { session } = usePermissions();
  const companyId = session?.user?.companyId || "test-tenant-id";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [setupModalData, setSetupModalData] = useState<any>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects?limit=100");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    async function fetchForms() {
      if (!selectedProject) {
        setForms([]);
        setSelectedForm("");
        return;
      }
      try {
        const res = await fetch(`/api/forms?projectId=${selectedProject}`);
        if (res.ok) {
          const data = await res.json();
          setForms(data.forms || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchForms();
  }, [selectedProject]);

  const projectParam = selectedProject ? `&projectId=${selectedProject}` : "";
  const formParam = selectedForm ? `&formId=${selectedForm}` : "";
  const webhookParams = `?companyId=${companyId}${projectParam}${formParam}`;

  const integrations = [
    {
      id: "meta",
      name: "Meta (Facebook) Lead Ads",
      description: "Receive leads instantly from your Facebook & Instagram campaigns.",
      baseWebhookPath: `/api/webhooks/meta`,
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      color: "blue",
      steps: [
        "Log in to Zapier or Make.com and create a new workflow (Zap/Scenario).",
        "Set the trigger to 'New Lead in Facebook Lead Ads' and connect your Facebook account.",
        "Select your Facebook Page and Lead Form.",
        "Add a 'Webhooks by Zapier' (POST) action and paste your Unique Webhook URL below.",
        "Map the payload to include 'email', 'name', and 'phone'.",
        "Send a test request to verify the lead arrives in your CRM."
      ]
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business API",
      description: "Sync incoming messages and opt-ins as new leads in your CRM.",
      baseWebhookPath: `/api/webhooks/whatsapp`,
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      color: "emerald",
      steps: [
        "Go to your Meta Developer Dashboard and select your WhatsApp Business app.",
        "Navigate to WhatsApp > Configuration.",
        "Edit the Webhook URL and paste your Unique Webhook URL.",
        "Enter any string for the verify token and subscribe to the 'messages' event.",
        "Send a test message from your test number to confirm."
      ]
    },
    {
      id: "whatsapp-web",
      name: "WhatsApp Web (Direct)",
      description: "Scan QR code to automatically pull leads directly from your personal or business WhatsApp.",
      actionLabel: "Connect Device",
      icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z",
      color: "emerald",
      steps: [
        "Click the 'Connect Device' button below.",
        "Wait for the QR code to generate.",
        "Open WhatsApp on your mobile device.",
        "Go to Settings > Linked Devices > Link a Device.",
        "Scan the QR code displayed on your screen.",
        "Once connected, incoming messages from new contacts will automatically create leads."
      ]
    },
    {
      id: "generic",
      name: "Generic Bulk Import API",
      description: "Use this endpoint to POST JSON arrays of leads from Zapier, Make.com, or custom scripts.",
      baseWebhookPath: `/api/webhooks/generic`,
      icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
      color: "purple",
      steps: [
        "Send an HTTP POST request to the Webhook URL provided.",
        "Ensure your Content-Type header is set to 'application/json'.",
        "Send an array of lead objects or a single lead object in the request body.",
        "Ensure fields like 'firstName', 'lastName', 'email', and 'phone' are provided.",
        "Any extra fields will be stored securely in the 'customData' attribute."
      ]
    },
    {
      id: "justdial",
      name: "Justdial (Daily Fetch)",
      description: "Configure your Justdial API keys to automatically fetch leads every night at midnight.",
      actionLabel: "Configure Keys",
      icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
      color: "orange",
      steps: [
        "Contact Justdial support to retrieve your vendor API credentials.",
        "Click the 'Configure Keys' button below to securely store your credentials.",
        "Once configured, the system will run a nightly background job to fetch all leads."
      ]
    },
    {
      id: "email",
      name: "Email (SMTP / API)",
      description: "Configure SMTP credentials (e.g. SendGrid, Amazon SES) to send emails directly from the CRM.",
      actionLabel: "Configure Email",
      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      color: "blue",
      steps: [
        "Sign up for an SMTP provider like SendGrid, Resend, or use your own mail server.",
        "Click the 'Configure Email' button below.",
        "Enter your Host, Port, Username, and Password.",
        "Use the 'Test Connection' button to ensure emails are sending successfully.",
        "Save your configuration to enable outgoing emails across the platform."
      ]
    },
    {
      id: "elevenlabs",
      name: "ElevenLabs AI",
      description: "Configure your ElevenLabs API key for AI sound effect and voice generation.",
      actionLabel: "Configure API Key",
      icon: "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z",
      color: "fuchsia"
    },
    {
      id: "groq",
      name: "Groq (Llama AI)",
      description: "Configure your Groq API key to power conversational AI agents with Llama models.",
      actionLabel: "Configure API Key",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      color: "orange"
    }
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    fuchsia: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200"
  };

  const [integrationLinks, setIntegrationLinks] = useState<any[]>([]);

  const fetchIntegrationLinks = async () => {
    try {
      const res = await fetch("/api/settings/integration-links");
      if (res.ok) {
        const data = await res.json();
        setIntegrationLinks(data.links || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchIntegrationLinks();
  }, []);

  const copyWebhookUrl = async (intId: string, intName: string, url: string, projId?: string, frmId?: string) => {
    navigator.clipboard.writeText(url);
    alert("Webhook URL copied to clipboard!");
    
    try {
      await fetch("/api/settings/integration-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integrationId: intId,
          integrationName: intName,
          projectId: projId,
          formId: frmId,
          url
        })
      });
      fetchIntegrationLinks();
    } catch (e) {
      console.error("Failed to save integration link", e);
    }
  };

  const deleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to remove this webhook from your history?")) return;
    try {
      await fetch(`/api/settings/integration-links?id=${id}`, { method: "DELETE" });
      fetchIntegrationLinks();
    } catch (e) {
      console.error(e);
    }
  };

  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [waStatus, setWaStatus] = useState<any>(null);
  const [waLoading, setWaLoading] = useState(false);

  const [isJdModalOpen, setIsJdModalOpen] = useState(false);
  const [jdConfigs, setJdConfigs] = useState<any[]>([]);
  const [jdSaving, setJdSaving] = useState(false);

  const fetchJdConfigs = async () => {
    try {
      const res = await fetch("/api/settings/justdial_configs");
      const data = await res.json();
      if (data.value && Array.isArray(data.value)) {
        setJdConfigs(data.value);
      } else {
        // Fallback for legacy single key
        const legacyRes = await fetch("/api/settings/justdial_api_key");
        const legacyData = await legacyRes.json();
        if (legacyData.value) {
          setJdConfigs([{ id: Date.now().toString(), apiKey: legacyData.value, scheduleType: "interval", intervalHours: 24, fixedTime: "00:00" }]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isJdModalOpen) fetchJdConfigs();
  }, [isJdModalOpen]);

  const handleJdSave = async () => {
    setJdSaving(true);
    try {
      await fetch("/api/settings/justdial_configs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: jdConfigs })
      });
      setIsJdModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setJdSaving(false);
    }
  };

  const addJdConfig = () => {
    setJdConfigs([...jdConfigs, { id: Date.now().toString(), apiKey: "", scheduleType: "interval", intervalHours: 2, fixedTime: "09:00" }]);
  };

  const updateJdConfig = (id: string, field: string, value: any) => {
    setJdConfigs(jdConfigs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeJdConfig = (id: string) => {
    setJdConfigs(jdConfigs.filter(c => c.id !== id));
  };

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailConfig, setEmailConfig] = useState({ host: "", port: "", username: "", password: "", fromEmail: "" });
  const [emailTestEmail, setEmailTestEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailTesting, setEmailTesting] = useState(false);

  // ElevenLabs
  const [isElevenLabsModalOpen, setIsElevenLabsModalOpen] = useState(false);
  const [elevenLabsConfig, setElevenLabsConfig] = useState("");
  const [elevenLabsSaving, setElevenLabsSaving] = useState(false);

  const fetchElevenLabsConfig = async () => {
    try {
      const res = await fetch("/api/settings/elevenlabs_api_key");
      const data = await res.json();
      if (data.value) setElevenLabsConfig(data.value);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    if (isElevenLabsModalOpen) fetchElevenLabsConfig();
  }, [isElevenLabsModalOpen]);

  const handleElevenLabsSave = async () => {
    setElevenLabsSaving(true);
    try {
      await fetch("/api/settings/elevenlabs_api_key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: elevenLabsConfig })
      });
      setIsElevenLabsModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setElevenLabsSaving(false);
    }
  };

  // Groq
  const [isGroqModalOpen, setIsGroqModalOpen] = useState(false);
  const [groqConfig, setGroqConfig] = useState("");
  const [groqSaving, setGroqSaving] = useState(false);

  const fetchGroqConfig = async () => {
    try {
      const res = await fetch("/api/settings/groq_api_key");
      const data = await res.json();
      if (data.value) setGroqConfig(data.value);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    if (isGroqModalOpen) fetchGroqConfig();
  }, [isGroqModalOpen]);

  const handleGroqSave = async () => {
    setGroqSaving(true);
    try {
      await fetch("/api/settings/groq_api_key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: groqConfig })
      });
      setIsGroqModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setGroqSaving(false);
    }
  };

  const fetchEmailConfig = async () => {
    try {
      const res = await fetch("/api/settings/email_config");
      const data = await res.json();
      if (data.value) setEmailConfig(data.value);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isEmailModalOpen) fetchEmailConfig();
  }, [isEmailModalOpen]);

  const handleEmailTest = async () => {
    if (!emailTestEmail) return alert("Please enter a test email address.");
    setEmailTesting(true);
    try {
      const res = await fetch("/api/settings/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...emailConfig, testEmail: emailTestEmail })
      });
      const data = await res.json();
      if (res.ok) alert("Test email sent successfully!");
      else alert(data.error || "Failed to send test email.");
    } catch (e) {
      console.error(e);
      alert("An error occurred during testing.");
    } finally {
      setEmailTesting(false);
    }
  };

  const handleEmailSave = async () => {
    setEmailSaving(true);
    try {
      await fetch("/api/settings/email_config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: emailConfig })
      });
      setIsEmailModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setEmailSaving(false);
    }
  };

  const fetchWaStatus = async () => {
    try {
      const res = await fetch("/api/settings/whatsapp");
      const data = await res.json();
      setWaStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isWaModalOpen) {
      fetchWaStatus();
      interval = setInterval(fetchWaStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [isWaModalOpen]);

  const handleWaAction = async (action: 'INITIALIZE' | 'DISCONNECT') => {
    setWaLoading(true);
    try {
      await fetch("/api/settings/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      await fetchWaStatus();
    } catch (e) {
      console.error(e);
    } finally {
      setWaLoading(false);
    }
  };

  const [selections, setSelections] = useState<Record<string, { project: string; form: string }>>({});

  const handleSelection = (intId: string, type: "project" | "form", val: string) => {
    setSelections(prev => ({
      ...prev,
      [intId]: { ...prev[intId], [type]: val }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Third-Party Integrations</h1>
          <p className="text-gray-600 mt-1">Connect external platforms to sync leads into your CRM automatically.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((int: any) => {
          const sel = selections[int.id] || { project: "", form: "" };
          const pParam = sel.project ? `&projectId=${sel.project}` : "";
          const fParam = sel.form ? `&formId=${sel.form}` : "";
          const webParams = `?companyId=${companyId}${pParam}${fParam}`;
          const currentWebhookUrl = int.baseWebhookPath ? `${baseUrl}${int.baseWebhookPath}${webParams}` : null;

          return (
          <div key={int.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colorMap[int.color]}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={int.icon} />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{int.name}</h2>
                </div>
              </div>
              {int.steps && (
                <button 
                  onClick={() => setSetupModalData({...int, webhookPath: currentWebhookUrl ? `${int.baseWebhookPath}${webParams}` : null})}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full transition-colors"
                >
                  Setup Guide
                </button>
              )}
            </div>
            
            <p className="text-gray-600 mb-6 flex-1">{int.description}</p>
            
            {int.baseWebhookPath ? (
              <div className="space-y-4 mt-auto">
                <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-600 w-16">Project:</label>
                    <select 
                      value={sel.project}
                      onChange={(e) => handleSelection(int.id, 'project', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select a Project...</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-600 w-16">Form:</label>
                    <select 
                      value={sel.form}
                      onChange={(e) => handleSelection(int.id, 'form', e.target.value)}
                      disabled={!sel.project}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none disabled:opacity-50"
                    >
                      <option value="">Select a Form (Optional)</option>
                      {forms.filter(f => f.projectId === sel.project).map(f => (
                        <option key={f._id} value={f._id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Your Unique Webhook URL</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={currentWebhookUrl || ''}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-600 focus:outline-none"
                    />
                    <button 
                      onClick={() => copyWebhookUrl(int.id, int.name, currentWebhookUrl || '', sel.project, sel.form)}
                      className="shrink-0 px-4 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-auto">
                <button 
                  onClick={() => {
                    if (int.id === 'whatsapp-web') setIsWaModalOpen(true);
                    else if (int.id === 'justdial') setIsJdModalOpen(true);
                    else if (int.id === 'email') setIsEmailModalOpen(true);
                    else if (int.id === 'elevenlabs') setIsElevenLabsModalOpen(true);
                    else if (int.id === 'groq') setIsGroqModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-gray-100 text-gray-900 border border-gray-300 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {int.actionLabel}
                </button>
              </div>
            )}
          </div>
        )})}
      </div>

      {isWaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsWaModalOpen(false)} />
          <div className="relative bg-white border border-gray-300 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">WhatsApp Web Connection</h2>
              <p className="text-sm text-gray-600 mt-1">Scan to connect your WhatsApp directly to CRM OS.</p>
            </div>
            
            <div className="p-8 space-y-6 flex flex-col items-center min-h-[300px] justify-center">
              {waLoading ? (
                <div className="text-gray-500">Processing...</div>
              ) : waStatus?.status === 'CONNECTED' ? (
                <div className="text-emerald-600 font-bold text-xl flex flex-col items-center gap-4">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Device Connected Successfully!
                  <button onClick={() => handleWaAction('DISCONNECT')} className="text-sm text-red-600 hover:underline mt-2">Disconnect Device</button>
                </div>
              ) : waStatus?.status === 'QR_READY' && waStatus.qr ? (
                <div className="flex flex-col items-center">
                  <img src={waStatus.qr} alt="WhatsApp QR Code" className="w-64 h-64 rounded-xl border border-gray-200 shadow-sm" />
                  <p className="text-sm text-gray-500 mt-4">Open WhatsApp on your phone and scan this code.</p>
                </div>
              ) : waStatus?.status === 'INITIALIZING' ? (
                <div className="text-gray-500 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  Generating QR Code... Please wait.
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-6">You are currently disconnected.</p>
                  <button 
                    onClick={() => handleWaAction('INITIALIZE')}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
                  >
                    Generate QR Code
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setIsWaModalOpen(false)}
                className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isJdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsJdModalOpen(false)} />
          <div className="relative bg-white border border-gray-300 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-orange-50 text-orange-600 border-orange-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Configure Justdial</h2>
                <p className="text-sm text-gray-600 mt-0.5">Enter your API credentials below</p>
              </div>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {jdConfigs.map((config, index) => (
                  <div key={config.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4 relative">
                    <div className="absolute top-4 right-4">
                      <button onClick={() => removeJdConfig(config.id)} className="text-red-500 hover:text-red-700 p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendor API Key {index + 1}</label>
                      <input 
                        type="text" 
                        value={config.apiKey}
                        onChange={(e) => updateJdConfig(config.id, 'apiKey', e.target.value)}
                        placeholder="Enter your Justdial Vendor API Key"
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Mode</label>
                        <select 
                          value={config.scheduleType}
                          onChange={(e) => updateJdConfig(config.id, 'scheduleType', e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                          <option value="interval">Time Gap (Interval)</option>
                          <option value="fixed">Fixed Time (Daily)</option>
                        </select>
                      </div>
                      
                      {config.scheduleType === 'interval' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Every (Hours)</label>
                          <input 
                            type="number" 
                            min="1"
                            max="24"
                            value={config.intervalHours}
                            onChange={(e) => updateJdConfig(config.id, 'intervalHours', parseInt(e.target.value) || 2)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none" 
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                          <input 
                            type="time" 
                            value={config.fixedTime}
                            onChange={(e) => updateJdConfig(config.id, 'fixedTime', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addJdConfig}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Another Account
                </button>

                <p className="text-xs text-gray-500 mt-2">
                  Add multiple API keys if you have multiple vendor accounts. The system will automatically fetch leads for each account according to its schedule.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setIsJdModalOpen(false)}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleJdSave}
                disabled={jdSaving}
                className="px-5 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {jdSaving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>
      )}

      {setupModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSetupModalData(null)} />
          <div className="relative bg-white border border-gray-300 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${colorMap[setupModalData.color]}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={setupModalData.icon} />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{setupModalData.name} Setup</h2>
                <p className="text-sm text-gray-600 mt-0.5">Step-by-step instructions to connect</p>
              </div>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {setupModalData.steps.map((step: string, index: number) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 border border-gray-200">
                      {index + 1}
                    </div>
                    <div className="pt-1 text-gray-700 leading-relaxed">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              {setupModalData.webhookPath && (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${baseUrl}${setupModalData.webhookPath}`);
                    alert("Webhook URL copied to clipboard!");
                  }}
                  className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Copy Webhook URL
                </button>
              )}
              <button 
                onClick={() => setSetupModalData(null)}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isElevenLabsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsElevenLabsModalOpen(false)} />
          <div className="relative bg-white border border-gray-300 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">ElevenLabs Configuration</h2>
                <p className="text-sm text-gray-600 mt-0.5">Enter your API key below</p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input 
                    type="text" 
                    value={elevenLabsConfig}
                    onChange={(e) => setElevenLabsConfig(e.target.value)}
                    placeholder="Enter your ElevenLabs API Key"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-fuchsia-500 outline-none" 
                  />
                </div>
                <p className="text-xs text-gray-500">
                  This key will be used to generate AI sound effects and voices.
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setIsElevenLabsModalOpen(false)}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleElevenLabsSave}
                disabled={elevenLabsSaving}
                className="px-5 py-2 text-sm font-medium text-white bg-fuchsia-600 rounded-lg hover:bg-fuchsia-700 transition-colors disabled:opacity-50"
              >
                {elevenLabsSaving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isGroqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsGroqModalOpen(false)} />
          <div className="relative bg-white border border-gray-300 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center bg-orange-50 text-orange-600 border-orange-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Groq (Llama) Configuration</h2>
                <p className="text-sm text-gray-600 mt-0.5">Enter your API key below</p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input 
                    type="text" 
                    value={groqConfig}
                    onChange={(e) => setGroqConfig(e.target.value)}
                    placeholder="Enter your Groq API Key"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none" 
                  />
                </div>
                <p className="text-xs text-gray-500">
                  This key will be used to power your conversational AI agents with Llama models.
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setIsGroqModalOpen(false)}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGroqSave}
                disabled={groqSaving}
                className="px-5 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {groqSaving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      {integrationLinks.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Active Configured Webhooks</h2>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Integration</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Form</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Webhook URL</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {integrationLinks.map((link) => (
                    <tr key={link._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-medium text-gray-900">
                          {link.integrationName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {link.projectId?.name || <span className="text-gray-400 italic">None</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {link.formId?.name || <span className="text-gray-400 italic">None</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2 max-w-[300px] overflow-hidden text-ellipsis bg-gray-50 px-3 py-1.5 rounded border border-gray-200 text-gray-500" title={link.url}>
                          {link.url}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(link.url);
                              alert("Copied!");
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Copy
                          </button>
                          <button 
                            onClick={() => deleteLink(link._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
