"use client";

import { useState, useEffect } from "react";
import Button from "./Button";
import { Send, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface NotesPanelProps {
  recordId: string;
  recordModel: string;
}

export default function NotesPanel({ recordId, recordModel }: NotesPanelProps) {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [recordId, recordModel]);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/notes?recordId=${recordId}&recordModel=${recordModel}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId, recordModel, content })
      });

      if (res.ok) {
        const data = await res.json();
        setNotes([data.note, ...notes]);
        setContent("");
      } else {
        toast.error("Failed to add note");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Notes & Activity</h3>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
        {loading ? (
          <div className="text-center text-sm text-zinc-500 py-4">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center text-sm text-zinc-500 py-8">
            No notes yet. Add one below to keep track of interactions.
          </div>
        ) : (
          notes.map(note => (
            <div key={note._id} className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg text-sm">
              <div className="flex justify-between items-start mb-1.5">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{note.createdBy?.name || 'Unknown User'}</span>
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write a note..."
            className="w-full text-sm p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            rows={2}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting || !content.trim()} className="gap-2 h-8 text-xs py-0 px-3">
              <Send size={12} /> Post Note
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
