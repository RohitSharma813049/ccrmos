'use client'

import React, { useState, useEffect } from 'react'
import { Bot, Phone, Clock, Globe, Edit2, Trash2, Link as LinkIcon, Plus, Users, X, AudioLines } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Agent {
  _id: string;
  name: string;
  role: string;
  status: string;
  languages: string;
  phone: string;
  maxDuration: string;
  greetingAudioUrl?: string;
  avatarUrl?: string;
}

export default function AiAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [activeTab, setActiveTab] = useState<'agents' | 'call-list' | 'call-history'>('agents')

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/agents')
      const data = await res.json()
      if (data.agents) {
        setAgents(data.agents)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load AI agents')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this AI Agent?')) return;
    try {
      const res = await fetch(`/api/ai/agents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Agent deleted')
        fetchAgents()
      } else {
        toast.error('Failed to delete agent')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error deleting agent')
    }
  }

  return (
    <div className="min-h-full rounded-2xl bg-[var(--card)] p-8 text-[var(--foreground)] shadow-sm border border-[var(--border)] font-sans">
      {/* Top Navigation Pills */}
      <div className="flex gap-2 mb-8 p-1 bg-[var(--border)]/50 rounded-xl max-w-fit">
        <button 
          onClick={() => setActiveTab('agents')}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-semibold transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${activeTab === 'agents' ? 'bg-white shadow-sm text-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
        >
          <Users className="w-4 h-4" />
          Agents
        </button>
        <button 
          onClick={() => setActiveTab('call-list')}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-semibold transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${activeTab === 'call-list' ? 'bg-white shadow-sm text-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
        >
          <Phone className="w-4 h-4" />
          Call List
        </button>
        <button 
          onClick={() => setActiveTab('call-history')}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-semibold transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${activeTab === 'call-history' ? 'bg-white shadow-sm text-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
        >
          <Clock className="w-4 h-4" />
          Call History
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1 font-serif text-[var(--foreground)]">AI Agents</h1>
          <p className="text-[var(--muted-foreground)] text-sm">Manage your AI voice agents</p>
        </div>
        <div className="flex gap-3">
          <a 
            href="/dashboard/settings/integrations"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] shadow-sm"
          >
            <LinkIcon className="w-4 h-4" />
            Connect API
          </a>
          <button 
            onClick={() => { setEditingAgent(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white hover:bg-[var(--primary)] rounded-lg text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            Create Agent
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'agents' && (
        <>
          {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
        </div>
      ) : agents.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-[12px] border border-[var(--border)] shadow-sm p-6">
          <Bot className="w-12 h-12 text-[var(--muted-foreground)] mb-4" />
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">No AI Agents</h3>
          <p className="text-[var(--muted-foreground)]">You have not created any AI Agents yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent._id} className="bg-white border border-[var(--border)] rounded-[12px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Status Badge */}
              <div className="absolute top-6 right-6">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase ${
                  agent.status === 'ACTIVE' 
                    ? 'bg-[#16A34A]/10 text-[#16A34A]' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {agent.status}
                </span>
              </div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner overflow-hidden shrink-0" style={{ 
                    background: agent.avatarUrl ? 'transparent' : 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
                    color: 'white'
                  }}>
                    {agent.avatarUrl ? (
                      <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                    ) : (
                      <Bot className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[var(--foreground)] leading-tight">{agent.name}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{agent.role}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-[var(--foreground)]">
                  <Globe className="w-4 h-4 text-[var(--muted-foreground)]" />
                  {agent.languages}
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--foreground)]">
                  <Phone className="w-4 h-4 text-[var(--muted-foreground)]" />
                  {agent.phone || 'No phone assigned'}
                </div>
                {agent.greetingAudioUrl && (
                  <div className="flex items-center gap-3 text-sm text-[var(--foreground)]">
                    <AudioLines className="w-4 h-4 text-[var(--primary)]" />
                    Custom Greeting Set
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-[var(--foreground)]">
                  <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                  Max {agent.maxDuration}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => { setEditingAgent(agent); setIsModalOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] rounded-lg text-sm font-medium transition-colors text-[var(--foreground)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(agent._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-[var(--border)] hover:bg-[#DC2626]/5 hover:border-[#DC2626]/20 text-[#DC2626] rounded-lg text-sm font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}

      {activeTab === 'call-list' && (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-[12px] border border-[var(--border)] shadow-sm p-6">
          <Phone className="w-12 h-12 text-[var(--muted-foreground)] mb-4" />
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Call List</h3>
          <p className="text-[var(--muted-foreground)]">Your active calls and queues will appear here.</p>
        </div>
      )}

      {activeTab === 'call-history' && (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-[12px] border border-[var(--border)] shadow-sm p-6">
          <Clock className="w-12 h-12 text-[var(--muted-foreground)] mb-4" />
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Call History</h3>
          <p className="text-[var(--muted-foreground)]">Past call logs and recordings will appear here.</p>
        </div>
      )}

      {/* Add/Edit Agent Modal */}
      {isModalOpen && (
        <AgentFormModal 
          agentToEdit={editingAgent}
          onClose={() => {
            setIsModalOpen(false)
            setEditingAgent(null)
          }}
          onSuccess={() => {
            setIsModalOpen(false)
            setEditingAgent(null)
            fetchAgents()
          }}
        />
      )}

    </div>
  )
}

const AI_ROLES = [
  { value: '', label: 'Select a role...', hasPermission: true },
  { value: 'Sales Agent', label: 'Sales Agent', hasPermission: true },
  { value: 'Support Agent', label: 'Support Agent', hasPermission: true },
  { value: 'Lead Qualifier', label: 'Lead Qualifier (No Permission)', hasPermission: false },
  { value: 'Admin Agent', label: 'Admin Agent (No Permission)', hasPermission: false },
];

const LANGUAGES = ['English', 'Hindi', 'Hinglish','Spanish', 'French', 'German', 'Mandarin'];

function AgentFormModal({ onClose, onSuccess, agentToEdit }: { onClose: () => void, onSuccess: () => void, agentToEdit?: Agent | null }) {
  const [mediaOptions, setMediaOptions] = useState<{url: string, name: string}[]>([])

  useEffect(() => {
    fetch('/api/ai/media').then(r => r.json()).then(d => {
      if (d.media) setMediaOptions(d.media);
    }).catch(console.error)
  }, [])

  const [formData, setFormData] = useState({
    name: agentToEdit?.name || '',
    role: agentToEdit?.role || '',
    languages: agentToEdit?.languages || 'English',
    phone: agentToEdit?.phone || '',
    maxDuration: agentToEdit?.maxDuration || '5:00',
    status: agentToEdit?.status || 'ACTIVE',
    greetingAudioUrl: agentToEdit?.greetingAudioUrl || '',
    avatarUrl: agentToEdit?.avatarUrl || ''
  })
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const data = new FormData()
      data.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      })
      if (!res.ok) throw new Error('Upload failed')
      const json = await res.json()
      setFormData({ ...formData, avatarUrl: json.url })
      toast.success('Avatar uploaded!')
    } catch (err: any) {
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const selectedRole = AI_ROLES.find(r => r.value === formData.role);
  const hasPermission = selectedRole ? selectedRole.hasPermission : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return; // Prevent double submission
    setSaving(true)
    try {
      const isEdit = !!agentToEdit;
      const url = isEdit ? `/api/ai/agents/${agentToEdit._id}` : '/api/ai/agents';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success(`Agent ${isEdit ? 'updated' : 'created'} successfully!`)
        onSuccess()
      } else {
        toast.error('Failed to create agent')
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
          <h2 className="text-xl font-bold text-[var(--foreground)]">{agentToEdit ? 'Edit AI Agent' : 'Create AI Agent'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Bot className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Avatar Image (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)] file:text-white hover:file:opacity-90 transition-opacity" />
              {uploadingImage && <p className="text-xs text-[var(--primary)] mt-1 animate-pulse">Uploading...</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Agent Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-slate-900 bg-white" placeholder="e.g. Sales Agent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Role *</label>
            <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-slate-900 bg-white appearance-none">
              {AI_ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            {formData.role && !hasPermission && (
              <p className="text-sm text-red-500 mt-1">This role does not have permission to be an AI agent.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Languages</label>
            <select value={formData.languages} onChange={e => setFormData({...formData, languages: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-slate-900 bg-white appearance-none">
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Phone Number (Optional)</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-slate-900 bg-white" placeholder="+1234567890" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Greeting Audio</label>
            <select value={formData.greetingAudioUrl} onChange={e => setFormData({...formData, greetingAudioUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-slate-900 bg-white appearance-none">
              <option value="">Default AI Greeting</option>
              {mediaOptions.map(m => (
                <option key={m.url} value={m.url}>{m.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg text-[var(--foreground)] font-medium hover:bg-slate-50">Cancel</button>
            {hasPermission && (
              <button type="submit" disabled={saving || !formData.role} className="px-5 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary)] disabled:opacity-50">
                {saving ? (agentToEdit ? 'Updating...' : 'Creating...') : (agentToEdit ? 'Update Agent' : 'Create Agent')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
