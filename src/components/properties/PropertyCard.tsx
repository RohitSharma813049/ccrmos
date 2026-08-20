'use client';

import React from 'react';
import { MapPin, Bed, Bath, Square, MoreVertical } from 'lucide-react';

export interface PropertyType {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl: string;
  status: 'Available' | 'Sold' | 'Under Contract' | 'Off-Market';
  type: string;
}

interface PropertyCardProps {
  property: PropertyType;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/90 text-white';
      case 'Under Contract': return 'bg-amber-500/90 text-white';
      case 'Sold': return 'bg-rose-500/90 text-white';
      default: return 'bg-zinc-500/90 text-white';
    }
  };

  return (
    <div className="group relative rounded-2xl bg-zinc-900/40 border border-zinc-800/60 overflow-hidden transition-all duration-300 hover:bg-zinc-800/50 hover:border-zinc-700/80 hover:shadow-xl hover:shadow-indigo-500/10">
      {/* Image Header */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-800">
        <img 
          src={property.imageUrl} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-80" />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-md shadow-sm backdrop-blur-md ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>

        {/* Action Button */}
        <button className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-950/50 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-zinc-950/80">
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Price Overlay */}
        <div className="absolute bottom-3 left-4">
          <p className="text-2xl font-bold text-white drop-shadow-md">
            ${property.price.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-zinc-100 truncate mb-1">
          {property.title}
        </h3>
        
        <div className="flex items-center text-zinc-400 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Amenities Row */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60 text-sm text-zinc-300">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-zinc-500" />
            <span className="font-medium">{property.bedrooms} <span className="hidden sm:inline">Beds</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-zinc-500" />
            <span className="font-medium">{property.bathrooms} <span className="hidden sm:inline">Baths</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Square className="w-4 h-4 text-zinc-500" />
            <span className="font-medium">{property.sqft.toLocaleString()} <span className="hidden sm:inline">SqFt</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
