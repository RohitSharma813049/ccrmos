'use client'

import React, { useState } from 'react'
import { 
  Volume2, 
  RefreshCcw, 
  Search, 
  Settings, 
  Trash2, 
  Edit3, 
  Copy, 
  Info,
  VolumeX
} from 'lucide-react'

export default function VoicesPage() {
  const [activeTab, setActiveTab] = useState('All Voices')
  const tabs = [
    { name: 'All Voices', icon: Volume2 },
    { name: 'Voice Details', icon: Search },
    { name: 'Clone Voice', icon: Copy },
    { name: 'Edit Voice', icon: Edit3 },
    { name: 'Delete Voice', icon: Trash2 },
    { name: 'API Settings', icon: Settings }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-fuchsia-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/20">
            <Volume2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-fuchsia-600">ElevenLabs Voice Manager</h1>
            <p className="text-slate-500 text-sm">Advanced AI voice management & cloning</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-400 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-sm">
          <RefreshCcw className="w-4 h-4" />
          Refresh Voices
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Tabs Navigation */}
        <div className="flex items-center gap-6 px-6 border-b border-slate-100 overflow-x-auto custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.name 
                  ? 'border-purple-500 text-purple-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search voices by name or category..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
              />
            </div>
            <div className="px-4 py-2 bg-slate-50 text-slate-600 font-semibold text-sm rounded-xl border border-slate-200">
              0 voices
            </div>
          </div>

          {/* Preview Text Box */}
          <div className="bg-fuchsia-50/50 rounded-xl p-4 border border-fuchsia-100/50">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Preview Text (for voice testing)
            </label>
            <textarea 
              rows={2}
              className="w-full border border-fuchsia-100 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-300 resize-none"
              defaultValue="Hello, this is a voice preview."
            ></textarea>
          </div>

          {/* Empty State */}
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <VolumeX className="w-16 h-16 text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">
              No voices found. Click "Refresh Voices" to load.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
