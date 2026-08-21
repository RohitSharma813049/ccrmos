"use client";

import { useState, useEffect } from "react";

export default function PublicFormClient({ formId, isEmbed }: { formId: string, isEmbed: boolean }) {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchForm();
  }, [formId]);

  async function fetchForm() {
    try {
      const res = await fetch(`/api/forms/${formId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Form not found");
      }
      
      if (!data.form.isActive) {
        throw new Error("This form is no longer accepting responses.");
      }
      
      setForm(data.form);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (id: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isEmbed ? 'bg-transparent' : 'bg-zinc-950/50'}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isEmbed ? 'bg-transparent' : 'bg-zinc-950/50'}`}>
        <div className="bg-zinc-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-sm border border-zinc-700/50 max-w-md w-full text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Form Unavailable</h2>
          <p className="text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isEmbed ? 'bg-transparent' : 'bg-zinc-950/50'}`}>
        <div className="bg-zinc-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-zinc-800/60 max-w-md w-full text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-100 mb-2">Success!</h2>
          <p className="text-zinc-400">{form.successMessage || "Thank you for your submission!"}</p>
          
          <button 
            onClick={() => { setSubmitted(false); setFormData({}); }}
            className="mt-8 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 fade-in ${isEmbed ? 'bg-transparent py-4' : 'bg-zinc-950/50'}`}>
      <div className="max-w-2xl mx-auto">
        
        {!isEmbed && (
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">{form.title}</h1>
            {form.description && (
              <p className="mt-2 text-zinc-400 text-lg">{form.description}</p>
            )}
          </div>
        )}

        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl shadow-xl border border-zinc-800/60 overflow-hidden">
          {isEmbed && (
            <div className="bg-zinc-950/50 p-6 sm:p-8 border-b border-zinc-800/60">
              <h1 className="text-2xl font-extrabold text-zinc-100">{form.title}</h1>
              {form.description && <p className="mt-2 text-zinc-400">{form.description}</p>}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {form.fields?.map((field: any) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-100">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea 
                    required={field.required}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-zinc-100"
                  />
                ) : field.type === 'select' ? (
                  <select
                    required={field.required}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-100"
                  >
                    <option value="" disabled>Select an option</option>
                    {(field.options || []).map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'relation' ? (
                  <select
                    required={field.required}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-100"
                  >
                    <option value="" disabled>Select an option</option>
                    {(field.relationOptions || []).map((opt: any) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === 'radio' ? (
                  <div className="space-y-3 pt-1">
                    {(field.options || []).map((opt: string) => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio"
                          name={field.id}
                          required={field.required}
                          value={opt}
                          checked={formData[field.id] === opt}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          className="w-5 h-5 text-indigo-600 bg-gray-100 border-zinc-700/50 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-zinc-300 group-hover:text-zinc-100">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center gap-3 py-2">
                    <input 
                      type="checkbox"
                      required={field.required}
                      checked={!!formData[field.id]}
                      onChange={(e) => handleChange(field.id, e.target.checked)}
                      className="w-5 h-5 rounded border-zinc-700/50 text-indigo-600 focus:ring-indigo-500 shadow-sm"
                    />
                    <span className="text-zinc-300 text-sm">Yes</span>
                  </div>
                ) : field.type === 'score' ? (
                  <div className="flex flex-col gap-2">
                    <input 
                      type="range"
                      min="1" max="10"
                      required={field.required}
                      value={formData[field.id] || 5}
                      onChange={(e) => handleChange(field.id, Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-zinc-400 font-medium">
                      <span>1 (Poor)</span>
                      <span className="text-indigo-600 text-base font-bold">{formData[field.id] || 5}/10</span>
                      <span>10 (Excellent)</span>
                    </div>
                  </div>
                ) : field.type === 'phone' || field.type === 'whatsapp' ? (
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-gray-400">
                      {field.type === 'whatsapp' ? (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      )}
                    </div>
                    <input 
                      type="tel"
                      required={field.required}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full rounded-xl border border-zinc-700/50 pl-11 pr-4 py-3 text-zinc-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm bg-zinc-950/50 focus:bg-zinc-900/40 backdrop-blur-xl"
                      placeholder={`e.g. +1 234 567 8900`}
                    />
                  </div>
                ) : (
                  <input 
                    type={field.type}
                    required={field.required}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-100"
                  />
                )}
              </div>
            ))}

            <div className="pt-6 border-t border-zinc-800/60 mt-8">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : (form.submitButtonText || "Submit Response")}
              </button>
            </div>
          </form>
          
          <div className="bg-zinc-950/50 p-4 text-center border-t border-zinc-800/60">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Powered by <span className="text-indigo-400">CRM OS</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
