'use client'

import React, { useState } from 'react'
import { 
  Share2, 
  Users, 
  CheckCircle2, 
  Clock, 
  Zap,
  Plus,
  RefreshCw,
  RefreshCcw,
  ChevronRight,
  ChevronDown,
  AlertTriangle
} from 'lucide-react'

export default function FbLeadsPage() {
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>('09-July-2026 Channel Partner')

  const toggleCampaign = (name: string) => {
    if (expandedCampaign === name) {
      setExpandedCampaign(null)
    } else {
      setExpandedCampaign(name)
    }
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
      
      {/* Left Sidebar - Summary */}
      <div className="w-full md:w-64 shrink-0 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Share2 className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-lg text-zinc-100">Meta Ads</h2>
        </div>

        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs font-medium text-zinc-400 mb-1">Total Leads</p>
          <h3 className="text-2xl font-bold text-blue-600">1000</h3>
        </div>

        <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
          <p className="text-xs font-medium text-zinc-400 mb-1">Processed</p>
          <h3 className="text-2xl font-bold text-green-600">988</h3>
        </div>

        <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
          <p className="text-xs font-medium text-zinc-400 mb-1">Pending</p>
          <h3 className="text-2xl font-bold text-orange-600">12</h3>
        </div>

        <div className="bg-zinc-950/50/80 rounded-xl p-4 border border-zinc-800/60 flex gap-2">
          <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-400 leading-relaxed">
            Auto-sync runs every 20 minutes
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        
        {/* Header & Actions */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 leading-tight">Meta Leads Database</h1>
            <p className="text-zinc-400 text-sm">Leads are synced automatically from Facebook/Instagram</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Create<br/>Sources
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              Process<br/>Pending (12)
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              <RefreshCw className="w-4 h-4" />
              Sync from<br/>Meta
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Campaign List */}
        <div className="space-y-4">
          
          {/* Campaign 1 - Expanded */}
          <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl shadow-sm border border-zinc-700/50 overflow-hidden">
            <div 
              onClick={() => toggleCampaign('09-July-2026 Channel Partner')}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white p-4 flex items-center gap-3 transition-colors"
            >
              {expandedCampaign === '09-July-2026 Channel Partner' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              <div>
                <h3 className="font-bold text-lg">09-July-2026 Channel Partner</h3>
                <div className="flex items-center gap-4 text-xs text-blue-100 mt-1">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 179 Leads</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 179 Processed</span>
                  <span>Form ID: 1346858853490982</span>
                </div>
              </div>
            </div>
            
            {expandedCampaign === '09-July-2026 Channel Partner' && (
              <div className="p-4 space-y-4 bg-zinc-950/50">
                {/* Lead Item 1 */}
                <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-green-200 p-4 shadow-sm relative">
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Processed
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-green-200 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-zinc-100">satvik</h4>
                      <p className="text-xs text-zinc-400">Aug 1, 2026, 12:24 PM</p>
                      <div className="mt-2 space-y-1 text-sm text-zinc-400">
                        <div className="flex items-center gap-2"><span className="text-zinc-400 w-24">Phone Number:</span> +919625977690</div>
                        <div className="flex items-center gap-2"><span className="text-zinc-400 w-24">Email:</span> kumaralpana890@gmail.com</div>
                        <div className="flex items-center gap-2"><span className="text-zinc-400 w-24">City:</span> Gurugram</div>
                        <div className="flex items-center gap-2"><span className="text-zinc-400 w-24">State:</span> Uttar Pradesh</div>
                      </div>
                      <p className="text-xs text-zinc-400 mt-2 font-medium">+1 more fields</p>
                    </div>
                  </div>
                </div>

                {/* Lead Item 2 */}
                <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-green-200 p-4 shadow-sm relative">
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Processed
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-green-200 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-zinc-100">Aftab Ahmed</h4>
                      <p className="text-xs text-zinc-400">Aug 1, 2026, 09:44 AM</p>
                      <div className="mt-2 space-y-1 text-sm text-zinc-400">
                        <div className="flex items-center gap-2"><span className="text-zinc-400 w-24">Phone Number:</span> +916005479924</div>
                        <div className="flex items-center gap-2"><span className="text-zinc-400 w-24">Email:</span> aftabahmedawan5@gmail.com</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campaign 2 */}
          <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl shadow-sm border border-zinc-700/50 overflow-hidden">
            <div 
              onClick={() => toggleCampaign('08-july-2026 Gurugram-copy')}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white p-4 flex items-center gap-3 transition-colors"
            >
              {expandedCampaign === '08-july-2026 Gurugram-copy' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              <div>
                <h3 className="font-bold text-lg">08-july-2026 Gurugram-copy</h3>
                <div className="flex items-center gap-4 text-xs text-blue-100 mt-1">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 55 Leads</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 54 Processed</span>
                  <span className="flex items-center gap-1 bg-amber-500/20 text-amber-200 px-2 rounded-md py-0.5"><AlertTriangle className="w-3.5 h-3.5" /> 1 Duplicates</span>
                  <span>Form ID: 1938059650189434</span>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign 3 */}
          <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl shadow-sm border border-zinc-700/50 overflow-hidden">
            <div 
              onClick={() => toggleCampaign('01-aug-2026 nancy dugal final')}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white p-4 flex items-center gap-3 transition-colors"
            >
              {expandedCampaign === '01-aug-2026 nancy dugal final' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              <div>
                <h3 className="font-bold text-lg">01-aug-2026 nancy dugal final</h3>
                <div className="flex items-center gap-4 text-xs text-blue-100 mt-1">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 3 Leads</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 3 Processed</span>
                  <span>Form ID: 1411158444235940</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
