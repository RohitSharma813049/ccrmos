import React from 'react'
import { Bot, Phone, Clock, Globe, Edit2, Trash2, Link as LinkIcon, Plus, Users } from 'lucide-react'

const agents = [
  {
    id: 1,
    name: 'Customer Support Agent',
    role: 'Senior Support Specialist',
    status: 'ACTIVE',
    languages: 'English, Hindi',
    phone: '+1234567890',
    maxDuration: '5:00'
  },
  {
    id: 2,
    name: 'Sales Agent',
    role: 'Sales Representative',
    status: 'ACTIVE',
    languages: 'English, Spanish',
    phone: '+1987654321',
    maxDuration: '10:00'
  }
]

export default function AiAgentsPage() {
  return (
    <div className="min-h-full rounded-2xl bg-[var(--surface)] p-8 text-[var(--ink)] shadow-sm border border-[var(--rule)] font-sans">
      {/* Top Navigation Pills */}
      <div className="flex gap-2 mb-8 p-1 bg-[var(--rule)]/50 rounded-xl max-w-fit">
        <button className="flex items-center gap-2 px-8 py-2.5 bg-white rounded-lg text-sm font-semibold shadow-sm text-[var(--violet)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet)] transition-shadow">
          <Users className="w-4 h-4" />
          Agents
        </button>
        <button className="flex items-center gap-2 px-8 py-2.5 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet)] rounded-lg">
          <Phone className="w-4 h-4" />
          Call List
        </button>
        <button className="flex items-center gap-2 px-8 py-2.5 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet)] rounded-lg">
          <Clock className="w-4 h-4" />
          Call History
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1 font-serif text-[var(--ink)]">AI Agents</h1>
          <p className="text-[var(--ink-muted)] text-sm">Manage your AI voice agents</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--rule)] hover:border-[var(--violet)] hover:text-[var(--violet)] rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet)] shadow-sm">
            <LinkIcon className="w-4 h-4" />
            Connect API
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--violet)] text-white hover:bg-[var(--violet-mid)] rounded-lg text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet)] focus-visible:ring-offset-2">
            <Plus className="w-4 h-4" />
            Create Agent
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white border border-[var(--rule)] rounded-[12px] p-6 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow relative overflow-hidden group">
            {/* Status Badge */}
            <div className="absolute top-6 right-6">
              <span className="text-[10px] font-bold bg-[#16A34A]/10 text-[#16A34A] px-2.5 py-1 rounded-md tracking-wider uppercase">
                {agent.status}
              </span>
            </div>

            {/* Agent Info */}
            <div className="flex gap-4 mb-6">
              <div className="w-12 h-12 bg-[var(--violet-soft)] rounded-lg flex items-center justify-center border border-[var(--violet-line)] shrink-0 group-hover:bg-[var(--violet)] group-hover:text-white transition-colors">
                <Bot className="w-6 h-6 text-[var(--violet)] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--ink)] leading-tight">{agent.name}</h3>
                <p className="text-xs text-[var(--ink-muted)] mt-1">{agent.role}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-[var(--ink)]">
                <Globe className="w-4 h-4 text-[var(--ink-muted)]" />
                {agent.languages}
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--ink)]">
                <Phone className="w-4 h-4 text-[var(--ink-muted)]" />
                {agent.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--ink)]">
                <Clock className="w-4 h-4 text-[var(--ink-muted)]" />
                Max {agent.maxDuration}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-[var(--rule)] hover:border-[var(--violet)] hover:text-[var(--violet)] rounded-lg text-sm font-medium transition-colors text-[var(--ink)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet)]">
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-[var(--rule)] hover:bg-[#DC2626]/5 hover:border-[#DC2626]/20 text-[#DC2626] rounded-lg text-sm font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]">
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

