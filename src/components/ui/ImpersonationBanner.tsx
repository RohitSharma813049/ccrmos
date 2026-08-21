"use client";

import { useRouter } from "next/navigation";

export default function ImpersonationBanner() {
  const router = useRouter();

  const handleStop = async () => {
    try {
      const res = await fetch("/api/owner/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ founderId: null })
      });
      if (res.ok) {
        window.location.href = "/owner/companies";
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-sm shrink-0 z-50 shadow-sm relative">
      <div className="flex items-center gap-2 font-medium">
        <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Platform Owner Mode: You are currently viewing data as a Tenant. All actions you take will affect this specific tenant.</span>
      </div>
      <button 
        onClick={handleStop}
        className="bg-zinc-900/40 backdrop-blur-xl/20 hover:bg-zinc-900/40 backdrop-blur-xl/30 text-white px-3 py-1 rounded-md transition-colors font-semibold shadow-sm border border-white/10"
      >
        Exit Tenant View
      </button>
    </div>
  );
}
