"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Search, User, Briefcase, FileText, CheckSquare, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce"; // We might need to create this hook if it doesn't exist. I'll write a simple one inline for now.

function useDebounceInline<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounceInline(query, 300);
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  React.useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.results || []);
        })
        .finally(() => setLoading(false));
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const onSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "Lead": return <User className="w-4 h-4 text-blue-500" />;
      case "Customer": return <Briefcase className="w-4 h-4 text-emerald-500" />;
      case "Project": return <CheckSquare className="w-4 h-4 text-indigo-500" />;
      case "Invoice": return <FileText className="w-4 h-4 text-amber-500" />;
      default: return <Search className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors w-64 border border-zinc-200 dark:border-zinc-700"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search CRM...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 font-mono text-[10px] font-medium text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] p-4 bg-zinc-900/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <Command className="w-full flex flex-col" shouldFilter={false}>
              <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 px-3">
                <Search className="w-5 h-5 text-zinc-400 shrink-0 mr-2" />
                <Command.Input 
                  autoFocus
                  placeholder="Search leads, customers, projects..." 
                  className="flex-1 py-4 text-base bg-transparent border-none focus:outline-none focus:ring-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                  value={query}
                  onValueChange={setQuery}
                />
                <button onClick={() => setOpen(false)} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <Command.List className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                {query.length > 0 && query.length < 2 && (
                  <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                    Type at least 2 characters to search...
                  </Command.Empty>
                )}
                
                {query.length >= 2 && loading && results.length === 0 && (
                  <Command.Loading className="py-6 text-center text-sm text-zinc-500">
                    Searching...
                  </Command.Loading>
                )}

                {query.length >= 2 && !loading && results.length === 0 && (
                  <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                    No results found for "{query}".
                  </Command.Empty>
                )}

                {results.map((item) => (
                  <Command.Item
                    key={`${item.type}-${item.id}`}
                    value={item.title}
                    onSelect={() => onSelect(item.url)}
                    className="flex items-center gap-3 px-3 py-3 text-sm rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.title}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{item.type}</span>
                        <span className="text-xs text-zinc-500 truncate">{item.subtitle}</span>
                      </div>
                    </div>
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
