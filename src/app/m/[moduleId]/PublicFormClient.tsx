"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PublicFormClient({ moduleId }: { moduleId: string }) {
  const [formSchema, setFormSchema] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function fetchSchema() {
      try {
        const res = await fetch(`/api/public/forms/${moduleId}`);
        const data = await res.json();
        
        if (res.ok) {
          setFormSchema(data);
        } else {
          setError(data.error || "Failed to load form");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchSchema();
  }, [moduleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/public/forms/${moduleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setIsSuccess(true);
      } else {
        setError(result.error || "Failed to submit form.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950/50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !formSchema) {
    return (
      <div className="min-h-screen bg-zinc-950/50 flex items-center justify-center p-4">
        <div className="bg-zinc-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-zinc-800/60">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Form Unavailable</h2>
          <p className="text-zinc-400 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950/50 flex items-center justify-center p-4">
        <div className="bg-zinc-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-zinc-800/60 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-zinc-100 mb-3">Thank You!</h2>
          <p className="text-zinc-400 mb-8">Your submission has been received successfully.</p>
          <button 
            onClick={() => { setIsSuccess(false); setFormData({}); }}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-xl transition-colors focus:ring-2 focus:ring-primary focus:outline-none shadow-sm"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl shadow-xl border border-zinc-800/60 overflow-hidden">
          {/* Header */}
          <div className="bg-primary/5 px-8 py-10 border-b border-primary/10">
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">{formSchema.name}</h1>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {formSchema.fields.map((field: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <label className="block text-sm font-semibold text-zinc-300">
                    {field.name}
                    {field.required && <span className="text-red-500 ml-1" title="Required">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea 
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full rounded-xl border border-zinc-700/50 px-4 py-3 text-zinc-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm min-h-[120px] resize-y bg-zinc-950/50 focus:bg-zinc-900/40 backdrop-blur-xl"
                      placeholder={`Enter ${field.name.toLowerCase()}...`}
                    />
                  ) : field.type === 'select' ? (
                    <div className="relative">
                      <select
                        required={field.required}
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full rounded-xl border border-zinc-700/50 px-4 py-3 text-zinc-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm appearance-none bg-zinc-950/50 focus:bg-zinc-900/40 backdrop-blur-xl"
                      >
                        <option value="" disabled>Select an option</option>
                        {field.options?.map((opt: string) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  ) : field.type === 'relation' ? (
                    <div className="relative">
                      <select
                        required={field.required}
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full rounded-xl border border-zinc-700/50 px-4 py-3 text-zinc-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm appearance-none bg-zinc-950/50 focus:bg-zinc-900/40 backdrop-blur-xl"
                      >
                        <option value="" disabled>Select {field.relationTarget || 'an option'}</option>
                        {field.relationOptions?.map((opt: any) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center gap-3 py-2">
                      <input 
                        type="checkbox"
                        required={field.required}
                        checked={!!formData[field.name]}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                        className="w-5 h-5 rounded border-zinc-700/50 text-primary focus:ring-primary shadow-sm"
                      />
                      <span className="text-zinc-300 text-sm">{field.name}</span>
                    </div>
                  ) : field.type === 'score' ? (
                    <div className="flex flex-col gap-2">
                      <input 
                        type="range"
                        min="1" max="10"
                        required={field.required}
                        value={formData[field.name] || 5}
                        onChange={(e) => setFormData({ ...formData, [field.name]: Number(e.target.value) })}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-zinc-400 font-medium">
                        <span>1 (Poor)</span>
                        <span className="text-primary text-base font-bold">{formData[field.name] || 5}/10</span>
                        <span>10 (Excellent)</span>
                      </div>
                    </div>
                  ) : field.type === 'phone' || field.type === 'whatsapp' ? (
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-zinc-400">
                        {field.type === 'whatsapp' ? (
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        )}
                      </div>
                      <input 
                        type="tel"
                        required={field.required}
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full rounded-xl border border-zinc-700/50 pl-11 pr-4 py-3 text-zinc-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm bg-zinc-950/50 focus:bg-zinc-900/40 backdrop-blur-xl"
                        placeholder={`e.g. +1 234 567 8900`}
                      />
                    </div>
                  ) : (
                    <input 
                      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full rounded-xl border border-zinc-700/50 px-4 py-3 text-zinc-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm bg-zinc-950/50 focus:bg-zinc-900/40 backdrop-blur-xl"
                      placeholder={`Enter ${field.name.toLowerCase()}...`}
                    />
                  )}
                </div>
              ))}

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Response
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Footer */}
          <div className="bg-zinc-950/50 px-8 py-4 border-t border-zinc-800/60 flex justify-center">
            <span className="text-xs text-zinc-400 font-medium">Powered by CRMOS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
