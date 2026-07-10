"use client";

import { useState } from "react";

export default function AuditClient() {
  const [logs] = useState([
    { id: "LOG-001", user: "owner@crmos.com", action: "UPDATED_GLOBAL_SETTINGS", target: "System Config", date: "2023-10-27 14:32:01", status: "Success" },
    { id: "LOG-002", user: "webesideclient@gmail.com", action: "PROVISIONED_DIRECTOR", target: "Acme Corp", date: "2023-10-27 14:15:22", status: "Success" },
    { id: "LOG-003", user: "admin@crmos.com", action: "DELETED_LEAD", target: "Lead #8492", date: "2023-10-27 13:40:11", status: "Warning" },
    { id: "LOG-004", user: "unknown (IP: 192.168.1.4)", action: "FAILED_LOGIN_ATTEMPT", target: "Auth System", date: "2023-10-27 11:05:59", status: "Failed" },
  ]);

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Global Audit Logs</h1>
          <p className="text-gray-600 mt-1">Immutable record of all critical actions performed across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-sm font-medium text-white rounded-lg transition-colors border border-gray-900">
            Export CSV
          </button>
          <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white rounded-lg transition-colors">
            Filter Logs
          </button>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100/50 text-xs uppercase text-gray-600 font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User / Actor</th>
                <th className="px-6 py-4">Action Taken</th>
                <th className="px-6 py-4">Target Resource</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 font-mono text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-100/30 transition-colors">
                  <td className="px-6 py-4 text-gray-600">{log.date}</td>
                  <td className="px-6 py-4 text-blue-400">{log.user}</td>
                  <td className="px-6 py-4 text-gray-900 font-semibold">{log.action}</td>
                  <td className="px-6 py-4 text-gray-600">{log.target}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                      log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      log.status === 'Failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
