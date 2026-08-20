'use client';

import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { KanbanCard, LeadType } from './KanbanCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  leads: LeadType[];
  accentColor: string;
}

export function KanbanColumn({ id, title, leads, accentColor }: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-[320px] flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${accentColor}`} />
          <h3 className="font-semibold text-zinc-100">{title}</h3>
        </div>
        <span className="text-xs font-medium text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-md">
          {leads.length}
        </span>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 min-h-[150px] rounded-2xl p-2 transition-colors duration-200
              ${snapshot.isDraggingOver ? 'bg-zinc-900/50 ring-1 ring-indigo-500/30' : 'bg-transparent'}
            `}
          >
            {leads.map((lead, index) => (
              <KanbanCard key={lead.id} lead={lead} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
