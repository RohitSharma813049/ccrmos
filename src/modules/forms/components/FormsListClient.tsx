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

  const createForm = async () => {
    const title = prompt("Enter a title for your new form:");
    if (!title) return;

    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/forms/${data.form._id}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create form");
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading forms...</div>;

  return (
    <div className="space-y-8 fade-in pb-12 p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Standalone Forms</h1>
          <p className="text-gray-500 mt-1">Create custom surveys, contact forms, and lead captures.</p>
        </div>
        <button onClick={createForm} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create New Form
        </button>
      </div>

      {forms.length === 0 ? (
        <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-gray-200 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Forms Yet</h3>
          <p className="text-gray-500 max-w-sm mb-6">Create your first form to start collecting responses from your customers.</p>
          <button onClick={createForm} className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">Get Started &rarr;</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map(form => (
            <Link key={form._id} href={`/dashboard/forms/${form._id}`} className="block group">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${form.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {form.isActive ? "Active" : "Draft"}
                  </div>
                  <button onClick={(e) => deleteForm(form._id, e)} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{form.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">{form.description || "No description provided."}</p>
                <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    {form.fields?.length || 0} Fields
                  </span>
                  <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
