import Link from "next/link";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import SystemSetting from "@/modules/settings/schemas/SystemSetting";
import Company from "@/modules/companies/schemas/Company";
import NotificationBell from "@/components/ui/NotificationBell";
import ImpersonationBanner from "@/components/ui/ImpersonationBanner";
import SubscriptionAlert from "@/components/ui/SubscriptionAlert";
import { hasModulePermission } from "@/lib/permissions";
import { getSession } from "@/lib/auth-utils";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  
  await dbConnect();
  // Fetch global branding
  const whitelabelSetting = await SystemSetting.findOne({ key: 'whitelabel', companyId: null });
  const branding = whitelabelSetting?.value || {};
  const platformName = branding.platformName || 'CRM OS';
  const logoUrl = branding.logoUrl || null;

  // Fetch company status for subscription enforcement
  const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
  let subscriptionStatus = "active";
  if (userCompanyId) {
    const company = await Company.findById(userCompanyId).select("subscriptionStatus");
    if (company && company.subscriptionStatus) {
      subscriptionStatus = company.subscriptionStatus;
    }
  }

  const isPlatformOwner = (session?.user as any)?.hierarchyLevel === 1;
  const isImpersonating = !!(session?.user as any)?.impersonatedFounderId;

  return (
    <div className="h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row overflow-hidden">
      <SubscriptionAlert status={subscriptionStatus} />
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        {logoUrl ? (
          <img src={logoUrl} alt={platformName} className="h-8 object-contain" />
        ) : (
          <h1 className="font-bold text-xl text-gray-900">{platformName}</h1>
        )}
        <button className="p-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Main CRM Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

        <div className="p-6 relative z-10 flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={platformName} className="max-h-12 w-auto object-contain" />
          ) : (
            <h2 className="font-bold text-xl tracking-tight text-gray-900">{platformName}</h2>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6 relative z-10 custom-scrollbar">
          <div className="pt-2 pb-2">
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Menu</p>
          </div>

          <NavItem href="/dashboard" label="Overview" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          
          {(!isPlatformOwner || isImpersonating) && (
            <>
              <NavItem href="/dashboard/workbench" label="Workbench" icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />

              <div className="pt-6 pb-2">
                <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Workspace</p>
              </div>
          {hasModulePermission(session.user as any, "Leads", "view") && (
            <NavItem href="/dashboard/leads" label="Lead Management" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          )}
          {hasModulePermission(session.user as any, "Customers", "view") && (
            <NavItem href="/dashboard/customers" label="Customers" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          )}
          {hasModulePermission(session.user as any, "Projects", "view") && (
            <NavItem href="/dashboard/projects" label="Projects" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          )}
          {hasModulePermission(session.user as any, "Orders", "view") && (
            <NavItem href="/dashboard/orders" label="Orders" icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          )}
          {hasModulePermission(session.user as any, "Invoices", "view") && (
            <NavItem href="/dashboard/invoices" label="Invoices" icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          )}
          {hasModulePermission(session.user as any, "Tasks", "view") && (
            <NavItem href="/dashboard/tasks" label="Tasks" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          )}

            </>
          )}

          {/* Conditional Admin Menus */}
          {((session?.user?.hierarchyLevel === 2) || (isPlatformOwner && isImpersonating)) && (
            <>
              <div className="pt-6 pb-2">
                <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Admin</p>
              </div>
              <NavItem href="/dashboard/forms" label="Forms" icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              <NavItem href="/dashboard/settings/module-fields" label="Module Fields" icon="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              <NavItem href="/dashboard/settings/roles" label="Roles & Permissions" icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              <NavItem href="/dashboard/users" label="User Management" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              <NavItem href="/dashboard/directors" label="Director Management" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              <NavItem href="/dashboard/automations" label="Global Automations" icon="M13 10V3L4 14h7v7l9-11h-7z" />
              <NavItem href="/dashboard/settings/integrations" label="API & Integrations" icon="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              <NavItem href="/dashboard/settings/billing" label="Billing & Plan" icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </>
          )}

          {session?.user?.hierarchyLevel === 1 && (
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <p className="text-xs text-blue-400 font-bold uppercase mb-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Platform Owner
              </p>
              <Link href="/owner" className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                Go to Control Center
              </Link>
            </div>
          )}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gray-200 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-sm shadow-inner border border-gray-500/30">
              {session?.user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.email}</p>
              <p className="text-xs text-gray-500 uppercase font-semibold">{session?.user?.role}</p>
            </div>
            <Link href="/api/auth/signout" className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Logout">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 relative">
        {(session?.user as any)?.impersonatedFounderId && <ImpersonationBanner />}
        
        {/* Global Background Gradients */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Top Navbar */}
        <header className="h-16 border-b border-gray-200/60 bg-white/40 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search across CRM..." className="w-64 bg-gray-50/50 border border-gray-200 rounded-full pl-10 pr-4 py-1.5 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar z-0">
          <div className="max-w-7xl mx-auto">
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
      className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-white hover:bg-gray-900/80 rounded-xl transition-all"
    >
      <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
      </svg>
      {label}
    </Link>
  );
}
