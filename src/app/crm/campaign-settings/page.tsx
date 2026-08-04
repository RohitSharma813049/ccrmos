'use client'

import React from 'react'
import { 
  Settings2, 
  Plus, 
  Trash2, 
  UserSquare2
} from 'lucide-react'

const configurations = [
  {
    id: 1,
    name: 'RASA Estate - Form 5',
    assignedTo: 'Prince Gathwal',
    type: 'Buyer',
    lastSynced: '6/1/2026, 3:50:12 PM',
    category: 'Hot',
    processed: 0
  },
  {
    id: 2,
    name: 'RASA Estate - Form 3',
    assignedTo: 'Prince Gathwal',
    type: 'Buyer',
    lastSynced: '5/28/2026, 3:10:10 PM',
    category: 'Hot',
    processed: 0
  },
  {
    id: 3,
    name: 'RASA Estate - Form 6',
    assignedTo: 'Prince Gathwal',
    type: 'Buyer',
    lastSynced: '5/27/2026, 12:45:30 PM',
    category: 'Hot',
    processed: 0
  }
]

export default function CampaignSettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Campaign Configuration</h1>
            <p className="text-slate-500 text-sm">Configure automatic lead assignment for Meta campaigns</p>
          </div>
        </div>
        <div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Configuration
          </button>
        </div>
      </div>

      {/* Configuration Cards */}
      <div className="space-y-4">
        {configurations.map((config) => (
          <div key={config.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative group">
            
            {/* Delete Button */}
            <button className="absolute right-6 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 opacity-50 hover:opacity-100 transition-opacity">
              <Trash2 className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-4">{config.name}</h3>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-8 max-w-2xl mb-6">
              <div className="text-sm">
                <span className="text-slate-500 mr-2">Assigned To:</span>
                <span className="font-semibold text-slate-800">{config.assignedTo}</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-500 mr-2">Category:</span>
                <span className="font-semibold text-slate-800">{config.category}</span>
              </div>
              
              <div className="text-sm">
                <span className="text-slate-500 mr-2">Type:</span>
                <span className="font-semibold text-slate-800">{config.type}</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-500 mr-2">Processed:</span>
                <span className="font-bold text-green-600">{config.processed}</span>
              </div>
              
              <div className="text-sm col-span-2">
                <span className="text-slate-500 mr-2">Last Synced:</span>
                <span className="font-medium text-slate-700">{config.lastSynced}</span>
              </div>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-xs font-semibold transition-colors border border-purple-100">
              <UserSquare2 className="w-4 h-4" />
              Assign Past Unassigned Leads
            </button>
            
          </div>
        ))}
      </div>
    </div>
  )
}
