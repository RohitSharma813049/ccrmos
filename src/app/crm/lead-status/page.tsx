'use client'

import React from 'react'
import { 
  Plus, 
  Search, 
  Tag,
  Edit3,
  Trash2,
  TrendingDown,
  TrendingUp
} from 'lucide-react'

const statuses = [
  {
    id: 1,
    name: 'Raw Land',
    category: 'Interested',
    catColor: 'bg-pink-100 text-pink-600',
    catIcon: TrendingDown,
    created: '1/20/2026',
    active: true,
    iconColor: 'bg-pink-500'
  },
  {
    id: 2,
    name: 'Planned Droped',
    category: 'Not Interested',
    catColor: 'bg-red-100 text-red-600',
    catIcon: TrendingDown,
    created: '1/14/2026',
    active: true,
    iconColor: 'bg-red-500'
  },
  {
    id: 3,
    name: 'taken in another property/location',
    category: 'Not Interested',
    catColor: 'bg-red-100 text-red-600',
    catIcon: TrendingDown,
    created: '1/10/2026',
    active: true,
    iconColor: 'bg-red-500'
  },
  {
    id: 4,
    name: 'Dwarka Expressway',
    category: 'Interested',
    catColor: 'bg-pink-100 text-pink-600',
    catIcon: TrendingDown,
    created: '1/20/2026',
    active: true,
    iconColor: 'bg-teal-600'
  },
  {
    id: 5,
    name: 'Golf Course Extn road',
    category: 'Interested',
    catColor: 'bg-pink-100 text-pink-600',
    catIcon: TrendingDown,
    created: '1/20/2026',
    active: true,
    iconColor: 'bg-teal-600'
  },
  {
    id: 6,
    name: 'Voice Mail',
    category: 'Interested',
    catColor: 'bg-pink-100 text-pink-600',
    catIcon: TrendingDown,
    created: '1/20/2026',
    active: true,
    iconColor: 'bg-purple-500'
  }
]

export default function LeadStatusPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lead Status</h1>
          <p className="text-slate-500 text-sm">Define and manage lead status types</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Status
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 shadow-sm">
          <p className="text-sm font-medium text-blue-600 mb-1">Total Status</p>
          <h3 className="text-3xl font-bold text-blue-800">36</h3>
        </div>
        {/* Card 2 */}
        <div className="bg-green-50/50 rounded-2xl p-5 border border-green-100 shadow-sm">
          <p className="text-sm font-medium text-green-600 mb-1">Active Status</p>
          <h3 className="text-3xl font-bold text-green-700">36</h3>
        </div>
        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Inactive Status</p>
          <h3 className="text-3xl font-bold text-slate-800">0</h3>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search lead status..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg shadow-sm">
            All
          </button>
          <button className="flex-1 sm:flex-none px-6 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm rounded-lg transition-colors">
            Active
          </button>
          <button className="flex-1 sm:flex-none px-6 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm rounded-lg transition-colors">
            Inactive
          </button>
        </div>
      </div>

      {/* Grid of Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statuses.map((status) => (
          <div key={status.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative">
            
            {/* Action Buttons */}
            <div className="absolute top-6 right-6 flex items-center gap-3">
              <button className="text-blue-500 hover:text-blue-700 transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button className="text-red-500 hover:text-red-700 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Icon & Details */}
            <div className="space-y-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${status.iconColor}`}>
                <Tag className="w-6 h-6" />
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-800 text-lg leading-tight mb-1">
                  {status.name}
                </h3>
                <p className="text-slate-400 text-sm">-</p>
              </div>

              {/* Category Pill */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold ${status.catColor}`}>
                <status.catIcon className="w-3.5 h-3.5" />
                {status.category}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Created {status.created}
              </span>
              {status.active && (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-md">
                  Active
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
