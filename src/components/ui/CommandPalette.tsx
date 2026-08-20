'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Building, Settings, Mail, FileText, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard listeners for opening/closing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const mockGroups = [
    {
      title: 'Navigation',
      items: [
        { icon: User, label: 'Go to Contacts', url: '/contacts' },
        { icon: Building, label: 'Go to Properties', url: '/properties' },
        { icon: Mail, label: 'Go to Campaigns', url: '/campaigns' },
        { icon: Settings, label: 'Go to Settings', url: '/settings' },
      ]
    },
    {
      title: 'Quick Actions',
      items: [
        { icon: Plus, label: 'Create new Lead', url: '/contacts' },
        { icon: FileText, label: 'Generate Report', url: '/dashboard' },
      ]
    }
  ];

  // Filter items based on query
  const filteredGroups = query 
    ? mockGroups.map(group => ({
        ...group,
        items: group.items.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
      })).filter(group => group.items.length > 0)
    : mockGroups;

  const flatItems = filteredGroups.flatMap(group => group.items);

  // Keyboard navigation within the palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % flatItems.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + flatItems.length) % flatItems.length);
      }
      if (e.key === 'Enter' && flatItems[selectedIndex]) {
        e.preventDefault();
        setIsOpen(false);
        router.push(flatItems[selectedIndex].url);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatItems, selectedIndex, router]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Command Palette Modal */}
      <div className="fixed inset-0 z-[110] flex items-start justify-center pt-24 sm:pt-32 px-4 pointer-events-none">
        <div 
          className="w-full max-w-2xl bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/60 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col animate-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Search Input Area */}
          <div className="flex items-center px-4 py-4 border-b border-zinc-800/60">
            <Search className="w-5 h-5 text-zinc-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-500 text-lg"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
            />
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <kbd className="px-2 py-1 bg-zinc-800 rounded text-xs font-medium text-zinc-400 font-sans border border-zinc-700 shadow-sm">ESC</kbd>
            </div>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {flatItems.length === 0 ? (
              <div className="py-14 text-center text-zinc-500">
                <p className="text-sm">No results found for &quot;{query}&quot;</p>
              </div>
            ) : (
              filteredGroups.map((group, groupIdx) => {
                // Calculate absolute index for selection matching
                let startIndex = 0;
                for (let i = 0; i < groupIdx; i++) {
                  startIndex += filteredGroups[i].items.length;
                }

                return (
                  <div key={group.title} className="mb-4 last:mb-0">
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      {group.title}
                    </div>
                    <div className="flex flex-col gap-1">
                      {group.items.map((item, idx) => {
                        const absoluteIndex = startIndex + idx;
                        const isSelected = absoluteIndex === selectedIndex;
                        
                        return (
                          <div
                            key={item.label}
                            onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                            onClick={() => {
                              setIsOpen(false);
                              router.push(item.url);
                            }}
                            className={`flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-indigo-500/10 text-indigo-100' 
                                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800/80 text-zinc-400'}`}>
                                <item.icon className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            {isSelected && (
                              <ArrowRight className="w-4 h-4 text-indigo-400/70" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 border-t border-zinc-800/60 bg-zinc-900/50 flex items-center justify-between hidden sm:flex">
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded font-sans border border-zinc-700">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded font-sans border border-zinc-700">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded font-sans border border-zinc-700">Enter</kbd>
                to select
              </span>
            </div>
            <div className="text-xs font-semibold text-zinc-600 tracking-widest uppercase">
              CCRM OS
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

import { Plus } from 'lucide-react';
