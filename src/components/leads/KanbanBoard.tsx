'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { LeadType } from './KanbanCard';
import { getLeads, updateLeadStatus } from '@/app/dashboard/leads/actions';

// Base Column Structure
const emptyColumns: Record<string, { id: string; title: string; accentColor: string; leads: LeadType[] }> = {
  'col-1': { id: 'col-1', title: 'New', accentColor: 'bg-blue-500', leads: [] },
  'col-2': { id: 'col-2', title: 'Contacted', accentColor: 'bg-purple-500', leads: [] },
  'col-3': { id: 'col-3', title: 'Qualified', accentColor: 'bg-amber-500', leads: [] },
  'col-4': { id: 'col-4', title: 'Negotiation', accentColor: 'bg-orange-500', leads: [] },
  'col-5': { id: 'col-5', title: 'Won', accentColor: 'bg-emerald-500', leads: [] },
  'col-6': { id: 'col-6', title: 'Lost', accentColor: 'bg-rose-500', leads: [] },
};

const columnOrder = ['col-1', 'col-2', 'col-3', 'col-4', 'col-5', 'col-6'];

export function KanbanBoard() {
  const [data, setData] = useState(emptyColumns);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from MongoDB via Server Actions
  useEffect(() => {
    setIsMounted(true);
    
    const fetchLeads = async () => {
      try {
        const rawLeads = await getLeads();
        
        // Group by status
        const newColumns = JSON.parse(JSON.stringify(emptyColumns)); // Deep clone
        
        rawLeads.forEach((lead: any) => {
          const formattedLead: LeadType = {
            id: lead._id,
            name: `${lead.firstName} ${lead.lastName}`,
            budget: lead.budget || 0,
            daysInStage: Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 3600 * 24)),
            priority: lead.priority || 'Medium',
            avatarInitials: `${lead.firstName.charAt(0)}${lead.lastName.charAt(0)}`.toUpperCase()
          };
          
          const status = lead.status?.toLowerCase() || 'new';
          
          if (status === 'new') newColumns['col-1'].leads.push(formattedLead);
          else if (status === 'contacted') newColumns['col-2'].leads.push(formattedLead);
          else if (status === 'qualified') newColumns['col-3'].leads.push(formattedLead);
          else if (status === 'negotiation') newColumns['col-4'].leads.push(formattedLead);
          else if (status === 'won') newColumns['col-5'].leads.push(formattedLead);
          else if (status === 'lost') newColumns['col-6'].leads.push(formattedLead);
          else newColumns['col-1'].leads.push(formattedLead); // fallback
        });
        
        setData(newColumns);
      } catch (error) {
        console.error("Failed to fetch leads", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeads();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = data[source.droppableId];
    const destCol = data[destination.droppableId];

    // Optimistic UI Update
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

    // Make API call to update the lead's stage in MongoDB
    try {
      await updateLeadStatus(movedLead.id, destCol.title.toLowerCase());
    } catch (error) {
      console.error("Failed to update lead status", error);
      // Revert could be implemented here
    }
  };

  if (!isMounted || isLoading) {
    return <div className="h-[600px] w-full animate-pulse bg-zinc-900/20 rounded-2xl flex items-center justify-center text-zinc-500">Loading Pipeline...</div>;
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
