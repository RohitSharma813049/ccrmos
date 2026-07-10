"use client";

import { useState } from "react";

export default function DirectorsClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [directors] = useState([
    { id: 1, name: "Sarah Jenkins", email: "sarah.j@company.com", department: "Sales", teams: 4, status: "Active" },
    { id: 2, name: "Michael Chang", email: "m.chang@company.com", department: "Engineering", teams: 6, status: "Active" },
    { id: 3, name: "Elena Rodriguez", email: "elena.r@company.com", department: "Marketing", teams: 2, status: "On Leave" },
  ]);

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Director Management</h1>
          <p className="text-gray-600 mt-1">Provision and manage top-level leadership for your company.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all border border-emerald-500/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Provision Director
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/40 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Total Directors</p>
          <p className="text-3xl font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white/40 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Departments Covered</p>
          <p className="text-3xl font-bold text-blue-400">8</p>
        </div>
        <div className="bg-white/40 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Pending Invites</p>
          <p className="text-3xl font-bold text-amber-400">2</p>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100/50 text-xs uppercase text-gray-600 font-semibold">
              <tr>
                <th className="px-6 py-4">Director</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Teams Supervised</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50">
              {directors.map((dir) => (
                <tr key={dir.id} className="hover:bg-gray-100/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-xs text-white">
                        {dir.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{dir.name}</p>
                        <p className="text-xs text-gray-500">{dir.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{dir.department}</td>
                  <td className="px-6 py-4 text-gray-700">{dir.teams} Teams</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${dir.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {dir.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Manage Access</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-gray-300 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Provision Director</h2>
              <p className="text-sm text-gray-600 mt-1">Invite a new Level 3 Director to manage departments.</p>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Work Email</label>
                <input type="email" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assigned Department</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none">
                  <option>Sales & Revenue</option>
                  <option>Engineering & Product</option>
                  <option>Marketing</option>
                  <option>Customer Success</option>
                  <option>Human Resources</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
