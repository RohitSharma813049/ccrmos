'use client'

import React from 'react'
import { 
  Server, 
  RefreshCcw, 
  Plus, 
  Search, 
  Database, 
  CheckCircle2, 
  BarChart3, 
  Trophy,
  Edit3,
  Trash2
} from 'lucide-react'

const sources = [
  { id: '6a6b0de1...', name: '01-aug-2026 nancy dugal final', date: '01-aug-2026', desc: 'Auto-created from Meta Ads campaign: 01-aug-2...', leads: 0, status: 'Active' },
  { id: '6a691d00...', name: '28-july-2026 nancy dugal', date: '28-july-2026', desc: 'Auto-created from Meta Ads campaign: 28-july-2...', leads: 0, status: 'Active' },
  { id: '6a684a14...', name: '17-july-2026 Gurugram-copy', date: '17-july-2026', desc: 'Auto-created from Meta Ads campaign: 17-july-2...', leads: 0, status: 'Active' },
  { id: '6a684a12...', name: '08-july-2026 Gurugram-copy', date: '08-july-2026', desc: 'Auto-created from Meta Ads campaign: 08-july-2...', leads: 0, status: 'Active' }
]

export default function LeadSourcesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lead Sources</h1>
          <p className="text-slate-500 text-sm">Manage your lead acquisition channels</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm font-medium">
            <Server className="w-4 h-4" />
            Server Online
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Source
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Sources</p>
            <h3 className="text-3xl font-bold text-slate-800">72</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-green-500">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Active Sources</p>
            <h3 className="text-3xl font-bold text-green-600">72</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Leads</p>
            <h3 className="text-3xl font-bold text-purple-600">0</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Top Source</p>
            <h3 className="text-sm font-bold text-orange-600 truncate max-w-[150px]">
              01-aug-2026 nancy dugal final
            </h3>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0 relative">
            <Trophy className="w-6 h-6" />
            <div className="absolute -top-1 -right-1">🏆</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        
        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search lead sources by name or description..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 font-semibold bg-slate-50/50 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Source Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">API Key</th>
                <th className="px-6 py-4 text-center">Leads</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.map((source, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{source.name}</div>
                    <div className="text-xs text-slate-400">ID: {source.id}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-[300px] truncate">
                    {source.desc}
                  </td>
                  <td className="px-6 py-4 text-slate-400 italic text-xs">
                    Not set
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-800">
                    {source.leads}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold border border-green-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button className="text-blue-500 hover:text-blue-700 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
