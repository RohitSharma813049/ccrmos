'use client';

import React, { useState } from 'react';
import { Plus, Search, Calendar, FolderKanban, MoreHorizontal, Clock, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  client: string;
  type: 'Escrow' | 'Renovation' | 'Onboarding' | 'Marketing';
  status: 'On Track' | 'At Risk' | 'Delayed' | 'Completed';
  progress: number;
  dueDate: string;
  assigneeInitials: string;
}

const mockProjects: Project[] = [
  { id: '1', title: '123 Ocean Dr - Escrow', client: 'Sarah Jenkins', type: 'Escrow', status: 'On Track', progress: 65, dueDate: 'Aug 30, 2026', assigneeInitials: 'ES' },
  { id: '2', title: 'Kitchen Remodel - 456 City Center', client: 'Michael Chen', type: 'Renovation', status: 'Delayed', progress: 30, dueDate: 'Sep 15, 2026', assigneeInitials: 'CA' },
  { id: '3', title: 'New Agent Onboarding - Team Alpha', client: 'Emily Davis', type: 'Onboarding', status: 'On Track', progress: 90, dueDate: 'Aug 22, 2026', assigneeInitials: 'M' },
  { id: '4', title: 'Fall Advertising Campaign', client: 'Acme Corp', type: 'Marketing', status: 'At Risk', progress: 45, dueDate: 'Sep 01, 2026', assigneeInitials: 'TA' },
  { id: '5', title: '789 Pine Ln - Escrow', client: 'Robert Taylor', type: 'Escrow', status: 'Completed', progress: 100, dueDate: 'Aug 15, 2026', assigneeInitials: 'JM' },
  { id: '6', title: 'Landscaping - Estate #4', client: 'Amanda Lewis', type: 'Renovation', status: 'On Track', progress: 15, dueDate: 'Oct 10, 2026', assigneeInitials: 'ES' },
];

export function ProjectsClient() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Escrow' | 'Renovation' | 'Other'>('All');

  const filteredProjects = mockProjects.filter(project => {
    if (activeTab === 'Escrow' && project.type !== 'Escrow') return false;
    if (activeTab === 'Renovation' && project.type !== 'Renovation') return false;
    if (activeTab === 'Other' && (project.type === 'Escrow' || project.type === 'Renovation')) return false;
    
    if (search && !project.title.toLowerCase().includes(search.toLowerCase()) && !project.client.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'On Track': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'At Risk': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'Delayed': return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'Completed': return <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'At Risk': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Delayed': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Completed': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Escrow': return 'bg-purple-500';
      case 'Renovation': return 'bg-orange-500';
      case 'Onboarding': return 'bg-cyan-500';
      case 'Marketing': return 'bg-pink-500';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/60 p-1 rounded-xl">
          {['All', 'Escrow', 'Renovation', 'Other'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-zinc-800/80 text-zinc-100 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-zinc-900/50 border border-zinc-800/60 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-sm font-semibold text-white rounded-xl shadow-sm transition-all active:scale-95">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div 
            key={project.id}
            className="group relative bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-800/60 p-5 hover:border-zinc-700/80 transition-all shadow-sm hover:shadow-xl hover:-translate-y-0.5"
          >
            {/* Top Row: Type & Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getTypeColor(project.type)}`} />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{project.type}</span>
              </div>
              <button className="text-zinc-500 hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100 p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Client */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-zinc-100 mb-1">{project.title}</h3>
              <p className="text-sm text-zinc-400">Client: <span className="text-zinc-300 font-medium">{project.client}</span></p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-zinc-300">Progress</span>
                <span className="text-xs font-bold text-zinc-400">{project.progress}%</span>
              </div>
              <div className="w-full bg-zinc-800/50 rounded-full h-2.5 border border-zinc-800/80">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-1000 ${
                    project.progress === 100 ? 'bg-blue-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Bottom Row: Status, Date, Avatar */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60">
              <div className="flex flex-col gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  {project.status}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 opacity-70" />
                  <span className={project.status === 'Delayed' ? 'text-rose-400 font-semibold' : ''}>
                    {project.dueDate}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 border border-zinc-700 shadow-sm">
                {project.assigneeInitials}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800/80 rounded-2xl bg-zinc-900/20">
          <FolderKanban className="w-12 h-12 text-zinc-700 mb-4" />
          <h3 className="text-lg font-medium text-zinc-300">No projects found</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm">
            Try adjusting your search filters or create a new project to get started.
          </p>
        </div>
      )}
    </div>
  );
}
