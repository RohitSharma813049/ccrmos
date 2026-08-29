"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FormsListClient() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchForms();
  }, []);

  async function fetchForms() {
    try {
      const res = await fetch("/api/forms");
      if (res.ok) {
        const data = await res.json();
        setForms(data.forms || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const openCreateModal = () => {
    setNewFormTitle("");
    setIsModalOpen(true);
  };

  const submitCreateForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newFormTitle.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newFormTitle.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/forms/${data.form._id}`);
      } else {
        alert("Failed to create form");
        setIsCreating(false);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create form");
      setIsCreating(false);
    }
  };

  const deleteForm = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this form?")) return;
    
    try {
      await fetch(`/api/forms/${id}`, { method: "DELETE" });
      fetchForms();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading forms...</div>;

  return (
    <div className="space-y-8 fade-in pb-12 p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/40 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-zinc-800/60">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Standalone Forms</h1>
          <p className="text-zinc-400 mt-1">Create custom surveys, contact forms, and lead captures.</p>
        </div>
        <button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create New Form
        </button>
      </div>

      {forms.length === 0 ? (
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl p-6 sm:p-12 shadow-sm border border-zinc-700/50 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-zinc-100 mb-2">No Forms Yet</h3>
          <p className="text-zinc-400 max-w-sm mb-6">Create your first form to start collecting responses from your customers.</p>
          <button onClick={openCreateModal} className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">Get Started &rarr;</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map(form => (
            <Link key={form._id} href={`/dashboard/forms/${form._id}`} className="block group">
              <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl p-6 border border-zinc-700/50 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${form.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-800/50 text-zinc-400'}`}>
                    {form.isActive ? "Active" : "Draft"}
                  </div>
                  <button onClick={(e) => deleteForm(form._id, e)} className="text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-600 transition-colors truncate">{form.title}</h3>
                <p className="text-sm text-zinc-400 mt-1 line-clamp-2 min-h-[40px]">{form.description || "No description provided."}</p>
                <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-sm text-zinc-400">
                  <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> {form.views}</span>
                  <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> {form.submissions}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isCreating && setIsModalOpen(false)}></div>
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-700/50">
              <h2 className="text-xl font-bold text-zinc-100">Create New Form</h2>
              <p className="text-sm text-zinc-400 mt-1">Give your new standalone form a title to get started.</p>
            </div>
            <form onSubmit={submitCreateForm}>
              <div className="p-6">
                <label className="block text-sm font-medium text-zinc-300 mb-1">Form Title</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  placeholder="e.g. Customer Feedback Survey"
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  disabled={isCreating}
                />
              </div>
              <div className="p-4 bg-zinc-950/50 border-t border-zinc-700/50 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating}
                  className="px-5 py-2 text-sm font-medium text-zinc-300 bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-lg hover:bg-zinc-950/50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newFormTitle.trim() || isCreating}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : "Create Form"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
