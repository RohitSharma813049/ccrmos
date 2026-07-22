"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SidebarWrapper({ 
  children, 
  logoUrl, 
  platformName 
}: { 
  children: React.ReactNode;
  logoUrl: string | null;
  platformName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Automatically close the drawer whenever the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop CRM Sidebar */}
      <aside className="hidden md:flex relative z-0 w-64 bg-white border-r border-gray-200 h-full flex-col shrink-0 overflow-hidden">
        {/* Desktop Header */}
        <div className="p-6 relative z-10 flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={platformName} className="max-h-12 w-auto object-contain" />
          ) : (
            <h2 className="font-bold text-xl tracking-tight text-gray-900">{platformName}</h2>
          )}
        </div>
        
        {children}
      </aside>
    </>
  );
}
