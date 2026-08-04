'use client'

import React from 'react'
import { 
  Server, 
  RefreshCcw, 
  Plus, 
  Search, 
  GitBranch, 
  Users, 
  Percent, 
  Activity,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

const pipeline = [
  { name: 'Fresh Lead', color: 'bg-[#3b82f6]', text: 'text-[#3b82f6]', count: 0 },
  { name: 'Fresh', color: 'bg-[#22c55e]', text: 'text-[#22c55e]', count: 0 },
  { name: 'Invalid Number', color: 'bg-[#ef4444]', text: 'text-[#ef4444]', count: 0 },
  { name: 'Contacted', color: 'bg-[#a855f7]', text: 'text-[#a855f7]', count: 0 },
  { name: 'Interested', color: 'bg-[#f97316]', text: 'text-[#f97316]', count: 0 },
  { name: 'Other property Interested', color: 'bg-[#14b8a6]', text: 'text-[#14b8a6]', count: 0 }
]

const stages = [
  { 
    order: 1, 
    name: 'Fresh Lead', 
    desc: '-', 
    color: '#3B82F6', 
    statuses: ['Not Assigned', 'Assigned', 'Number unavailable'], 
    leads: 0 
  }
]

export default function LeadStagesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lead Stages</h1>
          <p className="text-slate-500 text-sm">Manage your lead pipeline stages</p>
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
            Add Stage
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Stages</p>
            <h3 className="text-3xl font-bold text-blue-600">8</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Leads</p>
            <h3 className="text-3xl font-bold text-purple-600">0</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Conversion Rate</p>
            <h3 className="text-3xl font-bold text-green-600">0%</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Most Active</p>
            <h3 className="text-lg font-bold text-orange-800">Fresh Lead</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0">
            
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
              placeholder="Search lead stages..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Pipeline Flow Visualization */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 overflow-x-auto">
          <div className="flex items-center gap-2 mb-6">
            <GitBranch className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-700">Pipeline Flow</h3>
          </div>
          
          <div className="flex items-center min-w-[800px] relative px-4">
            {/* Connecting Line */}
            <div className="absolute top-8 left-12 right-12 h-1 bg-slate-300 z-0"></div>
            
            {/* Nodes */}
            <div className="flex justify-between w-full relative z-10">
              {pipeline.map((node, i) => (
                <div key={i} className="flex flex-col items-center gap-3 bg-slate-50/30 px-2 py-1">
                  <div className={`w-16 h-16 rounded-full ${node.color} flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-white transition-transform hover:scale-110 cursor-pointer`}>
                    {node.count}
                  </div>
                  <span className={`text-xs font-semibold ${node.text} text-center max-w-[100px]`}>
                    {node.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 font-semibold bg-slate-50/50 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Stage Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Color</th>
                <th className="px-6 py-4">Statuses</th>
                <th className="px-6 py-4 text-center">Leads</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stages.map((stage, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-slate-800">{stage.order}</span>
                      <div className="flex flex-col gap-0.5">
                        <button className="text-slate-300 hover:text-slate-500"><ArrowUp className="w-3 h-3" /></button>
                        <button className="text-slate-300 hover:text-slate-500"><ArrowDown className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {stage.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {stage.desc}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: stage.color }} />
                      <span className="text-xs font-medium text-slate-500">{stage.color}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {stage.statuses.map((status, idx) => (
                        <span key={idx} className="bg-blue-500 text-white text-[11px] font-medium px-3 py-1 rounded-full">
                          {status}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-800">
                    {stage.leads}
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
