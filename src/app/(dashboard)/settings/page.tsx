'use client';

import React, { useState } from 'react';
import { User, Key, Webhook, Smartphone } from 'lucide-react';
import { ApiKeysTab } from '@/components/settings/ApiKeysTab';
import { WebhooksTab } from '@/components/settings/WebhooksTab';
import { WhatsAppTab } from '@/components/settings/WhatsAppTab';

type TabId = 'profile' | 'apikeys' | 'webhooks' | 'whatsapp';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('apikeys');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'whatsapp', name: 'WhatsApp', icon: Smartphone },
    { id: 'apikeys', name: 'API Keys', icon: Key },
    { id: 'webhooks', name: 'Webhooks', icon: Webhook },
  ];

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 max-w-5xl">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your account settings and developer integrations.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap
                    ${isActive 
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">Profile Settings</h2>
              <div className="p-8 rounded-2xl bg-zinc-900/20 border border-dashed border-zinc-800 text-center text-zinc-500">
                Profile management form goes here.
              </div>
            </div>
          )}
          
          {activeTab === 'whatsapp' && <WhatsAppTab />}
          {activeTab === 'apikeys' && <ApiKeysTab />}
          {activeTab === 'webhooks' && <WebhooksTab />}
        </div>

      </div>
    </div>
  );
}
