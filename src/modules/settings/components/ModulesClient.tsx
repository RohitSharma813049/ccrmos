"use client";

import { useState } from "react";

export default function ModulesClient() {
  const [modules] = useState([
    { id: 1, name: "Inventory Tracking", active: true, tables: 4, apiEndpoints: 12 },
    { id: 2, name: "HR Management", active: false, tables: 8, apiEndpoints: 24 },
    { id: 3, name: "Helpdesk Ticketing", active: true, tables: 3, apiEndpoints: 9 },
  ]);

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dynamic Module Builder</h1>
          <p className="text-gray-600 mt-1">Create custom systemic modules that tenants can subscribe to.</p>
        </div>
        <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all">
          Build New Module
        </button>
      </div>

      <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100/50 text-xs uppercase text-gray-600 font-semibold">
            <tr>
              <th className="px-6 py-4">Module Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">DB Tables</th>
              <th className="px-6 py-4">Generated APIs</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {modules.map((mod) => (
              <tr key={mod.id} className="hover:bg-gray-100/30 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{mod.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${mod.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-600 border-gray-500/20'}`}>
                    {mod.active ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">{mod.tables}</td>
                <td className="px-6 py-4 text-gray-700">{mod.apiEndpoints}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Edit Schema</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
