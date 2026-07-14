"use client";

import React, { useState } from "react";
import { FilterRule, FilterOperator } from "@/utils/parseFilters";

interface FilterBuilderProps {
  fields: { name: string; label: string; type: "string" | "number" | "date" | "boolean" }[];
  filters: FilterRule[];
  onChange: (filters: FilterRule[]) => void;
  onApply: () => void;
}

export default function FilterBuilder({ fields, filters, onChange, onApply }: FilterBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const addFilter = () => {
    const newFilter: FilterRule = {
      id: Math.random().toString(36).substr(2, 9),
      field: fields[0]?.name || "",
      operator: "equals",
      value: ""
    };
    onChange([...filters, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<FilterRule>) => {
    onChange(filters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeFilter = (id: string) => {
    onChange(filters.filter(f => f.id !== id));
  };

  const moveFilter = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= filters.length) return;
    const newFilters = [...filters];
    const temp = newFilters[index];
    newFilters[index] = newFilters[index + direction];
    newFilters[index + direction] = temp;
    onChange(newFilters);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-all shadow-sm"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters {filters.length > 0 && <span className="bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-xs font-bold">{filters.length}</span>}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
            <h3 className="font-semibold text-gray-800">Advanced Filters</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar space-y-3">
            {filters.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                No filters applied. Add a filter to narrow down results.
              </div>
            ) : (
              filters.map((filter, index) => (
                <div key={filter.id} className="flex flex-col gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl relative group">
                  <div className="flex gap-2">
                    <select
                      value={filter.field}
                      onChange={e => updateFilter(filter.id, { field: e.target.value })}
                      className="flex-1 min-w-0 text-sm border-gray-300 rounded-lg py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {fields.map(f => (
                        <option key={f.name} value={f.name}>{f.label}</option>
                      ))}
                    </select>
                    
                    <select
                      value={filter.operator}
                      onChange={e => updateFilter(filter.id, { operator: e.target.value as FilterOperator })}
                      className="w-32 text-sm border-gray-300 rounded-lg py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not equals</option>
                      <option value="contains">Contains</option>
                      <option value="not_contains">Does not contain</option>
                      <option value="gt">Greater than</option>
                      <option value="lt">Less than</option>
                      <option value="exists">Is empty</option>
                      <option value="not_exists">Is not empty</option>
                    </select>
                  </div>
                  
                  {filter.operator !== "exists" && filter.operator !== "not_exists" && (
                    <input
                      type="text"
                      placeholder="Value..."
                      value={filter.value}
                      onChange={e => updateFilter(filter.id, { value: e.target.value })}
                      className="w-full text-sm border-gray-300 rounded-lg py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  )}

                  <div className="absolute -right-2 -top-2 hidden group-hover:flex bg-white rounded-lg shadow-sm border border-gray-200 text-gray-400">
                     <button onClick={() => moveFilter(index, -1)} disabled={index === 0} className="p-1 hover:text-indigo-600 disabled:opacity-30">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                     </button>
                     <button onClick={() => moveFilter(index, 1)} disabled={index === filters.length - 1} className="p-1 hover:text-indigo-600 disabled:opacity-30">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                     </button>
                     <button onClick={() => removeFilter(filter.id)} className="p-1 text-red-400 hover:text-red-600">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                  </div>
                </div>
              ))
            )}
            
            <button 
              onClick={addFilter}
              className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              + Add Filter Rule
            </button>
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
            <button 
              onClick={() => onChange([])} 
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Clear All
            </button>
            <button 
              onClick={() => {
                onApply();
                setIsOpen(false);
              }} 
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
