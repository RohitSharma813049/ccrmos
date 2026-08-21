"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ChannelPartnersClient() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Partner Types");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '',
    alternateMobile: '', whatsapp: '', address: '', city: '', state: '',
    type: 'Individual', experience: '', focusedProject: '', preferredLocations: '', teamSize: '0'
  });

  const fetchPartners = async () => {
    try {
      const res = await fetch(`/api/partners?search=${search}&type=${typeFilter}`);
      if (res.ok) {
        const data = await res.json();
        setPartners(data.partners || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [search, typeFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Partner added successfully!");
        if (data.tempPassword) {
          toast.success(`User account created. Temp Password: ${data.tempPassword}`, { duration: 10000 });
        }
        setIsModalOpen(false);
        fetchPartners();
      } else {
        toast.error(data.error || "Failed to add partner");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 leading-tight">Channel Partners</h1>
          <p className="text-zinc-400 text-sm">Manage channel partner accounts (User Type: Partner)</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Partner
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl p-5 border border-zinc-800/60 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-zinc-400 mb-1">Total Partners</p>
          <h3 className="text-2xl font-bold text-zinc-100">{partners.length}</h3>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl p-5 border border-zinc-800/60 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-zinc-400 mb-1">Companies</p>
          <h3 className="text-2xl font-bold text-blue-600">{partners.filter(p => p.type === 'Company').length}</h3>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl p-5 border border-zinc-800/60 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-zinc-400 mb-1">Individuals</p>
          <h3 className="text-2xl font-bold text-green-600">{partners.filter(p => p.type === 'Individual').length}</h3>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl p-5 border border-zinc-800/60 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-zinc-400 mb-1">Agencies & Firms</p>
          <h3 className="text-2xl font-bold text-purple-600">{partners.filter(p => p.type === 'Agency' || p.type === 'Firm').length}</h3>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, email, phone, or city..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none bg-zinc-900/40 backdrop-blur-xl font-medium text-zinc-300"
          >
            <option>All Partner Types</option>
            <option>Company</option>
            <option>Individual</option>
            <option>Firm</option>
            <option>Agency</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading partners...
        </div>
      ) : (
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-800/60 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 font-semibold uppercase border-b border-zinc-800/60">
              <tr>
                <th className="px-6 py-5">Partner Info</th>
                <th className="px-6 py-5">Contact</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5 text-center">Type</th>
                <th className="px-6 py-5">Experience</th>
                <th className="px-6 py-5 text-center">Team Size</th>
                <th className="px-6 py-5">Joined</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.map((partner, i) => (
                <tr key={i} className="hover:bg-zinc-950/50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-sm shrink-0">
                        {getInitial(partner.name)}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-100">{partner.name}</div>
                        <div className="text-xs text-zinc-400">{partner.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-300 font-medium">{partner.phone}</div>
                    <div className="text-zinc-400 text-xs">{partner.email}</div>
                    {partner.whatsapp && (
                      <div className="text-green-500 text-[11px] font-medium mt-0.5">{partner.whatsapp}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-300 font-medium">{partner.city}</div>
                    <div className="text-zinc-400 text-xs">{partner.state}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-zinc-400">
                      {partner.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-300 font-medium">{partner.experience || 'N/A'}</div>
                    {partner.focusedProject && (
                      <div className="text-slate-400 text-[10px] mt-0.5 truncate max-w-[120px]">{partner.focusedProject}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-zinc-100">
                    {partner.teamSize || '0'}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs font-medium whitespace-nowrap">
                    {new Date(partner.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-500 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-full">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {partners.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-400">
                    No partners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-zinc-900/40 backdrop-blur-xl border-b border-zinc-800/60 p-6 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-zinc-100">Add Channel Partner</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-zinc-400 bg-zinc-950/50 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300 flex items-center">Full Name <span className="text-red-500 ml-1">*</span></label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300 flex items-center">Email <span className="text-red-500 ml-1">*</span></label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300 flex items-center">Phone Number <span className="text-red-500 ml-1">*</span></label>
                  <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="10 digit phone" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300 flex items-center">Company Name <span className="text-red-500 ml-1">*</span></label>
                  <input type="text" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Company name" />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/60">
                <h3 className="text-lg font-bold text-zinc-100 mb-4">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Alternate Mobile</label>
                    <input type="text" value={formData.alternateMobile} onChange={e => setFormData({...formData, alternateMobile: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="10 digits" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">WhatsApp Number</label>
                    <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="10 digits" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-zinc-300">Address</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Full address" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">City</label>
                    <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="City" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">State</label>
                    <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="State" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/60">
                <h3 className="text-lg font-bold text-zinc-100 mb-4">Business Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Partner Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm appearance-none bg-zinc-900/40 backdrop-blur-xl">
                      <option value="Individual">Individual</option>
                      <option value="Company">Company</option>
                      <option value="Firm">Firm</option>
                      <option value="Agency">Agency</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Experience (years)</label>
                    <input type="text" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Focused Project</label>
                    <input type="text" value={formData.focusedProject} onChange={e => setFormData({...formData, focusedProject: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Project name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Preferred Locations</label>
                    <input type="text" value={formData.preferredLocations} onChange={e => setFormData({...formData, preferredLocations: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Mumbai, Pune, Delhi" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Team Size</label>
                    <input type="number" value={formData.teamSize} onChange={e => setFormData({...formData, teamSize: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="0" />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm text-blue-800">
                <div className="shrink-0 mt-0.5">ℹ️</div>
                <div>
                  <p className="font-semibold mb-1">Note: This will create a partner account with:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Role:</strong> Manager (fixed)</li>
                    <li><strong>User Type:</strong> Partner (fixed)</li>
                    <li>Temporary password will be auto-generated</li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800/60 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-zinc-400 bg-zinc-950/50 border border-zinc-700/50 hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Saving...' : 'Save Partner'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}
