'use client'

import React from 'react'
import { 
  Plus, 
  Search, 
  Image as ImageIcon,
  FileText,
  Filter,
  Leaf
} from 'lucide-react'

const templates = [
  {
    id: 1,
    title: 'Green Step by ram rattan',
    category: 'Other',
    filesCount: 7,
    size: '55.91 MB',
    desc: 'Sharing details of *Green Step by Ram Rattan Group* — a premium *gated farmhouse community* nestled in the serene foothills of the *Aravalli Range, Naugaon (Alwar)*. ...',
    used: 0,
    date: '22-11-2025'
  },
  {
    id: 2,
    title: 'Rasa Estate',
    category: 'Other',
    filesCount: 7,
    size: '11.46 MB',
    desc: '🌿 RASA ESTATE The Essence of Land, Life & Legacy 📍 Location: Raswada, Mubarikpur, Naugaon, Rajasthan (Just off the Delhi-Mumbai Expressway) I\'m delighted to share...',
    used: 114,
    date: '3/18/2026'
  },
  {
    id: 3,
    title: 'Jasmine Farm',
    category: 'Other',
    filesCount: 9,
    size: '73.84 MB',
    desc: '🌿 Jasmine Farms By Zak Space, Naugaon (Rajasthan), Aravali Foothills 🌿 A premium gated farmhouse community surrounded by the Aravalli Hills, offering a perfect blend of...',
    used: 0,
    date: ''
  }
]

export default function WhatsAppTemplatesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">WhatsApp Templates</h1>
        <p className="text-slate-500 text-sm">Create templates with dynamic variables and multiple media files (up to 100MB total)</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search templates..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm appearance-none bg-white font-medium text-slate-700 min-w-[160px]">
              <option>All Categories</option>
            </select>
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-xl text-sm font-bold transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div key={tpl.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col h-[420px]">
            
            <h3 className="font-bold text-lg text-slate-800 mb-3 line-clamp-1">{tpl.title}</h3>
            
            {/* Badges */}
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
                <Leaf className="w-3.5 h-3.5" /> {tpl.category}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                ↑ {tpl.filesCount} file(s)
              </span>
              <span className="text-xs font-medium text-slate-400">{tpl.size}</span>
            </div>

            {/* Media Grid Placeholder */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center p-2 text-center">
                <ImageIcon className="w-6 h-6 text-slate-300 mb-1" />
                <span className="text-[9px] text-slate-400 line-clamp-2">WhatsApp Image...</span>
              </div>
              <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center p-2 text-center">
                <ImageIcon className="w-6 h-6 text-slate-300 mb-1" />
                <span className="text-[9px] text-slate-400 line-clamp-2">WhatsApp Image...</span>
              </div>
              <div className="aspect-square bg-red-50/50 rounded-xl border border-red-100 flex flex-col items-center justify-center p-2 text-center text-red-500">
                <FileText className="w-6 h-6 mb-1" />
                <span className="text-[9px] line-clamp-2">PDF Document</span>
              </div>
              <div className="aspect-square bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-600 font-bold text-lg">
                +{tpl.filesCount > 3 ? tpl.filesCount - 3 : 0}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-1">
              {tpl.desc}
            </p>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
              <div>Variables: <span className="text-slate-300">none</span></div>
              <div className="flex gap-4">
                {tpl.used > 0 && <span>Used {tpl.used} times</span>}
                {tpl.date && <span>{tpl.date}</span>}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}
