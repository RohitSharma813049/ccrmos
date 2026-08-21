'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddProjectPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/crm/projects" className="p-2 text-zinc-100 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 leading-tight">Add New Project</h1>
          <p className="text-zinc-400 text-sm">Fill in all project details</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Basic Information */}
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-700/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-800/60 bg-zinc-950/50/50">
            <h2 className="text-lg font-bold text-zinc-100">Basic Information</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., DLF Magnolias" 
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                  Developer <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., DLF Limited" 
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                  Location <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Golf Course Road" 
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                  City
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Gurgaon" 
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                  State
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Haryana" 
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                  Property Type
                </label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none bg-zinc-900/40 backdrop-blur-xl font-medium text-zinc-300">
                  <option>Select an option</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Farmland</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-700/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-800/60 bg-zinc-950/50/50">
            <h2 className="text-lg font-bold text-zinc-100">Project Details</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Total Area</label>
                <input 
                  type="text" 
                  placeholder="e.g., 25 Acres" 
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Total Towers</label>
                <input 
                  type="text" 
                  placeholder="e.g., 10" 
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Payment Plan</label>
                <input 
                  type="text" 
                  placeholder="e.g., 30:40:30" 
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Landscape Partner</label>
                <input 
                  type="text" 
                  placeholder="e.g., XYZ Landscaping Pvt Ltd" 
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Total Units</label>
                <input 
                  type="text" 
                  placeholder="e.g., 120" 
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Available Units</label>
                <input 
                  type="text" 
                  placeholder="e.g., 50" 
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Min Price (₹)</label>
                <input 
                  type="text" 
                  placeholder="e.g., 5000000" 
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Max Price (₹)</label>
                <input 
                  type="text" 
                  placeholder="e.g., 12000000" 
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Project Content */}
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-700/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-800/60 bg-zinc-950/50/50">
            <h2 className="text-lg font-bold text-zinc-100">Project Content</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Description</label>
              <textarea 
                rows={4}
                placeholder="Detailed project description..." 
                className="w-full px-4 py-3 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Key Highlights</label>
              <textarea 
                rows={3}
                placeholder="Prime location, Modern architecture, RERA approved..." 
                className="w-full px-4 py-3 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Specifications</label>
              <textarea 
                rows={3}
                placeholder="4 BHK (3500 sq ft), Italian marble flooring..." 
                className="w-full px-4 py-3 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button className="px-6 py-2.5 border border-zinc-700/50 text-zinc-300 rounded-xl font-medium hover:bg-zinc-950/50 transition-colors">
            Cancel
          </button>
          <button className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-sm">
            Save Project
          </button>
        </div>

      </div>
    </div>
  )
}
