"use client";

import { useState, useEffect } from "react";
import { usePermissions } from "@/hooks/usePermissions";

export default function IntegrationsPage() {
  const { session } = usePermissions();
  const companyId = session?.user?.companyId || "test-tenant-id";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");

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

  const projectParam = selectedProject ? `&projectId=${selectedProject}` : "";

  const integrations = [
    {
      id: "meta",
      name: "Meta (Facebook) Lead Ads",
      description: "Receive leads instantly from your Facebook & Instagram campaigns.",
      webhookPath: `/api/webhooks/meta?companyId=${companyId}${projectParam}`,
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      color: "blue"
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business API",
      description: "Sync incoming messages and opt-ins as new leads in your CRM.",
      webhookPath: `/api/webhooks/whatsapp?companyId=${companyId}${projectParam}`,
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      color: "emerald"
    },
    {
      id: "generic",
      name: "Generic Bulk Import API",
      description: "Use this endpoint to POST JSON arrays of leads from Zapier, Make.com, or custom scripts.",
      webhookPath: `/api/webhooks/generic?companyId=${companyId}${projectParam}`,
      icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
      color: "purple"
    },
    {
      id: "justdial",
      name: "Justdial (Daily Fetch)",
      description: "Configure your Justdial API keys to automatically fetch leads every night at midnight.",
      actionLabel: "Configure Keys",
      icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      color: "orange"
    }
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200"
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Webhook URL copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Third-Party Integrations</h1>
          <p className="text-gray-600 mt-1">Connect external platforms to sync leads into your CRM automatically.</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Assign to Project:</label>
          <select 
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full md:w-64 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">None (Default)</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((int) => (
          <div key={int.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
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
            </div>
            
            <p className="text-gray-600 mb-6">{int.description}</p>
            
            {int.webhookPath ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Your Unique Webhook URL</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${baseUrl}${int.webhookPath}`}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-600 focus:outline-none"
                  />
                  <button 
                    onClick={() => copyToClipboard(`${baseUrl}${int.webhookPath}`)}
                    className="shrink-0 px-4 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ) : (
              <button className="px-5 py-2.5 bg-gray-100 text-gray-900 border border-gray-300 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                {int.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
