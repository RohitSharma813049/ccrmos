'use client'

import React, { useState, useEffect } from 'react'
import { Bot, Phone, Clock, Globe, Edit2, Trash2, Link as LinkIcon, Plus, Users, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Agent {
  _id: string;
  name: string;
  role: string;
  status: string;
  languages: string;
  phone: string;
  maxDuration: string;
}

export default function AiAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
        <button className="flex items-center gap-2 px-8 py-2.5 bg-white rounded-lg text-sm font-semibold shadow-sm text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-shadow">
          <Users className="w-4 h-4" />
          Agents
        </button>
        <button className="flex items-center gap-2 px-8 py-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-lg">
          <Phone className="w-4 h-4" />
          Call List
        </button>
        <button className="flex items-center gap-2 px-8 py-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-lg">
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
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] shadow-sm">
            <LinkIcon className="w-4 h-4" />
            Connect API
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white hover:bg-[var(--primary)] rounded-lg text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            Create Agent
          </button>
        </div>
      </div>

      {/* Agents Grid */}
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

              {/* Agent Info */}
              <div className="flex gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 shrink-0 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                  <Bot className="w-6 h-6 text-[var(--primary)] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)] leading-tight">{agent.name}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{agent.role}</p>
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
                <div className="flex items-center gap-3 text-sm text-[var(--foreground)]">
                  <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                  Max {agent.maxDuration}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] rounded-lg text-sm font-medium transition-colors text-[var(--foreground)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]">
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

      {/* Add Agent Modal */}
      {isModalOpen && (
        <AgentFormModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchAgents()
          }}
        />
      )}
    </div>
  )
}

function AgentFormModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    languages: 'English',
    phone: '',
    maxDuration: '5:00',
    status: 'ACTIVE'
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/ai/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success('Agent created successfully!')
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
          <h2 className="text-xl font-bold text-[var(--foreground)]">Create AI Agent</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Agent Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-slate-900 bg-white" placeholder="e.g. Sales Agent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Role *</label>
            <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-slate-900 bg-white" placeholder="e.g. Senior Support Specialist" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Languages</label>
            <input type="text" value={formData.languages} onChange={e => setFormData({...formData, languages: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-slate-900 bg-white" placeholder="e.g. English, Spanish" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Phone Number (Optional)</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-slate-900 bg-white" placeholder="+1234567890" />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg text-[var(--foreground)] font-medium hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary)] disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
