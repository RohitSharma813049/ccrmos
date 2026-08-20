'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { AppIntegrationCard, AppIntegrationType } from '@/components/integrations/AppIntegrationCard';

const mockApps: AppIntegrationType[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send real-time CRM notifications and lead updates directly to your Slack channels.',
    category: 'Communication',
    iconUrl: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg',
    isConnected: true,
  },
  {
    id: 'docusign',
    name: 'DocuSign',
    description: 'Send, sign, and manage real estate contracts securely from within the CRM.',
    category: 'E-Signature',
    iconUrl: 'https://cdn.worldvectorlogo.com/logos/docusign-1.svg',
    isConnected: false,
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Make VoIP calls, send SMS campaigns, and log call recordings automatically.',
    category: 'Telephony',
    iconUrl: 'https://cdn.worldvectorlogo.com/logos/twilio-1.svg',
    isConnected: true,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process commission splits, invoice clients, and accept secure payments.',
    category: 'Finance',
    iconUrl: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg',
    isConnected: false,
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Two-way sync for property showings, client meetings, and reminders.',
    category: 'Productivity',
    iconUrl: 'https://cdn.worldvectorlogo.com/logos/google-calendar-2.svg',
    isConnected: false,
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    description: 'Export raw CRM data to your enterprise data warehouse for advanced BI analytics.',
    category: 'Data & ETL',
    iconUrl: 'https://cdn.worldvectorlogo.com/logos/snowflake-2.svg',
    isConnected: false,
  }
];

export default function IntegrationsPage() {
  const [apps, setApps] = useState<AppIntegrationType[]>(mockApps);
  const [searchQuery, setSearchQuery] = useState('');

  const handleConnect = (id: string) => {
    // In a real app, this would redirect to the OAuth provider
    setApps(apps.map(app => 
      app.id === id ? { ...app, isConnected: true, connectedAt: new Date() } : app
    ));
  };

  const handleDisconnect = (id: string) => {
    // In a real app, this would call DELETE /api/marketplace/disconnect
    setApps(apps.map(app => 
      app.id === id ? { ...app, isConnected: false } : app
    ));
  };

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">App Marketplace</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Connect your favorite tools to supercharge your real estate workflows.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search integrations..."
            className="block w-full pl-9 pr-3 py-2 border border-zinc-800 rounded-xl leading-5 bg-zinc-900/50 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['All Apps', 'Communication', 'E-Signature', 'Telephony', 'Finance', 'Data & ETL'].map((category) => (
          <button 
            key={category}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              category === 'All Apps' 
                ? 'bg-zinc-100 text-zinc-900' 
                : 'bg-zinc-900/50 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Apps Grid */}
      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {filteredApps.map((app) => (
            <AppIntegrationCard 
              key={app.id} 
              app={app} 
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-zinc-500" />
          </div>
          <h3 className="text-base font-semibold text-zinc-100 mb-1">No integrations found</h3>
          <p className="text-sm text-zinc-400">
            We couldn't find any apps matching "{searchQuery}".
          </p>
        </div>
      )}

    </div>
  );
}
