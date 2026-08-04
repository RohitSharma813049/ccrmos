'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Tag,
  Edit3,
  Trash2,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface LeadStatus {
  _id: string;
  name: string;
  category: string;
  active: boolean;
  iconColor: string;
  createdAt: string;
}

export default function LeadStatusPage() {
  const [statuses, setStatuses] = useState<LeadStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchStatuses()
  }, [searchQuery, filterType])

  const fetchStatuses = async () => {
    setLoading(true)
    try {
      let url = '/api/lead-status?'
      if (searchQuery) url += `search=${searchQuery}&`
      if (filterType !== 'All') url += `filter=${filterType}&`
      
      const res = await fetch(url)
      const data = await res.json()
      if (data.statuses) {
        setStatuses(data.statuses)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load statuses')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this status?')) return;
    try {
      const res = await fetch(`/api/lead-status/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Status deleted')
        fetchStatuses()
      } else {
        toast.error('Failed to delete status')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error deleting status')
    }
  }

  const handleToggleActive = async (status: LeadStatus) => {
    try {
      const res = await fetch(`/api/lead-status/${status._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !status.active })
      })
      if (res.ok) {
        toast.success(`Status marked as ${!status.active ? 'Active' : 'Inactive'}`)
        fetchStatuses()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const activeCount = statuses.filter(s => s.active).length
  const inactiveCount = statuses.length - activeCount

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lead Status</h1>
          <p className="text-slate-500 text-sm">Define and manage lead status types</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
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
          <h3 className="text-3xl font-bold text-blue-800">{statuses.length}</h3>
        </div>
        {/* Card 2 */}
        <div className="bg-green-50/50 rounded-2xl p-5 border border-green-100 shadow-sm">
          <p className="text-sm font-medium text-green-600 mb-1">Active Status</p>
          <h3 className="text-3xl font-bold text-green-700">{activeCount}</h3>
        </div>
        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Inactive Status</p>
          <h3 className="text-3xl font-bold text-slate-800">{inactiveCount}</h3>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search lead status..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {['All', 'Active', 'Inactive'].map(f => (
            <button 
              key={f}
              onClick={() => setFilterType(f)}
              className={`flex-1 sm:flex-none px-6 py-2 font-medium text-sm rounded-lg transition-colors ${
                filterType === f ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Status Cards */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : statuses.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <Tag className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500">No lead statuses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statuses.map((status) => {
            const catColor = status.category === 'Interested' ? 'bg-green-100 text-green-600' :
                             status.category === 'Not Interested' ? 'bg-red-100 text-red-600' :
                             'bg-slate-100 text-slate-600';
            const CatIcon = status.category === 'Interested' ? TrendingUp : TrendingDown;
            const createdDate = new Date(status.createdAt).toLocaleDateString();

            return (
              <div key={status._id} className={`bg-white rounded-2xl p-6 border ${status.active ? 'border-slate-100' : 'border-slate-200 opacity-60 grayscale'} shadow-sm hover:shadow-md transition-all relative`}>
                
                {/* Action Buttons */}
                <div className="absolute top-6 right-6 flex items-center gap-3">
                  <button 
                    onClick={() => handleDelete(status._id)}
                    className="text-red-400 hover:text-red-600 transition-colors bg-white rounded-full p-1 shadow-sm"
                  >
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
                  </div>

                  {/* Category Pill */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold ${catColor}`}>
                    <CatIcon className="w-3.5 h-3.5" />
                    {status.category}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    Created {createdDate}
                  </span>
                  
                  <button 
                    onClick={() => handleToggleActive(status)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                      status.active 
                        ? 'text-green-600 bg-green-50 hover:bg-red-50 hover:text-red-600' 
                        : 'text-slate-500 bg-slate-100 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    {status.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Status Modal */}
      {isModalOpen && (
        <LeadStatusFormModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchStatuses()
          }}
        />
      )}
    </div>
  )
}

function LeadStatusFormModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Interested',
    iconColor: 'bg-blue-500'
  })
  const [saving, setSaving] = useState(false)

  const colors = [
    { label: 'Blue', value: 'bg-blue-500' },
    { label: 'Green', value: 'bg-green-500' },
    { label: 'Red', value: 'bg-red-500' },
    { label: 'Purple', value: 'bg-purple-500' },
    { label: 'Pink', value: 'bg-pink-500' },
    { label: 'Teal', value: 'bg-teal-600' },
    { label: 'Orange', value: 'bg-orange-500' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/lead-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success('Status added successfully!')
        onSuccess()
      } else {
        toast.error('Failed to add status')
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Add Lead Status</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status Name *</label>
            <input required type="text" placeholder="e.g. Site Visit Scheduled" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
              <option value="Interested">Interested</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Neutral">Neutral</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Color Badge</label>
            <div className="flex flex-wrap gap-3">
              {colors.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFormData({...formData, iconColor: c.value})}
                  className={`w-8 h-8 rounded-full ${c.value} ${formData.iconColor === c.value ? 'ring-4 ring-offset-2 ring-slate-300 shadow-lg' : ''}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg text-slate-700 font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
