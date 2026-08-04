'use client'

import React from 'react'
import { 
  Plus, 
  Search, 
  RefreshCcw,
  Building2,
  MapPin,
  Home,
  Image as ImageIcon,
  FileText,
  MoreVertical
} from 'lucide-react'

const projects = [
  {
    id: 1,
    name: 'IVORY ARCHES',
    builder: 'Zak Spaces',
    location: 'Sector 88B, Dwarka Expressway, Gurgaon, Haryana',
    type: 'Residential',
    priceRange: '₹2.5Cr - 9.0Cr',
    totalUnits: 156,
    availableUnits: 52,
    images: 0,
    pdfs: 0,
    possession: '30 Jun 2027',
    added: '30 Dec 2025',
    available: true
  },
  {
    id: 2,
    name: 'Rasa Estate',
    builder: 'RASA ESTATE',
    location: 'Naugaon, Alwar, Naugaon, Rajasthan',
    type: 'Farmland',
    priceRange: '₹1.1Cr - 5.0Cr',
    totalUnits: 83,
    availableUnits: 30,
    images: 0,
    pdfs: 0,
    possession: '31 Mar 2026',
    added: '26 Dec 2025',
    available: true
  }
]

export default function ProjectsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Projects</h1>
          <p className="text-slate-500 text-sm">Manage project details, brochures, and media</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Controls Area */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-8 py-2.5 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-semibold transition-colors sm:w-auto w-full">
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Projects</p>
          <h3 className="text-2xl font-bold text-slate-800">3</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Active</p>
          <h3 className="text-2xl font-bold text-green-600">3</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Units</p>
          <h3 className="text-2xl font-bold text-blue-600">289</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Available Units</p>
          <h3 className="text-2xl font-bold text-purple-600">86</h3>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative hover:shadow-md transition-shadow flex flex-col">
            
            {/* Header / Badges */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 leading-tight uppercase">{project.name}</h3>
                  <p className="text-sm text-slate-500">{project.builder}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {project.available && (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    Available
                  </span>
                )}
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-6">
              <div className="flex gap-2 text-sm text-slate-500">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{project.location}</span>
              </div>
              <div className="flex gap-2 text-sm text-slate-500">
                <Home className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{project.type}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-slate-100 mb-6">
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1">Price Range</div>
                <div className="font-bold text-slate-800">{project.priceRange}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1">Total Units</div>
                <div className="font-bold text-slate-800">{project.totalUnits}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1">Available</div>
                <div className="font-bold text-green-600">{project.availableUnits}</div>
              </div>
            </div>

            {/* Actions & Footer */}
            <div className="mt-auto space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-1.5"><ImageIcon className="w-4 h-4" /> {project.images} Images</div>
                  <div className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {project.pdfs} PDFs</div>
                </div>
                <button className="px-5 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-semibold transition-colors">
                  View Details
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-4 border-t border-slate-50">
                <div>Possession: {project.possession}</div>
                <div>Added: {project.added}</div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}
