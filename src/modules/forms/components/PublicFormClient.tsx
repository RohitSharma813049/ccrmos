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
      <div className={`min-h-screen flex items-center justify-center ${isEmbed ? 'bg-transparent' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isEmbed ? 'bg-transparent' : 'bg-gray-50'}`}>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Form Unavailable</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isEmbed ? 'bg-transparent' : 'bg-gray-50'}`}>
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600">{form.successMessage || "Thank you for your submission!"}</p>
          
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
    <div className={`min-h-screen py-12 px-4 sm:px-6 fade-in ${isEmbed ? 'bg-transparent py-4' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto">
        
        {!isEmbed && (
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{form.title}</h1>
            {form.description && (
              <p className="mt-2 text-gray-500 text-lg">{form.description}</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {isEmbed && (
            <div className="bg-gray-50 p-6 sm:p-8 border-b border-gray-100">
              <h1 className="text-2xl font-extrabold text-gray-900">{form.title}</h1>
              {form.description && <p className="mt-2 text-gray-500">{form.description}</p>}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {form.fields?.map((field: any) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea 
                    required={field.required}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-gray-900"
                  />
                ) : field.type === 'select' ? (
                  <select
                    required={field.required}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900"
                  >
                    <option value="" disabled>Select an option</option>
                    {(field.options || []).map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
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
                          className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-gray-700 group-hover:text-gray-900">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input 
                    type={field.type}
                    required={field.required}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900"
                  />
                )}
              </div>
            ))}

            <div className="pt-6 border-t border-gray-100 mt-8">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : (form.submitButtonText || "Submit Response")}
              </button>
            </div>
          </form>
          
          <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Powered by <span className="text-indigo-400">CRM OS</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
