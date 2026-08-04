'use client'

import React, { useState, useEffect } from 'react'
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
import { toast } from 'react-hot-toast'

interface Project {
  _id: string;
  name: string;
}

interface Property {
  _id: string;
  title: string;
  location?: string;
  projectId?: Project;
  price?: string;
  priceDesc?: string;
  available?: boolean;
  status: string;
  image?: string;
  images?: string[];
  area?: string;
  units?: string;
}

export default function PropertiesPage() {
  const [activeProject, setActiveProject] = useState('all')
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState(false)
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProperties()
    fetchProjects()
  }, [activeProject, searchQuery])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      let url = '/api/properties?'
      if (activeProject !== 'all') {
        url += `projectId=${activeProject}&`
      }
      if (searchQuery) {
        url += `search=${searchQuery}`
      }
      const res = await fetch(url)
      const data = await res.json()
      if (data.properties) {
        setProperties(data.properties)
      }
    } catch (error) {
      console.error('Error fetching properties', error)
      toast.error('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects?limit=100')
      const data = await res.json()
      if (data.projects) {
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Error fetching projects', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Property deleted')
        fetchProperties()
      } else {
        toast.error('Failed to delete property')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error deleting property')
    }
  }

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
          <button 
            onClick={() => setIsPropertyModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <button
              onClick={() => setActiveProject('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeProject === 'all' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              All Projects
            </button>
            {projects.map((proj) => (
              <button
                key={proj._id}
                onClick={() => setActiveProject(proj._id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeProject === proj._id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {proj.name}
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
          <div className="font-bold text-slate-800">{projects.length}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 mb-0.5">Total Properties</div>
          <div className="font-bold text-slate-800">{properties.length}</div>
        </div>
      </div>

      {/* Property Cards */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-100">
           <MapPin className="w-12 h-12 text-slate-300 mb-4" />
           <p className="text-slate-500">No properties found. Add one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <div key={prop._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="h-48 w-full bg-slate-100 relative">
                <img 
                  src={prop.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
                  alt={prop.title} 
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 mb-1">{prop.title}</h3>
                <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                  <MapPin className="w-3.5 h-3.5" /> {prop.location || 'No location'}
                </div>

                {prop.projectId && (
                  <div className="bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-2 w-fit mb-4 border border-purple-100">
                    <BuildingIcon /> Project: {prop.projectId.name}
                  </div>
                )}

                {(prop.area || prop.units) && (
                  <div className="flex items-center gap-6 bg-blue-50/50 rounded-xl p-3 mb-4">
                    {prop.area && (
                      <div>
                        <div className="text-xs font-medium text-slate-500">Total Area</div>
                        <div className="font-bold text-slate-800 text-sm">{prop.area}</div>
                      </div>
                    )}
                    {prop.units && (
                      <div>
                        <div className="text-xs font-medium text-slate-500">Units</div>
                        <div className="font-bold text-slate-800 text-sm">{prop.units}</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-xs font-medium text-green-600 mb-1">Total Price</div>
                      <div className="text-2xl font-bold text-green-600">{prop.price || 'Contact for price'}</div>
                      {prop.priceDesc && <div className="text-xs text-slate-400 mt-1">{prop.priceDesc}</div>}
                    </div>
                    {prop.status === 'Available' && (
                      <div className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        Available
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                      <Eye className="w-4 h-4" /> View
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(prop._id)}
                      className="flex items-center justify-center px-4 py-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-400 font-medium space-y-0.5">
                    <div>Property ID: <span className="font-mono text-slate-500">{prop._id}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Icon Class *</label>
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

      {/* Add Property Modal (Simplified for now) */}
      {isPropertyModalOpen && (
        <PropertyFormModal 
          onClose={() => setIsPropertyModalOpen(false)} 
          onSuccess={() => {
            setIsPropertyModalOpen(false);
            fetchProperties();
          }}
          projects={projects}
        />
      )}
    </div>
  )
}

function PropertyFormModal({ onClose, onSuccess, projects }: { onClose: () => void, onSuccess: () => void, projects: Project[] }) {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    projectId: '',
    price: '',
    priceDesc: '',
    area: '',
    units: '',
    type: 'Farm Land',
    status: 'Available'
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success('Property created successfully!')
        onSuccess()
      } else {
        toast.error('Failed to create property')
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Add New Property</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
              <select value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="">None</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
              <input type="text" placeholder="e.g., ₹1.13 Cr" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price Description</label>
              <input type="text" placeholder="e.g., 1500 sq yd × ₹7,500/sq yd" value={formData.priceDesc} onChange={e => setFormData({...formData, priceDesc: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Area</label>
              <input type="text" placeholder="e.g., 50 sq.ft" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Units</label>
              <input type="text" placeholder="e.g., 48" value={formData.units} onChange={e => setFormData({...formData, units: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg text-slate-700 font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Property'}
            </button>
          </div>
        </form>
      </div>
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
