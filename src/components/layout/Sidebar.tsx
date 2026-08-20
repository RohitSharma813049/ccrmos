'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FolderKanban, 
  Mail, 
  Phone, 
  CreditCard,
  Settings,
  Puzzle,
  CheckSquare
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Campaigns', href: '/campaigns', icon: Mail },
  { name: 'Calls', href: '/calls', icon: Phone },
  { name: 'Commissions', href: '/commissions', icon: CreditCard },
  { name: 'Integrations', href: '/integrations', icon: Puzzle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-64 bg-zinc-950 border-r border-zinc-800/60 transition-all duration-300 z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-zinc-100 font-semibold tracking-wide text-lg">
            CRMOS
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-indigo-500/10 text-indigo-400' 
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                }
              `}
            >
              <Icon 
                className={`flex-shrink-0 w-5 h-5 mr-3 transition-colors duration-200
                  ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}
                `} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Settings Link */}
      <div className="p-4 border-t border-zinc-800/60">
        <Link
          href="/settings"
          className={`
            group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
            ${pathname.startsWith('/settings') 
              ? 'bg-indigo-500/10 text-indigo-400' 
              : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
            }
          `}
        >
          <Settings className="flex-shrink-0 w-5 h-5 mr-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          Settings
        </Link>
      </div>
    </div>
  );
}
