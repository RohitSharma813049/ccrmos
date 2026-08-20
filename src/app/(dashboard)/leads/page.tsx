import React from 'react';
import { Plus, Filter, SlidersHorizontal } from 'lucide-react';
import { KanbanBoard } from '@/components/leads/KanbanBoard';

export default function LeadsPage() {
  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Pipeline</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Drag and drop leads to update their lifecycle stage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 rounded-xl hover:bg-zinc-800 hover:text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-700">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 rounded-xl hover:bg-zinc-800 hover:text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-700">
            <SlidersHorizontal className="w-4 h-4" />
            View
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-sm font-semibold text-white rounded-xl shadow-sm shadow-indigo-500/20 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950">
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* The Kanban Board */}
      <div className="flex-1 relative">
        <KanbanBoard />
      </div>

    </div>
  );
}
