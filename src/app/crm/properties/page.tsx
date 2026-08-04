'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Settings2,
  MapPin,
  Eye,
  MessageCircle,
  Edit3,
  Trash2,
  X
} from 'lucide-react'

const projects = [
  { id: 'all', name: 'All Projects', count: null },
  { id: 'ivory', name: 'IVORY ARCHES', count: 0 },
  { id: 'rasa', name: 'Rasa Estate', count: 1 },
  { id: 'jasmine', name: 'Jasmine Farms', count: 1 },
]

const properties = [
  {
    id: '694ec91a0bcdca34276d68dc',
    title: 'RASA ESTATE FARM LAND',
    location: 'Naugaon',
    project: 'Rasa Estate',
    price: '₹1.13 Cr',
    priceDesc: '1500 sq yd × ₹7,500/sq yd',
    available: true,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    area: '',
    units: ''
  },
  {
    id: '693b13c2e0624fc3e7e1facf',
    title: 'Jasmine Farm House',
    location: 'Naugaon',
    project: 'Jasmine Farms',
    price: '₹1.19 Cr',
    priceDesc: '1500 sq yd × ₹7,900/sq yd',
    available: true,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    area: '50 sq.ft',
    units: '48'
  }
]

export default function PropertiesPage() {
  const [activeProject, setActiveProject] = useState('all')
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState(false)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">All Properties</h1>
          <p className="text-slate-500 text-sm">Manage and browse all properties</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAmenitiesModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Settings2 className="w-4 h-4" /> Manage Amenities
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Property
          </button>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search properties..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors sm:w-auto w-full">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
        
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-2 uppercase">Filter by Project</div>
          <div className="flex flex-wrap gap-2">
            {projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => setActiveProject(proj.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeProject === proj.id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {proj.name} {proj.count !== null && <span className="ml-1 opacity-70">({proj.count})</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-x-12 gap-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <div className="w-4 h-4 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-sm"></div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overview</div>
          </div>
        </div>
        
        <div>
          <div className="text-xs font-medium text-slate-500 mb-0.5">Projects</div>
          <div className="font-bold text-slate-800">3</div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 mb-0.5">Properties</div>
          <div className="font-bold text-slate-800">2</div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 mb-0.5">Filtered</div>
          <div className="font-bold text-slate-800">2</div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 mb-0.5">Selected Project</div>
          <div className="font-bold text-slate-800">All</div>
        </div>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((prop) => (
          <div key={prop.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            {/* Image */}
            <div className="h-48 w-full bg-slate-100 relative">
              <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-800 mb-1">{prop.title}</h3>
              <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                <MapPin className="w-3.5 h-3.5" /> {prop.location}
              </div>

              <div className="bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-2 w-fit mb-4 border border-purple-100">
                <BuildingIcon /> Project: {prop.project}
              </div>

              {(prop.area || prop.units) && (
                <div className="flex items-center gap-6 bg-blue-50/50 rounded-xl p-3 mb-4">
                  <div>
                    <div className="text-xs font-medium text-slate-500">Total Area</div>
                    <div className="font-bold text-slate-800 text-sm">{prop.area}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">Units</div>
                    <div className="font-bold text-slate-800 text-sm">{prop.units}</div>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-medium text-green-600 mb-1">Total Price</div>
                    <div className="text-2xl font-bold text-green-600">{prop.price}</div>
                    <div className="text-xs text-slate-400 mt-1">{prop.priceDesc}</div>
                  </div>
                  {prop.available && (
                    <div className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      Available
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mb-4">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 border border-green-200 text-green-600 rounded-xl hover:bg-green-50 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 font-medium space-y-0.5">
                  <div>Property ID: <span className="font-mono text-slate-500">{prop.id}</span></div>
                  <div>Project: {prop.project}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Amenities Modal */}
      {isAmenitiesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Manage Amenities</h2>
              <button 
                onClick={() => setIsAmenitiesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-8">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">Add New Amenity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Amenity Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Swimming Pool" 
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Font Awesome Icon Class *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., fa-solid fa-swimming-pool" 
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                </div>
                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
                  Add Amenity
                </button>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-4 text-lg">All Amenities (0)</h3>
                
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Settings2 className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500">No amenities added yet. Add your first amenity above.</p>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={() => setIsAmenitiesModalOpen(false)}
                className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BuildingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <path d="M9 22v-4h6v4"></path>
      <path d="M8 6h.01"></path>
      <path d="M16 6h.01"></path>
      <path d="M12 6h.01"></path>
      <path d="M12 10h.01"></path>
      <path d="M12 14h.01"></path>
      <path d="M16 10h.01"></path>
      <path d="M16 14h.01"></path>
      <path d="M8 10h.01"></path>
      <path d="M8 14h.01"></path>
    </svg>
  )
}
