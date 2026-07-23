import Link from "next/link";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import SystemSetting from "@/modules/settings/schemas/SystemSetting";
import Company from "@/modules/companies/schemas/Company";
import CustomModule from "@/modules/settings/schemas/CustomModule";
import NotificationBell from "@/components/ui/NotificationBell";
import ImpersonationBanner from "@/components/ui/ImpersonationBanner";
import SubscriptionAlert from "@/components/ui/SubscriptionAlert";
import { hasModulePermission } from "@/lib/permissions";
import { getSession } from "@/lib/auth-utils";
import User from "@/modules/users/schemas/User";
import AICopilot from "@/components/ui/AICopilot";
import SidebarWrapper from "@/components/layout/SidebarWrapper";
import BottomNav from "@/components/layout/BottomNav";

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

  const customModules = await CustomModule.find({
    active: true,
    $or: [{ companyId: userCompanyId }, { companyId: null }]
  }).select("_id name").lean();

  const isPlatformOwner = (session?.user as any)?.hierarchyLevel === 1;
  const isImpersonating = !!(session?.user as any)?.impersonatedFounderId;

  const dbUser = await User.findById(session?.user?.id).select("avatarUrl").lean();
  const avatarUrl = dbUser?.avatarUrl || null;

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col md:flex-row overflow-hidden">
      <SubscriptionAlert status={subscriptionStatus} />
      
      <SidebarWrapper logoUrl={logoUrl} platformName={platformName}>



        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6 relative z-10 custom-scrollbar">
          <div className="pt-2 pb-2">
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main Menu</p>
          </div>

          <NavItem href="/dashboard" label="Overview" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          
          <NavItem href="/dashboard/workbench" label="Workbench" icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />

          <div className="pt-6 pb-2">
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace</p>
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

          {customModules.length > 0 && (
            <>
              <div className="pt-6 pb-2">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custom Modules</p>
              </div>
              {customModules.map((mod: any) => (
                <NavItem key={mod._id.toString()} href={`/dashboard/modules/${mod._id}`} label={mod.name} icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              ))}
            </>
          )}

          {/* Conditional Admin Menus */}
          {((session?.user?.hierarchyLevel === 2) || isPlatformOwner) && (
            <>
              <div className="pt-6 pb-2">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Settings</p>
              </div>

              <NavItem href="/dashboard/forms" label="Forms" icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              <NavItem href="/dashboard/settings/module-fields" label="Module Fields" icon="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              <NavItem href="/dashboard/settings/roles" label="Roles & Permissions" icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              <NavItem href="/dashboard/users" label="User Management" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              <NavItem href="/dashboard/directors" label="Director Management" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              <NavItem href="/dashboard/automations" label="Global Automations" icon="M13 10V3L4 14h7v7l9-11h-7z" />
              <NavItem href="/dashboard/settings/integrations" label="API & Integrations" icon="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              <NavItem href="/dashboard/settings/billing" label="Billing & Plan" icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              <NavItem href="/dashboard/settings/audit" label="Audit Logs" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              <NavItem href="/dashboard/settings/export" label="Export Data" icon="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </>
          )}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-border bg-card/50">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings/profile" className="shrink-0 hover:ring-2 hover:ring-primary rounded-full transition-all focus-visible:outline-none">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover shadow-inner border border-border" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shadow-inner border border-primary/30">
                  {session?.user?.email?.[0].toUpperCase()}
                </div>
              )}
            </Link>
            <Link href="/dashboard/settings/profile" className="flex-1 min-w-0 group cursor-pointer focus-visible:outline-none">
              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{session?.user?.email}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold">
                {session?.user?.role}
              </p>
            </Link>
            <Link href="/api/auth/signout" className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors focus-visible:outline-none" title="Logout">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Link>
          </div>
        </div>
      </SidebarWrapper>

      <BottomNav>
        {/* We reuse the same NavItems logic for the BottomNav "More" menu */}
        <div className="flex flex-col space-y-1">
          <NavItem href="/dashboard" label="Overview" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          
          <NavItem href="/dashboard/workbench" label="Workbench" icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          {hasModulePermission(session.user as any, "Leads", "view") && <NavItem href="/dashboard/leads" label="Lead Management" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
          {hasModulePermission(session.user as any, "Customers", "view") && <NavItem href="/dashboard/customers" label="Customers" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
          {hasModulePermission(session.user as any, "Projects", "view") && <NavItem href="/dashboard/projects" label="Projects" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
          {hasModulePermission(session.user as any, "Orders", "view") && <NavItem href="/dashboard/orders" label="Orders" icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />}
          {hasModulePermission(session.user as any, "Invoices", "view") && <NavItem href="/dashboard/invoices" label="Invoices" icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
          {hasModulePermission(session.user as any, "Tasks", "view") && <NavItem href="/dashboard/tasks" label="Tasks" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />}
          {customModules.length > 0 && customModules.map((mod: any) => (
            <NavItem key={mod._id.toString()} href={`/dashboard/modules/${mod._id}`} label={mod.name} icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          ))}

          {((session?.user?.hierarchyLevel === 2) || isPlatformOwner) && (
            <>
              <div className="pt-6 pb-2">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Settings</p>
              </div>

              <NavItem href="/dashboard/forms" label="Forms" icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              <NavItem href="/dashboard/settings/module-fields" label="Form Designer" icon="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              <NavItem href="/dashboard/settings/dynamic-fields" label="Dynamic Fields" icon="M4 6h16M4 12h16m-7 6h7" />
              <NavItem href="/dashboard/settings/roles" label="Roles & Permissions" icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              <NavItem href="/dashboard/users" label="User Management" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              <NavItem href="/dashboard/directors" label="Director Management" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              <NavItem href="/dashboard/automations" label="Global Automations" icon="M13 10V3L4 14h7v7l9-11h-7z" />
              <NavItem href="/dashboard/settings/integrations" label="API & Integrations" icon="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              <NavItem href="/dashboard/settings/billing" label="Billing & Plan" icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              <NavItem href="/dashboard/settings/audit" label="Audit Logs" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              <NavItem href="/dashboard/settings/export" label="Export Data" icon="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </>
          )}

          {/* Mobile User Profile Footer */}
          <div className="mt-6 p-4 border-t border-border shrink-0">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/settings/profile" className="shrink-0 hover:ring-2 hover:ring-primary rounded-full transition-all focus-visible:outline-none">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover shadow-inner border border-border" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shadow-inner border border-primary/30">
                    {session?.user?.email?.[0].toUpperCase()}
                  </div>
                )}
              </Link>
              <Link href="/dashboard/settings/profile" className="flex-1 min-w-0 group cursor-pointer focus-visible:outline-none">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{session?.user?.email}</p>
                <p className="text-xs text-muted-foreground uppercase font-semibold">
                  {session?.user?.role}
                </p>
              </Link>
              <Link href="/api/auth/signout" className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors focus-visible:outline-none" title="Logout">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </BottomNav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen w-full min-w-0 overflow-hidden bg-background relative pb-16 md:pb-0">
        {(session?.user as any)?.impersonatedFounderId && <ImpersonationBanner />}

        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-card/40 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 shrink-0 z-10 gap-3">
          {/* Mobile Logo */}
          <div className="md:hidden flex shrink-0 items-center">
            {logoUrl ? (
              <img src={logoUrl} alt={platformName} className="max-h-8 w-auto object-contain" />
            ) : (
              <h2 className="font-bold text-lg tracking-tight text-foreground">{platformName}</h2>
            )}
          </div>
          
          <div className="flex items-center flex-1 min-w-0">
            <div className="relative w-full max-w-md">
              <svg className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search..." className="w-full bg-muted/50 border border-border rounded-full pl-10 pr-4 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-center shrink-0">
            <NotificationBell />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-w-0 p-6 md:p-8 custom-scrollbar z-0 w-full">
          {children}
        </div>
      </main>

      <AICopilot />
    </div>
  );
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
      </svg>
      {label}
    </Link>
  );
}
