import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  try {
    // SECURITY: Enforce that only users with Platform Owner permissions can access this entire route group.
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
  } catch (error) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex overflow-hidden">
      {/* Premium Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

        <div className="p-6 relative z-10">
          <Link href="/owner" className="flex items-center gap-3 group">
            <div>
              <h2 className="font-bold text-lg tracking-tight text-gray-900">Platform Owner</h2>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6 relative z-10">
          <div className="pt-4 pb-2">
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Global Management</p>
          </div>

          <NavItem href="/owner/companies" label="Manage Companies" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          <NavItem href="/owner/subscriptions" label="Subscriptions" icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          <NavItem href="/owner/whitelabel" label="White-Labeling" icon="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />

          <div className="pt-6 pb-2">
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dynamic Engine</p>
          </div>

          <NavItem href="/owner/dynamic-fields" label="Dynamic Fields" icon="M4 6h16M4 12h16M4 18h7" />
          <NavItem href="/owner/modules" label="Module Builder" icon="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          <NavItem href="/owner/ai-config" label="AI Configuration" icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />

          <div className="pt-6 pb-2">
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">System</p>
          </div>

          <NavItem href="/owner/settings" label="Global Settings & Templates" icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <NavItem href="/owner/workflow" label="Workflow Engine" icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          <NavItem href="/owner/roles" label="Roles & Permissions" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          <NavItem href="/owner/security" label="Security & API" icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          <NavItem href="/owner/audit" label="Audit Logs" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-white hover:bg-gray-900 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Exit to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 bg-white/50 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
          <h1 className="text-sm font-medium text-gray-600 tracking-wide uppercase">Owner Control Center</h1>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            </div>
            <span className="text-sm text-gray-700">System Active</span>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          {/* Global Background Elements for Main Area */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-white hover:bg-gray-900 rounded-xl transition-all"
    >
      <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
      </svg>
      {label}
    </Link>
  );
}
