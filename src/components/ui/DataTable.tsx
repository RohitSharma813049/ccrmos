"use client";

import React, { useState, useEffect } from "react";
import EmptyState from "@/components/ui/EmptyState";
import FilterBuilder from "@/components/ui/FilterBuilder";
import { FilterRule } from "@/utils/parseFilters";
import { Skeleton } from "@/components/ui/Skeleton";

export interface ColumnDef<T> {
  id?: string;
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  search?: string;
  onSearchChange?: (val: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  
  // Custom Dynamic Filters
  filterFields?: { name: string; label: string; type: "string" | "number" | "date" | "boolean" }[];
  advancedFilters?: FilterRule[];
  onAdvancedFiltersChange?: (filters: FilterRule[]) => void;
  onApplyAdvancedFilters?: () => void;

  filters?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;

  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actions?: React.ReactNode; // Additional actions (like Export)
  itemIdAccessor?: (item: T) => string;
  bulkActions?: { label: string; onClick: (selectedIds: string[]) => void; variant?: "default" | "destructive" }[];
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  search,
  onSearchChange,
  page,
  totalPages,
  onPageChange,
  
  filterFields,
  advancedFilters = [],
  onAdvancedFiltersChange,
  onApplyAdvancedFilters,

  filters,
  emptyTitle = "No results found",
  emptyDescription = "There are no records to display.",
  emptyAction,
  
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  actions,
  itemIdAccessor = (item: any) => item._id || item.id,
  bulkActions = [],
}: DataTableProps<T>) {
  // Use a local state for fast typing, debounce the prop update
  const [localSearch, setLocalSearch] = useState(search || "");

  useEffect(() => {
    if (search !== undefined && search !== localSearch) {
      setLocalSearch(search);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, search]);

  const removeAdvancedFilter = (id: string) => {
    if (!onAdvancedFiltersChange || !onApplyAdvancedFilters) return;
    onAdvancedFiltersChange(advancedFilters.filter(f => f.id !== id));
    // Apply automatically when removing a tag
    setTimeout(() => onApplyAdvancedFilters(), 0);
  };

  return (
    <div className="space-y-4">
      {/* Advanced Filter Tags */}
      {advancedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {advancedFilters.map(f => {
            const fieldLabel = filterFields?.find(field => field.name === f.field)?.label || f.field;
            return (
              <span key={f.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {fieldLabel} {f.operator.replace('_', ' ')} {f.operator !== 'exists' && f.operator !== 'not_exists' && f.value}
                <button onClick={() => removeAdvancedFilter(f.id)} className="ml-1 text-primary/70 hover:text-primary focus-visible:outline-none">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            );
          })}
        </div>
      )}

      {(onSearchChange || filters || filterFields) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row w-full gap-4 items-start sm:items-center">
            {onSearchChange && (
              <div className="relative w-full sm:w-96">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background text-foreground border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground"
                />
                <svg className="w-5 h-5 text-muted-foreground absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}
            
            {filters && (
              <div className="flex flex-wrap items-center gap-2">
                {filters}
              </div>
            )}

            {filterFields && onAdvancedFiltersChange && onApplyAdvancedFilters && (
              <div className="flex-shrink-0">
                <FilterBuilder 
                  fields={filterFields} 
                  filters={advancedFilters} 
                  onChange={onAdvancedFiltersChange} 
                  onApply={onApplyAdvancedFilters} 
                />
              </div>
            )}
            
            {actions && (
              <div className="flex-shrink-0 flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {selectable && selectedIds.length > 0 && bulkActions.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between animate-in fade-in zoom-in duration-200">
          <span className="text-sm font-medium text-primary ml-2">
            {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            {bulkActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => action.onClick(selectedIds)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  action.variant === "destructive" 
                    ? "bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold border-b border-border">
              <tr>
                {selectable && (
                  <th className="px-6 py-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-border bg-background text-primary focus:ring-primary cursor-pointer"
                      checked={data.length > 0 && selectedIds.length === data.length}
                      onChange={(e) => {
                        if (!onSelectionChange) return;
                        if (e.target.checked) {
                          onSelectionChange(data.map(itemIdAccessor));
                        } else {
                          onSelectionChange([]);
                        }
                      }}
                    />
                  </th>
                )}
                {columns.map((col, idx) => (
                  <th key={idx} className={`px-6 py-4 ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    {selectable && (
                      <td className="px-6 py-4 w-12 text-center">
                        <Skeleton className="w-4 h-4 rounded mx-auto" />
                      </td>
                    )}
                    {columns.map((col, colIdx) => (
                      <td key={`skeleton-col-${colIdx}`} className={`px-6 py-4 ${col.className || ""}`}>
                        <Skeleton className="h-4 w-full max-w-[80%] rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    <EmptyState 
                      title={emptyTitle} 
                      description={emptyDescription}
                      action={emptyAction}
                    />
                  </td>
                </tr>
              ) : (
                data.map((item, rowIdx) => {
                  const itemId = itemIdAccessor(item);
                  const isSelected = selectedIds.includes(itemId);
                  
                  return (
                    <tr key={rowIdx} className={`hover:bg-muted/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                      {selectable && (
                        <td className="px-6 py-4 w-12 text-center">
                          <input 
                            type="checkbox" 
                            className="rounded border-border bg-background text-primary focus:ring-primary cursor-pointer"
                            checked={isSelected}
                            onChange={(e) => {
                              if (!onSelectionChange) return;
                              if (e.target.checked) {
                                onSelectionChange([...selectedIds, itemId]);
                              } else {
                                onSelectionChange(selectedIds.filter(id => id !== itemId));
                              }
                            }}
                          />
                        </td>
                      )}
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className={`px-6 py-4 ${col.className || ""}`}>
                          {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey] || "-") : "-"}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages !== undefined && totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onPageChange(Math.max(1, (page || 1) - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm font-medium border border-border bg-background text-foreground rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => onPageChange(Math.min(totalPages, (page || 1) + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm font-medium border border-border bg-background text-foreground rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
