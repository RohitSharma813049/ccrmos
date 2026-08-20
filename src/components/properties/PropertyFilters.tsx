'use client';

import React from 'react';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';

export function PropertyFilters() {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      {/* Search Bar */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-500" />
        </div>
        <input
          type="text"
          placeholder="Search by address, city, or zip code..."
          className="block w-full pl-10 pr-3 py-2.5 border border-zinc-800 rounded-xl leading-5 bg-zinc-900/50 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 shadow-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
        <select className="px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 text-sm font-medium text-zinc-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none min-w-[120px] shadow-sm">
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Under Contract">Under Contract</option>
          <option value="Sold">Sold</option>
        </select>

        <select className="px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 text-sm font-medium text-zinc-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none min-w-[120px] shadow-sm">
          <option value="">All Types</option>
          <option value="House">House</option>
          <option value="Condo">Condo</option>
          <option value="Commercial">Commercial</option>
        </select>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 text-sm font-medium text-zinc-300 rounded-xl hover:bg-zinc-800 hover:text-zinc-100 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm">
          <SlidersHorizontal className="w-4 h-4" />
          More Filters
        </button>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-sm font-semibold text-white rounded-xl shadow-sm shadow-indigo-500/20 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950 flex-shrink-0">
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>
    </div>
  );
}
