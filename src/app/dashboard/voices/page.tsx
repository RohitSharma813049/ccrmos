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
}

export default function VoicesPage() {
  const [activeTab, setActiveTab] = useState('All Voices')
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-fuchsia-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/20">
            <Volume2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-fuchsia-600">ElevenLabs Voice Manager</h1>
            <p className="text-slate-500 text-sm">Advanced AI voice management & cloning</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchVoices} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-colors shadow-sm text-sm">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm text-sm">
            <Plus className="w-4 h-4" />
            Add Voice
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Tabs Navigation */}
        <div className="flex items-center gap-6 px-6 border-b border-slate-100 overflow-x-auto custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.name 
                  ? 'border-purple-500 text-purple-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          {activeTab === 'All Voices' ? (
            <>
              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search voices by name or category..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                  />
                </div>
                <div className="px-4 py-2 bg-slate-50 text-slate-600 font-semibold text-sm rounded-xl border border-slate-200">
                  {voices.length} voices
                </div>
              </div>

              {/* Preview Text Box */}
              <div className="bg-fuchsia-50/50 rounded-xl p-4 border border-fuchsia-100/50">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Preview Text (for voice testing)
                </label>
                <textarea 
                  rows={2}
                  className="w-full border border-fuchsia-100 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-300 resize-none"
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
                  <p className="text-slate-500 font-medium">
                    No voices found. Click "Add Voice" to create one.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {voices.map(voice => (
                    <div key={voice._id} className="border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:border-purple-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                          <Volume2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{voice.name}</h4>
                          <p className="text-xs text-slate-500">{voice.category} • ID: {voice.voiceId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(voice._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Settings className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">{activeTab}</h3>
              <p className="text-slate-500 font-medium max-w-sm">
                The {activeTab} section is currently under construction. Please check back later!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Voice Modal */}
      {isModalOpen && (
        <VoiceFormModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchVoices()
          }}
        />
      )}
    </div>
  )
}

function VoiceFormModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Custom',
    description: '',
  })
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('category', formData.category)
      data.append('description', formData.description)
      
      if (audioFile) {
        data.append('file', audioFile)
      }

      const res = await fetch('/api/ai/voices', {
        method: 'POST',
        // Do NOT set Content-Type header when sending FormData
        body: data
      })
      if (res.ok) {
        toast.success('Voice created successfully!')
        onSuccess()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to create voice')
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Add New Voice</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Voice Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Emma" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="Custom">Custom</option>
              <option value="Cloned">Cloned</option>
              <option value="Premade">Premade</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" rows={3} placeholder="A brief description of this voice..."></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Audio Sample / Recording</label>
            <input 
              type="file" 
              accept="audio/*" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setAudioFile(file);
                }
              }}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" 
            />
            {audioFile && <p className="text-xs text-green-600 mt-2">File selected: {audioFile.name}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg text-slate-700 font-medium hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Voice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
