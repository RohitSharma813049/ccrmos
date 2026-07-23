"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function BottomNav({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  // Close the Action Sheet when navigating
  useEffect(() => {
    setShowMore(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  return (
    <>
      {/* Sleek Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-card/90 backdrop-blur-md border-t border-border/50 z-50 flex items-center justify-around pb-safe pt-1 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] h-16">
        <NavItem href="/dashboard" label="Home" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" active={isActive("/dashboard") && !pathname?.includes("/leads") && !pathname?.includes("/customers")} />
        <NavItem href="/dashboard/leads" label="Leads" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" active={isActive("/dashboard/leads")} />
        <NavItem href="/dashboard/customers" label="Customers" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" active={isActive("/dashboard/customers")} />
        
        <button 
          onClick={() => setShowMore(!showMore)}
          className={`flex flex-col items-center justify-center w-[20%] h-full gap-1 transition-all duration-200 focus-visible:outline-none ${showMore ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <svg className={`w-6 h-6 transition-transform duration-200 ${showMore ? 'scale-110' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={showMore ? 2 : 1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-[10px] font-semibold tracking-wide">Menu</span>
        </button>
      </nav>

      {/* Modern iOS-Style Action Sheet Overlay */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all" onClick={() => setShowMore(false)}>
          <div 
            className="absolute bottom-16 left-0 w-full bg-card border-t border-border rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] pb-4 overflow-hidden animate-in slide-in-from-bottom-full duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-muted rounded-full mb-3" />
              <div className="w-full flex justify-between items-center px-6">
                <h3 className="text-xl font-bold text-foreground tracking-tight">Main Menu</h3>
                <button onClick={() => setShowMore(false)} className="p-2 bg-muted/80 text-muted-foreground rounded-full hover:bg-muted active:scale-95 transition-all focus-visible:outline-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="max-h-[65vh] overflow-y-auto px-4 pb-8 space-y-1 custom-scrollbar">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NavItem({ href, label, icon, active }: { href: string; label: string; icon: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center w-[20%] h-full gap-1 transition-all duration-200 active:scale-95 focus-visible:outline-none ${
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <div className={`relative flex items-center justify-center transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d={icon} />
        </svg>
        {active && <span className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full" />}
      </div>
      <span className={`text-[10px] tracking-wide ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>
    </Link>
  );
}
