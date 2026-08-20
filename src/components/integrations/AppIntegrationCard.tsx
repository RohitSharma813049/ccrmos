'use client';

import React from 'react';
import { CheckCircle2, Link as LinkIcon, ExternalLink } from 'lucide-react';

export interface AppIntegrationType {
  id: string;
  name: string;
  description: string;
  category: string;
  iconUrl: string;
  isConnected: boolean;
  connectedAt?: Date;
}

interface AppIntegrationCardProps {
  app: AppIntegrationType;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
}

export function AppIntegrationCard({ app, onConnect, onDisconnect }: AppIntegrationCardProps) {
  return (
    <div className="flex flex-col p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-xl transition-all duration-300 hover:bg-zinc-800/50 hover:border-zinc-700/80 hover:shadow-xl hover:shadow-indigo-500/5 group">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center p-2.5 border border-zinc-800/60 shadow-sm group-hover:scale-105 transition-transform duration-300">
          <img src={app.iconUrl} alt={`${app.name} logo`} className="w-full h-full object-contain" />
        </div>
        
        {app.isConnected ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </div>
        ) : (
          <div className="px-2.5 py-1 rounded-full bg-zinc-800/50 text-zinc-400 text-xs font-medium border border-zinc-700/50">
            {app.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1">
        <h3 className="text-base font-semibold text-zinc-100 mb-1 flex items-center gap-2">
          {app.name}
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
          {app.description}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
        {app.isConnected ? (
          <>
            <button className="text-xs font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors">
              Configure <ExternalLink className="w-3 h-3" />
            </button>
            <button 
              onClick={() => onDisconnect(app.id)}
              className="px-4 py-1.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            >
              Disconnect
            </button>
          </>
        ) : (
          <>
            <span className="text-xs font-medium text-zinc-500">Free integration</span>
            <button 
              onClick={() => onConnect(app.id)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-zinc-900 bg-zinc-100 hover:bg-white rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Connect
            </button>
          </>
        )}
      </div>
    </div>
  );
}
