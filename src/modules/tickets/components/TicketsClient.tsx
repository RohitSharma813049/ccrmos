"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter, AlertCircle, LifeBuoy, Clock, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import KanbanBoard, { KanbanCard } from "@/components/ui/KanbanBoard";

const ticketCols = [
  { id: "Open", title: "Open" },
  { id: "Pending", title: "Pending" },
  { id: "Resolved", title: "Resolved" },
  { id: "Closed", title: "Closed" },
];

export default function TicketsClient() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban"|"list">("kanban");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCardMoved = async (cardId: string, newColId: string) => {
    // Optimistic update
    const previousTickets = [...tickets];
    setTickets(tickets.map(t => t._id === cardId ? { ...t, status: newColId } : t));
    
    try {
      const res = await fetch(`/api/tickets?id=${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newColId })
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Ticket updated");
    } catch (e) {
      toast.error("Failed to update status");
      setTickets(previousTickets); // revert
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  const kanbanCards: KanbanCard[] = tickets.map(t => ({
    id: t._id,
    columnId: t.status || "Open",
    title: t.subject,
    subtitle: t.customerId?.companyName || t.customerId?.contactName || "Unknown Customer",
    description: t.displayId,
    labels: [
      { text: t.priority, color: getPriorityColor(t.priority) }
    ],
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(t.customerId?.contactName || 'C')}&background=random`
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6 fade-in h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-primary" />
            Helpdesk Tickets
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Manage customer support inquiries.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 flex items-center">
            <button onClick={() => setView('kanban')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}>Kanban</button>
            <button onClick={() => setView('list')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}>List</button>
          </div>
          <Button className="gap-2 shadow-sm" disabled><Plus className="w-4 h-4"/> New Ticket (via Portal)</Button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500">Loading tickets...</div>
        ) : view === 'kanban' ? (
          <div className="flex-1 overflow-x-auto p-4 custom-scrollbar">
            <KanbanBoard columns={ticketCols} cards={kanbanCards} onCardMoved={handleCardMoved} />
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Subject</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Priority</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t._id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="px-6 py-4 font-medium text-primary">{t.displayId}</td>
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">{t.subject}</td>
                      <td className="px-6 py-4">{t.customerId?.contactName || t.customerId?.companyName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(t.priority)}`}>{t.priority}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 rounded-full">{t.status}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No tickets found.</td></tr>
                  )}
                </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
}
