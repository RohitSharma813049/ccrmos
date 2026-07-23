"use client";

import React, { useState } from "react";

export function Tooltip({ children, content, disabled = false }: { children: React.ReactNode; content: string; disabled?: boolean }) {
  const [isVisible, setIsVisible] = useState(false);

  if (disabled) return <>{children}</>;

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-sm w-max max-w-[250px] animate-in fade-in zoom-in-95 duration-100 pointer-events-none whitespace-normal text-center">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
