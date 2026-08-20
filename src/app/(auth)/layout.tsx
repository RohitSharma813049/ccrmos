import React from 'react';
import { Building2 } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#09090b] selection:bg-indigo-500/30">
      
      {/* Left Pane - Branding & Graphic (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 border-r border-zinc-800/60 items-center justify-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950 to-zinc-950"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen opacity-50 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen opacity-50 -translate-x-1/3 translate-y-1/3"></div>

        {/* Content */}
        <div className="relative z-10 p-12 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-zinc-100 font-bold tracking-wide text-2xl">
              CRMOS
            </span>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            The next generation of real estate management.
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Manage your leads, close deals faster, and scale your brokerage with our enterprise-grade CRM architecture.
          </p>
          
          {/* Mock Social Proof */}
          <div className="mt-12 flex items-center gap-4 border-t border-zinc-800/60 pt-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-950 flex-shrink-0" />
              ))}
            </div>
            <div className="text-sm text-zinc-400">
              Trusted by over <strong className="text-zinc-100">10,000+</strong> top agents.
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-2 mb-12 justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-zinc-100 font-bold tracking-wide text-xl">
            CRMOS
          </span>
        </div>

        {children}
        
      </div>
    </div>
  );
}
