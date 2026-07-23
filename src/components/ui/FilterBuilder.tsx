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
        className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl bg-background text-foreground hover:bg-muted focus:ring-2 focus:ring-primary font-medium text-sm transition-all shadow-sm focus-visible:outline-none"
      >
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters {filters.length > 0 && <span className="bg-primary/10 text-primary py-0.5 px-2 rounded-full text-xs font-bold">{filters.length}</span>}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 max-w-[90vw] bg-card border border-border rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30 rounded-t-2xl">
            <h3 className="font-semibold text-foreground">Advanced Filters</h3>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground focus-visible:outline-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar space-y-3">
            {filters.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No filters applied. Add a filter to narrow down results.
              </div>
            ) : (
              filters.map((filter, index) => (
                <div key={filter.id} className="flex flex-col gap-2 p-3 bg-muted/20 border border-border rounded-xl relative group">
                  <div className="flex gap-2">
                    <select
                      value={filter.field}
                      onChange={e => updateFilter(filter.id, { field: e.target.value })}
                      className="flex-1 min-w-0 text-sm border-border bg-background text-foreground rounded-lg py-1.5 focus:ring-primary focus:border-primary"
                    >
                      {fields.map(f => (
                        <option key={f.name} value={f.name}>{f.label}</option>
                      ))}
                    </select>
                    
                    <select
                      value={filter.operator}
                      onChange={e => updateFilter(filter.id, { operator: e.target.value as FilterOperator })}
                      className="w-32 text-sm border-border bg-background text-foreground rounded-lg py-1.5 focus:ring-primary focus:border-primary"
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
                      className="w-full text-sm border-border bg-background text-foreground rounded-lg py-1.5 focus:ring-primary focus:border-primary placeholder:text-muted-foreground"
                    />
                  )}

                  <div className="absolute -right-2 -top-2 hidden group-hover:flex bg-card rounded-lg shadow-sm border border-border text-muted-foreground">
                     <button onClick={() => moveFilter(index, -1)} disabled={index === 0} className="p-1 hover:text-primary disabled:opacity-30 focus-visible:outline-none">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                     </button>
                     <button onClick={() => moveFilter(index, 1)} disabled={index === filters.length - 1} className="p-1 hover:text-primary disabled:opacity-30 focus-visible:outline-none">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                     </button>
                     <button onClick={() => removeFilter(filter.id)} className="p-1 text-destructive/70 hover:text-destructive focus-visible:outline-none">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                  </div>
                </div>
              ))
            )}
            
            <button 
              onClick={addFilter}
              className="w-full py-2 border-2 border-dashed border-border text-muted-foreground rounded-xl text-sm font-medium hover:border-primary/50 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            >
              + Add Filter Rule
            </button>
          </div>
          
          <div className="p-4 border-t border-border bg-muted/30 rounded-b-2xl flex justify-end gap-3">
            <button 
              onClick={() => onChange([])} 
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-medium focus-visible:outline-none"
            >
              Clear All
            </button>
            <button 
              onClick={() => {
                onApply();
                setIsOpen(false);
              }} 
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-sm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
