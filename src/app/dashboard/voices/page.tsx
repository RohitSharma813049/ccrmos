'use client'

import React, { useState, useEffect } from 'react'
import { 
  Volume2, 
  RefreshCcw, 
  Search, 
  Settings, 
  Trash2, 
  Edit3, 
  Copy, 
  Info,
  VolumeX,
  Plus,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Voice {
  _id: string;
  name: string;
  voiceId: string;
  category: string;
  description: string;
  createdAt: string;
  isElevenLabs?: boolean;
}

export default function VoicesPage() {
  const [activeTab, setActiveTab] = useState('All Voices')
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVoice, setEditingVoice] = useState<Voice | null>(null)

  const tabs = [
    { name: 'All Voices', icon: Volume2 },
    { name: 'Voice Details', icon: Search },
    { name: 'Clone Voice', icon: Copy },
    { name: 'Edit Voice', icon: Edit3 },
    { name: 'API Settings', icon: Settings }
  ]

  useEffect(() => {
    fetchVoices()
  }, [searchQuery])

  const fetchVoices = async () => {
    setLoading(true)
    try {
      let url = '/api/ai/voices'
      if (searchQuery) url += `?search=${searchQuery}`
      
      const res = await fetch(url)
      const data = await res.json()
      if (data.voices) {
        setVoices(data.voices)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load voices')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this voice?')) return;
    try {
      const res = await fetch(`/api/ai/voices/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Voice deleted')
        fetchVoices()
      } else {
        toast.error('Failed to delete voice')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error deleting voice')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Card */}
      <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/60 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-fuchsia-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/20">
            <Volume2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-fuchsia-600">ElevenLabs Voice Manager</h1>
            <p className="text-zinc-400 text-sm">Advanced AI voice management & cloning</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchVoices} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 text-zinc-300 hover:bg-zinc-950/50 rounded-xl font-medium transition-colors shadow-sm text-sm">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
          <button onClick={() => { setEditingVoice(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm text-sm">
            <Plus className="w-4 h-4" />
            Add Voice
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-800/60 shadow-sm overflow-hidden">
        
        {/* Tabs Navigation */}
        <div className="flex items-center gap-6 px-6 border-b border-zinc-800/60 overflow-x-auto custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.name 
                  ? 'border-purple-500 text-purple-600' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search voices by name or category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
              />
            </div>
            <div className="px-4 py-2 bg-zinc-950/50 text-zinc-400 font-semibold text-sm rounded-xl border border-zinc-700/50">
              {voices.length} voices
            </div>
          </div>

          {/* Preview Text Box */}
          <div className="bg-fuchsia-50/50 rounded-xl p-4 border border-fuchsia-100/50">
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Preview Text (for voice testing)
            </label>
            <textarea 
              rows={2}
              className="w-full border border-fuchsia-100 rounded-lg p-3 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-300 resize-none"
              defaultValue="Hello, this is a voice preview."
            ></textarea>
          </div>

          {/* Voice List */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500"></div>
            </div>
          ) : voices.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <VolumeX className="w-16 h-16 text-slate-200 mb-4" />
              <p className="text-zinc-400 font-medium">
                No voices found. Click "Add Voice" to create one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {voices.map(voice => (
                <div key={voice._id} className="border border-zinc-800/60 rounded-xl p-4 flex items-center justify-between hover:border-purple-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-100">{voice.name}</h4>
                      <p className="text-xs text-zinc-400">{voice.category} • ID: {voice.voiceId}</p>
                    </div>
                  </div>
                  {!voice.isElevenLabs && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingVoice(voice); setIsModalOpen(true); }} className="p-2 text-zinc-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(voice._id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {voice.isElevenLabs && (
                    <div className="px-2 py-1 bg-zinc-800/50 text-zinc-400 text-xs rounded font-medium">
                      ElevenLabs
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Add/Edit Voice Modal */}
      {isModalOpen && (
        <VoiceFormModal 
          voiceToEdit={editingVoice}
          onClose={() => {
            setIsModalOpen(false)
            setEditingVoice(null)
          }}
          onSuccess={() => {
            setIsModalOpen(false)
            setEditingVoice(null)
            fetchVoices()
          }}
        />
      )}
    </div>
  )
}

function VoiceFormModal({ onClose, onSuccess, voiceToEdit }: { onClose: () => void, onSuccess: () => void, voiceToEdit?: Voice | null }) {
  const [formData, setFormData] = useState({
    name: voiceToEdit?.name || '',
    category: voiceToEdit?.category || 'Custom',
    description: voiceToEdit?.description || ''
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const isEdit = !!voiceToEdit;
      const url = isEdit ? `/api/ai/voices/${voiceToEdit._id}` : '/api/ai/voices';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success(`Voice ${isEdit ? 'updated' : 'created'} successfully!`)
        onSuccess()
      } else {
        toast.error(`Failed to ${isEdit ? 'update' : 'create'} voice`)
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
      <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/60">
          <h2 className="text-xl font-bold text-zinc-100">{voiceToEdit ? 'Edit Voice' : 'Add New Voice'}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-400 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Voice Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Emma" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="Custom">Custom</option>
              <option value="Cloned">Cloned</option>
              <option value="Premade">Premade</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" rows={3} placeholder="A brief description of this voice..."></textarea>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg text-zinc-300 font-medium hover:bg-zinc-950/50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50">
              {saving ? (voiceToEdit ? 'Updating...' : 'Saving...') : (voiceToEdit ? 'Update Voice' : 'Save Voice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
