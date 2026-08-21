'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Trash2,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import DocumentUpload, { DocumentInfo } from '@/components/ui/DocumentUpload'

interface Partner {
  _id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  city?: string;
  state?: string;
  type: string;
  experience?: string;
  expDesc?: string;
  teamSize?: string;
  createdAt: string;
}

export default function ChannelPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('All Partner Types')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchPartners()
  }, [searchQuery, filterType])

  const fetchPartners = async () => {
    setLoading(true)
    try {
      let url = '/api/partners?'
      if (searchQuery) url += `search=${searchQuery}&`
      if (filterType !== 'All Partner Types') url += `type=${filterType}&`
      
      const res = await fetch(url)
      const data = await res.json()
      if (data.partners) {
        setPartners(data.partners)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load partners')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;
    try {
      const res = await fetch(`/api/partners/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Partner deleted')
        fetchPartners()
      } else {
        toast.error('Failed to delete partner')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error deleting partner')
    }
  }

  const companiesCount = partners.filter(p => p.type === 'Company').length
  const individualsCount = partners.filter(p => p.type === 'Individual').length
  const agenciesCount = partners.filter(p => p.type === 'Agency').length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 leading-tight">Channel Partners</h1>
          <p className="text-zinc-400 text-sm">Manage channel partner accounts</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Partner
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl p-5 border border-zinc-800/60 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-zinc-400 mb-1">Total Partners</p>
          <h3 className="text-2xl font-bold text-zinc-100">{partners.length}</h3>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl p-5 border border-zinc-800/60 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-zinc-400 mb-1">Companies</p>
          <h3 className="text-2xl font-bold text-blue-600">{companiesCount}</h3>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl p-5 border border-zinc-800/60 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-zinc-400 mb-1">Individuals</p>
          <h3 className="text-2xl font-bold text-green-600">{individualsCount}</h3>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl p-5 border border-zinc-800/60 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-zinc-400 mb-1">Agencies</p>
          <h3 className="text-2xl font-bold text-purple-600">{agenciesCount}</h3>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search by name, company, email, phone, or city..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none bg-zinc-900/40 backdrop-blur-xl font-medium text-zinc-300"
          >
            <option>All Partner Types</option>
            <option>Company</option>
            <option>Individual</option>
            <option>Agency</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-zinc-400 font-medium">
        Showing {partners.length} partners
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : partners.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-700/50">
           <p className="text-zinc-400">No channel partners found.</p>
        </div>
      ) : (
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-800/60 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 font-semibold uppercase border-b border-zinc-800/60">
              <tr>
                <th className="px-6 py-5">Partner Info</th>
                <th className="px-6 py-5">Contact</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5 text-center">Type</th>
                <th className="px-6 py-5">Experience</th>
                <th className="px-6 py-5 text-center">Team Size</th>
                <th className="px-6 py-5">Joined</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.map((partner) => {
                const initial = partner.name.charAt(0).toUpperCase()
                const typeColor = partner.type === 'Company' ? 'bg-blue-50 text-blue-600' 
                                : partner.type === 'Agency' ? 'bg-purple-50 text-purple-600'
                                : 'bg-green-50 text-green-600'
                const joined = new Date(partner.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                
                return (
                  <tr key={partner._id} className="hover:bg-zinc-950/50/50 transition-colors">
                    {/* Partner Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-sm shrink-0">
                          {initial}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-100">{partner.name}</div>
                          <div className="text-xs text-zinc-400">{partner.company}</div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="text-zinc-300 font-medium">{partner.phone}</div>
                      <div className="text-zinc-400 text-xs">{partner.email}</div>
                      {partner.whatsapp && (
                        <div className="text-green-500 text-[11px] font-medium mt-0.5">WhatsApp: {partner.whatsapp}</div>
                      )}
                    </td>
                    
                    {/* Location */}
                    <td className="px-6 py-4">
                      <div className="text-zinc-300 font-medium">{partner.city}</div>
                      <div className="text-zinc-400 text-xs">{partner.state}</div>
                    </td>
                    
                    {/* Type */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${typeColor}`}>
                        {partner.type}
                      </span>
                    </td>
                    
                    {/* Experience */}
                    <td className="px-6 py-4">
                      <div className="text-zinc-300 font-medium">{partner.experience || 'N/A'}</div>
                      {partner.expDesc && (
                        <div className="text-zinc-400 text-[10px] mt-0.5 truncate max-w-[120px]">{partner.expDesc}</div>
                      )}
                    </td>
                    
                    {/* Team Size */}
                    <td className="px-6 py-4 text-center font-semibold text-zinc-100">
                      {partner.teamSize || '0'}
                    </td>
                    
                    {/* Joined */}
                    <td className="px-6 py-4 text-zinc-400 text-xs font-medium whitespace-nowrap">
                      {joined}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-blue-500 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-full">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(partner._id)}
                          className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Partner Modal */}
      {isModalOpen && (
        <PartnerFormModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchPartners()
          }}
        />
      )}
    </div>
  )
}

function PartnerFormModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    whatsapp: '',
    city: '',
    state: '',
    type: 'Individual',
    experience: '',
    expDesc: '',
    teamSize: '0',
    documents: [] as DocumentInfo[]
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success('Partner added successfully!')
        onSuccess()
      } else {
        toast.error('Failed to add partner')
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
      <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/60">
          <h2 className="text-xl font-bold text-zinc-100">Add Channel Partner</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-400 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Company Name</label>
              <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Phone *</label>
              <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">WhatsApp</label>
              <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">City</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">State</label>
              <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="Individual">Individual</option>
                <option value="Company">Company</option>
                <option value="Agency">Agency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Team Size</label>
              <input type="text" value={formData.teamSize} onChange={e => setFormData({...formData, teamSize: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Experience (e.g. 4 years)</label>
              <input type="text" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Exp. Description</label>
              <input type="text" placeholder="e.g. Residential" value={formData.expDesc} onChange={e => setFormData({...formData, expDesc: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="pt-4 mt-2">
            <label className="block text-sm font-medium text-zinc-300 mb-2">Documents (Agreements, KYC, etc.)</label>
            <DocumentUpload 
              documents={formData.documents}
              onChange={(docs) => setFormData({ ...formData, documents: docs })}
              maxFiles={5}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg text-zinc-300 font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
              {saving ? 'Saving...' : 'Add Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
