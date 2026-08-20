import React from 'react';
import { PropertyCard, PropertyType } from '@/components/properties/PropertyCard';
import { PropertyFilters } from '@/components/properties/PropertyFilters';

// Mock Data for the grid
const mockProperties: PropertyType[] = [
  {
    id: 'prop-1',
    title: 'Modern Waterfront Villa',
    price: 4500000,
    location: '124 Ocean Drive, Miami, FL',
    bedrooms: 5,
    bathrooms: 6,
    sqft: 6200,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    status: 'Available',
    type: 'House'
  },
  {
    id: 'prop-2',
    title: 'Luxury Penthouse Suite',
    price: 2850000,
    location: '450 Park Avenue, New York, NY',
    bedrooms: 3,
    bathrooms: 3.5,
    sqft: 3100,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    status: 'Under Contract',
    type: 'Condo'
  },
  {
    id: 'prop-3',
    title: 'Minimalist Desert Retreat',
    price: 1750000,
    location: '88 Cactus Way, Scottsdale, AZ',
    bedrooms: 4,
    bathrooms: 4,
    sqft: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
    status: 'Available',
    type: 'House'
  },
  {
    id: 'prop-4',
    title: 'Historic Brownstone',
    price: 3200000,
    location: '12 Beacon Street, Boston, MA',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3800,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    status: 'Sold',
    type: 'House'
  },
  {
    id: 'prop-5',
    title: 'Glass Forest Cabin',
    price: 950000,
    location: '45 Pine Ridge, Aspen, CO',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
    status: 'Available',
    type: 'House'
  },
  {
    id: 'prop-6',
    title: 'Downtown Tech Loft',
    price: 1250000,
    location: '800 Market St, San Francisco, CA',
    bedrooms: 1,
    bathrooms: 1.5,
    sqft: 1400,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    status: 'Available',
    type: 'Condo'
  }
];

export default function PropertiesPage() {
  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Properties</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your luxury listings and track their market status.
        </p>
      </div>

      {/* Filter Bar */}
      <PropertyFilters />

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
        {mockProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

    </div>
  );
}
