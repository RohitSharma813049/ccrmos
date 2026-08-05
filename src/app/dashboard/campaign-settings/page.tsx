'use client'

import React, { useState, useEffect } from 'react'
import { 
  Settings2, 
  Plus, 
  Trash2, 
  UserSquare2,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CampaignSetting {
  _id: string;
  name: string;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  type: string;
  category: string;
  processed: number;
  lastSynced?: string;
  createdAt: string;
}

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export default function CampaignSettingsPage() {
  const [settings, setSettings] = useState<CampaignSetting[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchUsers()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/campaign-settings')
      const data = await res.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load campaign settings')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    try {
      const res = await fetch(`/api/campaign-settings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Configuration deleted')
        fetchSettings()
      } else {
        toast.error('Failed to delete configuration')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error deleting configuration')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Campaign Configuration</h1>
            <p className="text-slate-500 text-sm">Configure automatic lead assignment for Meta campaigns</p>
          </div>
        </div>
        <div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Configuration
          </button>
        </div>
      </div>

      {/* Configuration Cards */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : settings.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200">
           <Settings2 className="w-12 h-12 text-slate-300 mb-4" />
           <p className="text-slate-500">No campaign configurations found. Add one to start automatically assigning leads.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {settings.map((config) => (
            <div key={config._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative group">
              
              {/* Delete Button */}
              <button 
                onClick={() => handleDelete(config._id)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 opacity-50 hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-800 mb-4">{config.name}</h3>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-8 max-w-2xl mb-6">
                <div className="text-sm">
                  <span className="text-slate-500 mr-2">Assigned To:</span>
                  <span className="font-semibold text-slate-800">
                    {config.assignedTo ? `${config.assignedTo.firstName || ''} ${config.assignedTo.lastName || ''}`.trim() || config.assignedTo.email : 'Unassigned'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500 mr-2">Category:</span>
                  <span className="font-semibold text-slate-800">{config.category}</span>
                </div>
                
                <div className="text-sm">
                  <span className="text-slate-500 mr-2">Type:</span>
                  <span className="font-semibold text-slate-800">{config.type}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500 mr-2">Processed:</span>
                  <span className="font-bold text-green-600">{config.processed}</span>
                </div>
                
                <div className="text-sm col-span-2">
                  <span className="text-slate-500 mr-2">Last Synced:</span>
                  <span className="font-medium text-slate-700">
                    {config.lastSynced ? new Date(config.lastSynced).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-xs font-semibold transition-colors border border-purple-100">
                <UserSquare2 className="w-4 h-4" />
                Assign Past Unassigned Leads
              </button>
              
            </div>
          ))}
        </div>
      )}

      {/* Add Configuration Modal */}
      {isModalOpen && (
        <CampaignSettingFormModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchSettings()
          }}
          users={users}
        />
      )}
    </div>
  )
}

function CampaignSettingFormModal({ onClose, onSuccess, users }: { onClose: () => void, onSuccess: () => void, users: User[] }) {
  const [formData, setFormData] = useState({
    name: 'Dummy_Form_' + Math.floor(Math.random() * 10000),
    assignedTo: '',
    type: 'Buyer',
    category: 'Hot'
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: any = { ...formData };
      if (!payload.assignedTo) {
        delete payload.assignedTo;
      }
      
      const res = await fetch('/api/campaign-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        toast.success('Configuration saved!')
        onSuccess()
      } else {
        toast.error('Failed to save configuration')
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Add Configuration</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name (Form ID) *</label>
            <input required type="text" placeholder="e.g., RASA Estate - Form 5" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Auto-Assign To</label>
            <select value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.firstName ? `${u.firstName} ${u.lastName}` : u.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lead Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
              <option value="Renter">Renter</option>
              <option value="Investor">Investor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lead Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg text-slate-700 font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Config'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
