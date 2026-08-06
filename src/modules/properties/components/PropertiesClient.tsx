"use client";

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'react-hot-toast';
import DocumentUpload, { DocumentInfo } from '@/components/ui/DocumentUpload';

export default function PropertiesClient() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const initialForm = {
    title: "",
    description: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    status: "Available",
    type: "House",
    documents: [] as DocumentInfo[]
  };
  const [formData, setFormData] = useState<any>(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (statusFilter) query.append("status", statusFilter);
      if (typeFilter) query.append("type", typeFilter);

      const res = await fetch(`/api/properties?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [search, statusFilter, typeFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = !!editingProperty;
      const url = isEdit ? `/api/properties/${editingProperty._id}` : `/api/properties`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(`Property ${isEdit ? 'updated' : 'added'} successfully!`);
        setIsModalOpen(false);
        setEditingProperty(null);
        setFormData(initialForm);
        fetchProperties();
      } else {
        toast.error("Failed to save property");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (prop: any) => {
    setEditingProperty(prop);
    setFormData({
      title: prop.title || "",
      description: prop.description || "",
      price: prop.price || "",
      location: prop.location || "",
      bedrooms: prop.bedrooms || "",
      bathrooms: prop.bathrooms || "",
      squareFeet: prop.squareFeet || "",
      status: prop.status || "Available",
      type: prop.type || "House",
      documents: prop.documents || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Property deleted");
        fetchProperties();
      } else {
        toast.error("Failed to delete property");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6 fade-in pb-12">
      <PageHeader 
        title="Property Inventory"
        description="Manage your real estate listings and inventory."
      >
        <button 
          onClick={() => {
            setEditingProperty(null);
            setFormData(initialForm);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input 
          type="text"
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-border rounded-xl bg-card focus:ring-2 focus:ring-primary outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-xl bg-card focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Sold">Sold</option>
          <option value="Pending">Pending</option>
          <option value="Off-Market">Off-Market</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-xl bg-card focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="">All Types</option>
          <option value="House">House</option>
          <option value="Apartment">Apartment</option>
          <option value="Condo">Condo</option>
          <option value="Commercial">Commercial</option>
          <option value="Land">Land</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground animate-pulse">Loading properties...</div>
      ) : properties.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-border">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-foreground">No properties found</h3>
          <p className="text-muted-foreground mt-1 mb-4">You haven't added any properties to your inventory yet.</p>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">Add First Property</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((prop: any) => (
            <div key={prop._id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all group flex flex-col">
              <div className="h-48 bg-muted relative">
                {prop.images && prop.images.length > 0 ? (
                  <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <svg className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${
                    prop.status === 'Available' ? 'bg-green-500 text-white' : 
                    prop.status === 'Sold' ? 'bg-red-500 text-white' : 
                    prop.status === 'Pending' ? 'bg-yellow-500 text-white' : 
                    'bg-gray-500 text-white'
                  }`}>
                    {prop.status}
                  </span>
                </div>
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md font-medium">
                  {prop.type}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-foreground text-lg line-clamp-1">{prop.title}</h3>
                <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1 line-clamp-1">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {prop.location || "No location set"}
                </p>
                <div className="mt-4 font-bold text-xl text-primary">
                  {prop.price ? `$${Number(prop.price).toLocaleString()}` : "Price upon request"}
                </div>
                
                <div className="mt-4 pt-4 border-t border-border flex justify-between text-muted-foreground text-sm">
                  <div className="flex items-center gap-1" title="Bedrooms">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    {prop.bedrooms || 0} Beds
                  </div>
                  <div className="flex items-center gap-1" title="Bathrooms">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {prop.bathrooms || 0} Baths
                  </div>
                  <div className="flex items-center gap-1" title="Square Feet">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    {prop.squareFeet || 0} sqft
                  </div>
                </div>

                <div className="mt-4 pt-4 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(prop)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(prop._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold text-foreground">{editingProperty ? "Edit Property" : "Add New Property"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-card" placeholder="e.g. Modern Villa in Beverly Hills" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Property Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-card">
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Condo">Condo</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Land">Land</option>
                    <option value="Farm Land">Farm Land</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-card">
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Pending">Pending</option>
                    <option value="Off-Market">Off-Market</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Price (USD)</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-card" placeholder="e.g. 500000" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-card" placeholder="City, State or Full Address" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Bedrooms</label>
                  <input type="number" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-card" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Bathrooms</label>
                  <input type="number" step="0.5" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-card" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Square Feet</label>
                  <input type="number" value={formData.squareFeet} onChange={e => setFormData({...formData, squareFeet: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-card" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-card resize-none" placeholder="Describe the property..." />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-foreground mb-2">Documents & Brochures</label>
                <DocumentUpload 
                  documents={formData.documents}
                  onChange={(docs) => setFormData({ ...formData, documents: docs })}
                  maxFiles={10}
                />
              </div>
            </form>

            <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors">Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={saving} className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : "Save Property"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
