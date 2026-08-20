'use client';

import React, { useState } from 'react';
import { Plus, Play, Save, Clock } from 'lucide-react';
import { EmailSequenceNode, SequenceStep } from './EmailSequenceNode';

const initialSteps: SequenceStep[] = [
  {
    id: '1',
    type: 'email',
    title: 'Welcome to the Brokerage',
    description: 'Subject: Thanks for attending the open house! Here is a list of similar properties...',
  },
  {
    id: '2',
    type: 'delay',
    title: 'Wait 3 Days',
    delayDays: 3,
  },
  {
    id: '3',
    type: 'email',
    title: 'Follow-up Check-in',
    description: 'Subject: Just checking in on your home search. Let me know if you need any help scheduling tours.',
  }
];

export function CampaignBuilder() {
  const [steps, setSteps] = useState<SequenceStep[]>(initialSteps);

  const handleAddEmail = () => {
    const newStep: SequenceStep = {
      id: Date.now().toString(),
      type: 'email',
      title: 'New Email Template',
      description: 'Subject: Draft your email here...',
    };
    setSteps([...steps, newStep]);
  };

  const handleAddDelay = () => {
    const newStep: SequenceStep = {
      id: Date.now().toString(),
      type: 'delay',
      title: 'Wait 1 Day',
      delayDays: 1,
    };
    setSteps([...steps, newStep]);
  };

  const handleDelete = (id: string) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const handleEdit = (id: string) => {
    // In a real app, this would open a modal to edit the email template or delay length
    alert(`Editing step ${id}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Timeline Builder */}
      <div className="lg:col-span-2">
        <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-2xl p-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-zinc-100">Campaign Sequence</h2>
            <p className="text-sm text-zinc-400 mt-1">Design your automated drip campaign timeline.</p>
          </div>
          
          <div className="pl-2">
            {steps.map((step, index) => (
              <EmailSequenceNode 
                key={step.id} 
                step={step} 
                isLast={index === steps.length - 1} 
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
          
          {/* Add Step Controls */}
          <div className="mt-4 flex items-center gap-3 pl-12">
            <button 
              onClick={handleAddEmail}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-zinc-200 rounded-xl transition-colors border border-zinc-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Email
            </button>
            <button 
              onClick={handleAddDelay}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-sm font-medium text-zinc-400 rounded-xl transition-colors border border-dashed border-zinc-700"
            >
              <Clock className="w-4 h-4" />
              Add Delay
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Settings Sidebar */}
      <div className="space-y-6">
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4">Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Campaign Name</label>
              <input 
                type="text" 
                defaultValue="Open House Nurture Sequence"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Target Audience</label>
              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                <option>New Leads (Uncontacted)</option>
                <option>Warm Leads</option>
                <option>Past Clients</option>
              </select>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-zinc-800/60 flex flex-col gap-3">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors">
              <Play className="w-4 h-4" />
              Activate Campaign
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-zinc-200 rounded-xl transition-colors">
              <Save className="w-4 h-4" />
              Save Draft
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
