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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !formSchema) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Unavailable</h2>
          <p className="text-gray-500 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Thank You!</h2>
          <p className="text-gray-500 mb-8">Your submission has been received successfully.</p>
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-primary/5 px-8 py-10 border-b border-primary/10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{formSchema.name}</h1>
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
                  <label className="block text-sm font-semibold text-gray-700">
                    {field.name}
                    {field.required && <span className="text-red-500 ml-1" title="Required">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea 
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm min-h-[120px] resize-y bg-gray-50 focus:bg-white"
                      placeholder={`Enter ${field.name.toLowerCase()}...`}
                    />
                  ) : field.type === 'select' ? (
                    <div className="relative">
                      <select
                        required={field.required}
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm appearance-none bg-gray-50 focus:bg-white"
                      >
                        <option value="" disabled>Select an option</option>
                        {field.options?.map((opt: string) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  ) : (
                    <input 
                      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm bg-gray-50 focus:bg-white"
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
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-center">
            <span className="text-xs text-gray-400 font-medium">Powered by CRMOS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
