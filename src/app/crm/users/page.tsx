'use client'

import React from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  BarChart2,
  Mail,
  Phone,
  Key,
  Activity,
  Edit3,
  MoreVertical
} from 'lucide-react'

const users = [
  {
    initial: 'D',
    name: 'Darpann Investment',
    email: 'webesidetechnologyindia@gmail.com',
    phone: '8860876087',
    role: 'Admin',
    type: 'Normal',
    typeColor: 'bg-slate-100 text-slate-700',
    joinDate: '13 Nov 2025',
    lastUpdate: '01 Aug 2026'
  },
  {
    initial: 'R',
    name: 'Rahul Chouhan',
    email: 'hr_web_developer@gmail.com',
    phone: '9540627378',
    role: 'Manager',
    type: 'Partner',
    typeColor: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    joinDate: '28 Nov 2025',
    lastUpdate: '28 Nov 2025'
  },
  {
    initial: 'R',
    name: 'Rahul Chouhan',
    email: 'rahul@gmail.com',
    phone: '9540627370',
    role: 'Manager',
    type: 'Normal',
    typeColor: 'bg-slate-100 text-slate-700',
    joinDate: '29 Nov 2025',
    lastUpdate: '07 Jan 2026'
  }
]

export default function UsersPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">User Management</h1>
          <p className="text-slate-500 text-sm">Manage users, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <BarChart2 className="w-4 h-4" /> Detailed Analytics
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-sm">All Users (15)</button>
        <button className="px-5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full text-sm font-medium transition-colors">Admin (1)</button>
        <button className="px-5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full text-sm font-medium transition-colors">Managers (8)</button>
        <button className="px-5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full text-sm font-medium transition-colors">Sales (6)</button>
        <button className="px-5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full text-sm font-medium transition-colors">Support (0)</button>
      </div>

      {/* Controls Area */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-8 py-2.5 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-semibold transition-colors sm:w-auto w-full">
          <Filter className="w-4 h-4" /> More Filters
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Users</p>
          <h3 className="text-3xl font-bold text-slate-800">15</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Admins</p>
          <h3 className="text-3xl font-bold text-red-500">1</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Sales Team</p>
          <h3 className="text-3xl font-bold text-green-500">6</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Managers</p>
          <h3 className="text-3xl font-bold text-orange-500">8</h3>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-800 font-bold border-b border-slate-100 bg-slate-50/50">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">User Type</th>
              <th className="px-6 py-4">Joining Date</th>
              <th className="px-6 py-4">Last Updated</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                
                {/* User */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-sm shrink-0">
                      {user.initial}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                
                {/* Contact */}
                <td className="px-6 py-4 space-y-1 text-slate-500 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {user.phone}
                  </div>
                </td>
                
                {/* Role */}
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-800">{user.role}</span>
                </td>
                
                {/* User Type */}
                <td className="px-6 py-4">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${user.typeColor}`}>
                    {user.type}
                  </span>
                </td>
                
                {/* Dates */}
                <td className="px-6 py-4">
                  <div className="text-slate-600 font-medium whitespace-pre-wrap">{user.joinDate.replace(' ', '\n')}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-600 font-medium whitespace-pre-wrap">{user.lastUpdate.replace(' ', '\n')}</div>
                </td>
                
                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <button className="text-orange-400 hover:text-orange-600 transition-colors p-1.5 hover:bg-orange-50 rounded-lg">
                      <Key className="w-4 h-4" />
                    </button>
                    <button className="text-blue-500 hover:text-blue-700 transition-colors p-1.5 hover:bg-blue-50 rounded-lg">
                      <Activity className="w-4 h-4" />
                    </button>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-lg">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
