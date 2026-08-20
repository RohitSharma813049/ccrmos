'use client';

import React, { useState } from 'react';
import { Key, Plus, Trash2, Copy, Check, AlertTriangle } from 'lucide-react';

export function ApiKeysTab() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Mock API call
    setTimeout(() => {
      setNewKey('api_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      setIsGenerating(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">API Keys</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your secret keys for authenticating with the CRM REST API.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-sm font-semibold text-white rounded-xl shadow-sm shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-70"
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Generate New Key
        </button>
      </div>

      {/* New Key Alert */}
      {newKey && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">Please copy your API key now</h3>
              <p className="text-sm text-emerald-400/80 mt-1">
                For your security, it will never be shown again. If you lose it, you will need to generate a new one.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <code className="flex-1 p-2 rounded-lg bg-zinc-950 border border-emerald-500/30 text-emerald-300 font-mono text-sm break-all">
              {newKey}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      {/* Keys Table */}
      <div className="border border-zinc-800/60 rounded-2xl bg-zinc-900/40 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900/80 border-b border-zinc-800/60 text-zinc-400 font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Key Preview</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            <tr className="hover:bg-zinc-800/30 transition-colors group">
              <td className="px-6 py-4 font-medium text-zinc-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-zinc-500" />
                Production App
              </td>
              <td className="px-6 py-4 font-mono text-zinc-500">sk_live_...4f2a</td>
              <td className="px-6 py-4 text-zinc-500">Oct 12, 2026</td>
              <td className="px-6 py-4 text-right">
                <button className="text-zinc-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr className="hover:bg-zinc-800/30 transition-colors group">
              <td className="px-6 py-4 font-medium text-zinc-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-zinc-500" />
                Zapier Integration
              </td>
              <td className="px-6 py-4 font-mono text-zinc-500">sk_live_...9x1b</td>
              <td className="px-6 py-4 text-zinc-500">Aug 20, 2026</td>
              <td className="px-6 py-4 text-right">
                <button className="text-zinc-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
