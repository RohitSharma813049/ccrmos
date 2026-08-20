'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { MoreHorizontal, Clock, DollarSign } from 'lucide-react';

export interface LeadType {
  id: string;
  name: string;
  budget: number;
  daysInStage: number;
  priority: 'High' | 'Medium' | 'Low';
  avatarInitials: string;
}

interface KanbanCardProps {
  lead: LeadType;
  index: number;
}

export function KanbanCard({ lead, index }: KanbanCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            mb-3 p-4 rounded-xl border bg-zinc-900/80 backdrop-blur-sm transition-all duration-200 group
            ${snapshot.isDragging 
              ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10 rotate-2' 
              : 'border-zinc-800/60 hover:border-zinc-700/80 shadow-sm'
            }
          `}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-300 ring-1 ring-white/5">
                {lead.avatarInitials}
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-100">{lead.name}</h4>
                <div className={`mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border w-fit ${getPriorityColor(lead.priority)}`}>
                  {lead.priority} Priority
                </div>
              </div>
            </div>
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/60 pt-3 mt-1">
            <div className="flex items-center gap-1.5 bg-zinc-950/50 px-2 py-1 rounded-md">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-medium">{(lead.budget / 1000).toFixed(0)}k</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{lead.daysInStage}d</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
