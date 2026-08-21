"use client";

import { useState, useEffect } from "react";
import { Plus, LifeBuoy } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function PortalTicketsClient() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ subject: "", description: "", priority: "Medium" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/portal/tickets");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) return toast.error("Fill required fields");
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Ticket submitted!");
        setIsModalOpen(false);
        setFormData({ subject: "", description: "", priority: "Medium" });
        fetchTickets();
      } else {
        toast.error("Failed to submit");
      }
    } catch (e) {
      toast.error("Error submitting ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-primary" />
            Support Tickets
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Need help? Open a support ticket here.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> New Ticket
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50">
             <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400"><LifeBuoy className="w-8 h-8"/></div>
             <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No support tickets found</p>
             <p className="text-sm text-zinc-500 mt-1 mb-4">You have not submitted any tickets yet.</p>
             <Button onClick={() => setIsModalOpen(true)} variant="outline">Open a Ticket</Button>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Ticket ID</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t._id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4 font-medium text-primary">{t.displayId}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">{t.subject}</td>
                  <td className="px-6 py-4">{t.priority}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-medium">{t.status}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Submit a Ticket</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Subject</label>
                <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-zinc-950 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Priority</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-zinc-950 dark:text-white">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-zinc-950 dark:text-white" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline">Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Ticket"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
