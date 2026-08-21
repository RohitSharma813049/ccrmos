'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle2, AlertCircle, ExternalLink, Key, Hash, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function WhatsAppTab() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    webhookVerifyToken: ''
  });

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/whatsapp/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setFormData(data.config);
          if (data.config.accessToken && data.config.phoneNumberId) {
            setIsConfigured(true);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('WhatsApp API Configured Successfully!');
        setIsConfigured(true);
      } else {
        toast.error('Failed to save configuration');
      }
    } catch (err) {
      toast.error('An error occurred while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateVerifyToken = () => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setFormData({ ...formData, webhookVerifyToken: token });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500">Loading Configuration...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl font-bold text-zinc-100">WhatsApp Meta Cloud API</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Connect your Official Meta Developer App to send and receive WhatsApp messages without background browser limits.
        </p>
      </div>

      <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/60 shadow-sm max-w-2xl">
        <div className="flex items-center gap-4 mb-8 border-b border-zinc-800/60 pb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isConfigured ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
            <Smartphone className={`w-6 h-6 ${isConfigured ? 'text-emerald-400' : 'text-blue-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Integration Status</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2.5 w-2.5">
                {isConfigured ? (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zinc-500"></span>
                )}
              </span>
              <span className={`text-sm font-medium ${isConfigured ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {isConfigured ? 'Connected to Meta API' : 'Not Configured'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-300">Meta API Credentials</h4>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-1.5">
                <Key className="w-4 h-4" /> System User Access Token
              </label>
              <input 
                required
                type="password"
                value={formData.accessToken}
                onChange={e => setFormData({...formData, accessToken: e.target.value})}
                placeholder="EAA..."
                className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-1.5">
                  <Hash className="w-4 h-4" /> Phone Number ID
                </label>
                <input 
                  required
                  type="text"
                  value={formData.phoneNumberId}
                  onChange={e => setFormData({...formData, phoneNumberId: e.target.value})}
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono text-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-1.5">
                  <Hash className="w-4 h-4" /> Business Account ID (Optional)
                </label>
                <input 
                  type="text"
                  value={formData.businessAccountId}
                  onChange={e => setFormData({...formData, businessAccountId: e.target.value})}
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800/60 space-y-4">
            <h4 className="text-sm font-semibold text-zinc-300">Webhook Configuration</h4>
            
            <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Webhook URL (Copy this to Meta App Dashboard)</label>
              <div className="text-sm text-blue-400 font-mono break-all select-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook?companyId=[YOUR_COMPANY_ID]` : ''}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-1.5">
                <ShieldCheck className="w-4 h-4" /> Verify Token
              </label>
              <div className="flex gap-2">
                <input 
                  required
                  type="text"
                  value={formData.webhookVerifyToken}
                  onChange={e => setFormData({...formData, webhookVerifyToken: e.target.value})}
                  placeholder="Create a secure token"
                  className="flex-1 bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono text-sm"
                />
                <button 
                  type="button" 
                  onClick={generateVerifyToken}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors font-medium text-sm"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
