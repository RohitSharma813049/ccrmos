"use client";

import { useState } from "react";

export default function AutomationsClient() {
  const [automations, setAutomations] = useState([
    { id: 1, title: "Lead Routing to Sales", desc: "Automatically assign new incoming leads to round-robin sales queue.", active: true, trigger: "Lead Created" },
    { id: 2, "title": "Overdue Invoice Alerts", desc: "Send SMS alerts to Account Executives when invoices pass 7 days overdue.", active: false, trigger: "Invoice Past Due" },
    { id: 3, "title": "Customer Welcome Series", desc: "Enroll new customers into the onboarding email drip campaign.", active: true, trigger: "Customer Converted" },
    { id: 4, "title": "High-Value Lead Notification", desc: "Ping Director of Sales via Slack for leads > $50k.", active: true, trigger: "Lead Score > 90" },
  ]);

  const toggleAutomation = (id: number) => {
    setAutomations(automations.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Company Automations</h1>
          <p className="text-gray-600 mt-1">Configure systemic workflow rules for your entire organization.</p>
        </div>
        
        <button 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg transition-all border border-gray-900"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {automations.map((auto) => (
          <div key={auto.id} className={`bg-white/50 backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all ${auto.active ? 'border-blue-500/30 shadow-blue-500/10' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${auto.active ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-100 text-gray-500'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`font-semibold ${auto.active ? 'text-gray-900' : 'text-gray-600'}`}>{auto.title}</h3>
                  <p className="text-xs text-gray-500 font-medium">Trigger: {auto.trigger}</p>
                </div>
              </div>
              
              <button 
                onClick={() => toggleAutomation(auto.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${auto.active ? 'bg-blue-500' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${auto.active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">{auto.desc}</p>
            
            <div className="flex gap-3">
              <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-sm font-medium text-white rounded-lg transition-colors">
                Configure Rules
              </button>
              <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-sm font-medium text-white rounded-lg transition-colors">
                View Logs
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
