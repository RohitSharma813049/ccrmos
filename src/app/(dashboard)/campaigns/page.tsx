import React from 'react';
import { CampaignBuilder } from '@/components/campaigns/CampaignBuilder';

export default function CampaignsPage() {
  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Campaign Builder</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Design automated email drip sequences to nurture your leads effortlessly.
        </p>
      </div>

      <CampaignBuilder />

    </div>
  );
}
