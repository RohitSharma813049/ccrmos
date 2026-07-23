"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePermissions } from "@/hooks/usePermissions";

interface Shortcut {
  id: string;
  name: string;
  url: string;
  icon: string;
  isPinned: boolean;
  order: number;
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: "new-lead", name: "New Lead", url: "/leads", icon: "+L", isPinned: true, order: 1 },
  { id: "new-project", name: "New Project", url: "/projects", icon: "+P", isPinned: true, order: 2 },
  { id: "view-invoices", name: "Invoices", url: "/invoices", icon: "$", isPinned: true, order: 3 },
  { id: "view-tasks", name: "Tasks", url: "/tasks", icon: "☑", isPinned: false, order: 4 },
  { id: "add-user", name: "Add User", url: "/settings/users", icon: "+U", isPinned: false, order: 5 },
  { id: "settings", name: "Settings", url: "/settings/company", icon: "⚙", isPinned: false, order: 6 },
];

export default function DashboardQuickActions() {
  const { session } = usePermissions();
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`dashboard_shortcuts_${session?.user?.id || 'default'}`);
    if (saved) {
      setShortcuts(JSON.parse(saved));
    } else {
      setShortcuts(DEFAULT_SHORTCUTS);
    }
  }, [session?.user?.id]);

  const saveShortcuts = (newShortcuts: Shortcut[]) => {
    setShortcuts(newShortcuts);
    localStorage.setItem(`dashboard_shortcuts_${session?.user?.id || 'default'}`, JSON.stringify(newShortcuts));
  };

  const togglePin = (id: string) => {
    const updated = shortcuts.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s);
    saveShortcuts(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...shortcuts];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    // update order
    updated.forEach((s, i) => s.order = i);
    saveShortcuts(updated);
  };

  const moveDown = (index: number) => {
    if (index === shortcuts.length - 1) return;
    const updated = [...shortcuts];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    // update order
    updated.forEach((s, i) => s.order = i);
    saveShortcuts(updated);
  };

  // Only show for Founder (1) or Super Admin (0), or fallback to display only if required.
  // The prompt says "created on dashboard in founder and Super admin panel".
  if (session?.user?.hierarchyLevel > 2) {
    return null; // hide for lower roles if desired, or just show without edit capability.
  }

  const pinnedShortcuts = shortcuts.filter(s => s.isPinned).sort((a, b) => a.order - b.order);
  const basePath = session?.user?.hierarchyLevel === 1 ? '/owner' : '/dashboard';

  return (
    <div className="bg-card border border-border rounded-xl p-5 mb-8 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <p className="text-xs text-muted-foreground">Shortcuts pinned to your dashboard</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-muted text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {isEditing ? "Done Editing" : "Manage"}
        </button>
      </div>

      {!isEditing ? (
        <div className="flex flex-wrap gap-3">
          {pinnedShortcuts.length > 0 ? (
            pinnedShortcuts.map(s => (
              <Link key={s.id} href={`${basePath}${s.url}`} className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                <span className="w-5 h-5 flex items-center justify-center bg-background/50 rounded text-[10px]">{s.icon}</span>
                {s.name}
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No quick actions pinned. Click Manage to add some.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2 border-t border-border pt-4">
          {shortcuts.map((s, idx) => (
            <div key={s.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg group">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => togglePin(s.id)}
                  className={`w-5 h-5 rounded flex items-center justify-center text-xs border ${s.isPinned ? 'bg-primary border-primary text-primary-foreground' : 'bg-transparent border-input text-transparent hover:border-primary'}`}
                >
                  ✓
                </button>
                <span className="w-6 h-6 flex items-center justify-center bg-muted-foreground/10 text-muted-foreground rounded text-xs">{s.icon}</span>
                <span className="text-sm font-medium text-foreground">{s.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button onClick={() => moveDown(idx)} disabled={idx === shortcuts.length - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
