"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from "@/components/ui/PageHeader";

export default function AddPartnerClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    alternateMobile: '',
    whatsapp: '',
    address: '',
    city: '',
    state: '',
    type: 'Individual', // Default select
    experience: '',
    focusedProject: '',
    preferredLocations: '',
    teamSize: '0'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Failed to create partner');
      }

      const data = await res.json();
      
      // Optionally show tempPassword if it exists, otherwise just redirect
      if (data.tempPassword) {
        alert(`Partner created!\nTemporary Password: ${data.tempPassword}\nPlease copy this as it will only be shown once.`);
      }

      // Redirect back to partners list
      router.push('/dashboard/partners');
    } catch (err) {
      console.error(err);
      alert('Failed to save channel partner.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl fade-in pb-12">
      <PageHeader 
        title="Add Channel Partner" 
        description="Create a new partner account and configure details." 
      />
      
      <form onSubmit={handleSubmit} className="bg-card border border-border shadow-sm rounded-2xl p-6 md:p-8 space-y-8">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input 
                type="text" 
                name="name" 
                placeholder="Enter full name" 
                required
                value={formData.name} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                Email <span className="text-destructive">*</span>
              </label>
              <input 
                type="email" 
                name="email" 
                placeholder="email@example.com" 
                required
                value={formData.email} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <input 
                type="tel" 
                name="phone" 
                placeholder="10 digit phone" 
                required
                value={formData.phone} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                Company Name <span className="text-destructive">*</span>
              </label>
              <input 
                type="text" 
                name="company" 
                placeholder="Company name" 
                required
                value={formData.company} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm transition-all" 
              />
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Contact Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Alternate Mobile</label>
              <input 
                type="tel" 
                name="alternateMobile" 
                placeholder="10 digits" 
                value={formData.alternateMobile} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">WhatsApp Number</label>
              <input 
                type="tel" 
                name="whatsapp" 
                placeholder="10 digits" 
                value={formData.whatsapp} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm transition-all" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-1">Address</label>
              <input 
                type="text" 
                name="address" 
                placeholder="Full address" 
                value={formData.address} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">City</label>
              <input 
                type="text" 
                name="city" 
                placeholder="City" 
                value={formData.city} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">State</label>
              <input 
                type="text" 
                name="state" 
                placeholder="State" 
                value={formData.state} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm transition-all" 
              />
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Business Profile */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Business Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Partner Type</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm transition-all cursor-pointer"
              >
                <option value="Individual">Individual</option>
                <option value="Company">Company</option>
                <option value="Firm">Firm</option>
                <option value="Agency">Agency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Experience (years)</label>
              <input 
                type="number" 
                name="experience" 
                placeholder="0" 
                value={formData.experience} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Focused Project</label>
              <input 
                type="text" 
                name="focusedProject" 
                placeholder="Project name" 
                value={formData.focusedProject} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Preferred Locations</label>
              <input 
                type="text" 
                name="preferredLocations" 
                placeholder="Mumbai, Pune, Delhi" 
                value={formData.preferredLocations} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Team Size</label>
              <input 
                type="number" 
                name="teamSize" 
                placeholder="0" 
                value={formData.teamSize} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Information Note box */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">Note: This will create a partner account with:</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li><span className="font-medium">Role:</span> Manager (fixed)</li>
            <li><span className="font-medium">User Type:</span> Partner (fixed)</li>
            <li><span className="font-medium">Temporary password</span> will be auto-generated</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-6 py-2.5 text-muted-foreground hover:bg-muted font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />}
            Save Partner
          </button>
        </div>
      </form>
    </div>
  );
}
