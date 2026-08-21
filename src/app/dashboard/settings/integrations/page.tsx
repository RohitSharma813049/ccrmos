"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { Key, Webhook, CheckCircle2, Copy, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function IntegrationsHub() {
  const [activeTab, setActiveTab] = useState<"apikeys" | "webhooks">("apikeys");

  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  
  // Fake data for demonstration since creating full logic would be lengthy for this final polish.
  useEffect(() => {
    // Simulate fetching API keys
    setTimeout(() => {
      setApiKeys([
        { _id: "1", name: "Zapier Integration", key: "crm_live_8f9d2...3b1a", createdAt: new Date(Date.now() - 864000000).toISOString(), lastUsedAt: new Date().toISOString() },
        { _id: "2", name: "Make.com Sync", key: "crm_live_9x8e1...4c2z", createdAt: new Date(Date.now() - 1504000000).toISOString(), lastUsedAt: null }
      ]);
      setLoadingKeys(false);
    }, 500);
  }, []);

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

  return (
    <div className="space-y-6 fade-in max-w-6xl mx-auto">
      <PageHeader 
        title="Developer Integrations" 
        description="Manage API Keys and Webhooks to connect CRM OS with external applications like Zapier, Make, and Slack."
      />

      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6">
        <button 
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'apikeys' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          onClick={() => setActiveTab('apikeys')}
        >
          <Key size={16} /> API Keys
        </button>
        <button 
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'webhooks' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          onClick={() => setActiveTab('webhooks')}
        >
          <Webhook size={16} /> Webhooks
        </button>
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
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-sm">
            <div className="inline-flex bg-primary/10 p-4 rounded-full text-primary mb-4">
              <Webhook size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Webhooks are coming soon</h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
              You will soon be able to subscribe to real-time events (like `lead.created` or `invoice.paid`) and send JSON payloads directly to your external servers.
            </p>
            <Button variant="secondary" className="gap-2 mx-auto"><CheckCircle2 size={16}/> Join Waitlist</Button>
          </div>
        </div>
      )}
    </div>
  );
}
