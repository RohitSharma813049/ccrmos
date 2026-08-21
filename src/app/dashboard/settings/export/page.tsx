"use client";

import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";

const MODULES = [
  { id: "leads", name: "Leads", description: "Export all your leads and prospects." },
  { id: "customers", name: "Customers", description: "Export your customer database." },
  { id: "projects", name: "Projects", description: "Export all active and completed projects." },
  { id: "invoices", name: "Invoices", description: "Export your billing history and invoices." },
  { id: "tasks", name: "Tasks", description: "Export task assignments and statuses." },
];

export default function DataExportPage() {
  const { session } = usePermissions();
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!selectedModule) return alert("Please select a module first.");
    
    setIsExporting(true);
    try {
      // Create a temporary anchor to trigger download
      const a = document.createElement("a");
      a.href = `/api/export?module=${selectedModule}`;
      a.download = `${selectedModule}_export.csv`; // Fallback, headers handle actual name
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (err: any) {
      console.error(err);
      alert("Failed to export data.");
    } finally {
      // Simulate small delay for UI
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Data Export</h1>
        <p className="text-zinc-400 mt-1">Securely export your CRM data as a CSV file for backup or external analysis.</p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-sm p-8">
        <h2 className="text-xl font-semibold text-zinc-100 mb-6">Select a Module to Export</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {MODULES.map((mod) => (
            <div 
              key={mod.id}
              onClick={() => setSelectedModule(mod.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedModule === mod.id 
                  ? "border-indigo-600 bg-indigo-50 shadow-md" 
                  : "border-zinc-700/50 hover:border-indigo-300 hover:bg-zinc-950/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-semibold ${selectedModule === mod.id ? 'text-indigo-900' : 'text-zinc-100'}`}>
                  {mod.name}
                </h3>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedModule === mod.id ? 'border-indigo-600 bg-indigo-600' : 'border-zinc-700/50'}`}>
                  {selectedModule === mod.id && <div className="w-2 h-2 bg-zinc-900/40 backdrop-blur-xl rounded-full"></div>}
                </div>
              </div>
              <p className="text-sm text-zinc-400">{mod.description}</p>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-zinc-700/50 flex justify-end">
          <button
            onClick={handleExport}
            disabled={!selectedModule || isExporting}
            className={`px-8 py-3 rounded-xl font-medium text-white shadow-lg transition-all ${
              !selectedModule || isExporting
                ? "bg-gray-400 cursor-not-allowed shadow-none"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25"
            }`}
          >
            {isExporting ? "Exporting..." : "Export to CSV"}
          </button>
        </div>
      </div>
      
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex items-start gap-3">
        <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h4 className="text-sm font-semibold text-orange-900">Security Notice</h4>
          <p className="text-sm text-orange-800 mt-1">
            Exported data will include all fields within the selected module. Please ensure you store your downloaded files securely, as they may contain Personally Identifiable Information (PII) of your clients.
          </p>
        </div>
      </div>
    </div>
  );
}
