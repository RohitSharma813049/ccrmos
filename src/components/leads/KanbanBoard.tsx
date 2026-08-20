'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { LeadType } from './KanbanCard';

// Initial Mock Data
const initialData: Record<string, { id: string; title: string; accentColor: string; leads: LeadType[] }> = {
  'col-1': {
    id: 'col-1',
    title: 'New',
    accentColor: 'bg-blue-500',
    leads: [
      { id: 'lead-1', name: 'Eleanor Shellstrop', budget: 1200000, daysInStage: 2, priority: 'High', avatarInitials: 'ES' },
      { id: 'lead-2', name: 'Chidi Anagonye', budget: 850000, daysInStage: 1, priority: 'Medium', avatarInitials: 'CA' },
    ],
  },
  'col-2': {
    id: 'col-2',
    title: 'Contacted',
    accentColor: 'bg-purple-500',
    leads: [
      { id: 'lead-3', name: 'Tahani Al-Jamil', budget: 4500000, daysInStage: 4, priority: 'High', avatarInitials: 'TA' },
    ],
  },
  'col-3': {
    id: 'col-3',
    title: 'Qualified',
    accentColor: 'bg-amber-500',
    leads: [
      { id: 'lead-4', name: 'Jason Mendoza', budget: 350000, daysInStage: 7, priority: 'Low', avatarInitials: 'JM' },
      { id: 'lead-5', name: 'Michael', budget: 2100000, daysInStage: 3, priority: 'Medium', avatarInitials: 'M' },
    ],
  },
  'col-4': {
    id: 'col-4',
    title: 'Negotiation',
    accentColor: 'bg-orange-500',
    leads: [],
  },
  'col-5': {
    id: 'col-5',
    title: 'Won',
    accentColor: 'bg-emerald-500',
    leads: [],
  },
  'col-6': {
    id: 'col-6',
    title: 'Lost',
    accentColor: 'bg-rose-500',
    leads: [],
  },
};

const columnOrder = ['col-1', 'col-2', 'col-3', 'col-4', 'col-5', 'col-6'];

export function KanbanBoard() {
  const [data, setData] = useState(initialData);
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration mismatch for dnd
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = data[source.droppableId];
    const destCol = data[destination.droppableId];

    // Moving within the same column
    if (sourceCol.id === destCol.id) {
      const newLeads = Array.from(sourceCol.leads);
      const [movedLead] = newLeads.splice(source.index, 1);
      newLeads.splice(destination.index, 0, movedLead);

      setData({
        ...data,
        [sourceCol.id]: {
          ...sourceCol,
          leads: newLeads,
        },
      });
      return;
    }

    // Moving to a different column
    const sourceLeads = Array.from(sourceCol.leads);
    const [movedLead] = sourceLeads.splice(source.index, 1);
    
    const destLeads = Array.from(destCol.leads);
    destLeads.splice(destination.index, 0, movedLead);

    setData({
      ...data,
      [sourceCol.id]: {
        ...sourceCol,
        leads: sourceLeads,
      },
      [destCol.id]: {
        ...destCol,
        leads: destLeads,
      },
    });

    // Here you would typically make an API call to update the lead's stage in the database
  };

  if (!isMounted) {
    return <div className="h-[600px] w-full animate-pulse bg-zinc-900/20 rounded-2xl"></div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-8 pt-4 px-2 min-h-[calc(100vh-220px)] scrollbar-hide">
        {columnOrder.map((colId) => {
          const column = data[colId];
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              leads={column.leads}
              accentColor={column.accentColor}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
