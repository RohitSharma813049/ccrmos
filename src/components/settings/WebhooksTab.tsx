'use client';

import React, { useState } from 'react';
import { Webhook, Plus, Trash2, Activity, Link2 } from 'lucide-react';

export function WebhooksTab() {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Webhooks</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Receive real-time HTTP payloads when events occur in your CRM.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-sm font-semibold text-white rounded-xl shadow-sm shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Endpoint
        </button>
      </div>

      {/* Add Webhook Form (Collapsible) */}
      {isAdding && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-zinc-100 mb-4">Configure New Endpoint</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Endpoint URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link2 className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://api.yourdomain.com/webhooks"
                  className="block w-full pl-9 pr-3 py-2 border border-zinc-700/80 rounded-xl bg-zinc-950 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm shadow-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Events to send</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {['lead.created', 'lead.updated', 'property.sold', 'contract.signed', 'payment.succeeded'].map((event) => (
                  <label key={event} className="flex items-center gap-2 p-3 rounded-lg border border-zinc-800 bg-zinc-950 hover:border-zinc-700 cursor-pointer transition-colors">
                    <input type="checkbox" className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500/50" />
                    <span className="text-sm text-zinc-300 font-mono">{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors"
              >
                Save Endpoint
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Webhooks Table */}
      <div className="border border-zinc-800/60 rounded-2xl bg-zinc-900/40 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900/80 border-b border-zinc-800/60 text-zinc-400 font-medium">
            <tr>
              <th className="px-6 py-4">URL</th>
              <th className="px-6 py-4">Events</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            <tr className="hover:bg-zinc-800/30 transition-colors group">
              <td className="px-6 py-4 font-medium text-zinc-100 flex items-center gap-2">
                <Webhook className="w-4 h-4 text-indigo-400" />
                https://slack.com/api/webhook
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded-md bg-zinc-800 text-xs font-mono text-zinc-400">
                  lead.created
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                  <Activity className="w-3.5 h-3.5" />
                  Active
                </div>
              </td>
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
