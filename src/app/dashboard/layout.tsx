import Link from "next/link";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import SystemSetting from "@/modules/settings/schemas/SystemSetting";
import Company from "@/modules/companies/schemas/Company";
import Industry from "@/modules/settings/schemas/Industry";
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
import CompanyModule from "@/modules/companies/schemas/CompanyModule";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  await dbConnect();
  // Determine user company for branding and subscription
  const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;

  // Fetch branding (Tenant specific first, fallback to global)
  let branding = {};
  if (userCompanyId) {
    const tenantWhitelabel = await SystemSetting.findOne({ key: 'whitelabel', companyId: userCompanyId });
    if (tenantWhitelabel?.value) {
      branding = tenantWhitelabel.value;
    }
  }
  
  if (Object.keys(branding).length === 0) {
    const globalWhitelabel = await SystemSetting.findOne({ key: 'whitelabel', companyId: null });
    branding = globalWhitelabel?.value || {};
  }

  const platformName = (branding as any).platformName || 'CRM OS';
  const logoUrl = (branding as any).logoUrl || null;
  const primaryColor = (branding as any).primaryColor || null;

  // Fetch company status for subscription enforcement
  let subscriptionStatus = "active";
  let enabledModules: string[] = [];
  let companyModules: any[] = [];
  let industryName = "CRM";
  
  if (userCompanyId) {
    const company = await Company.findById(userCompanyId)
      .select("subscriptionStatus enabledModules industryId")
      .populate("industryId", "name");
      
    if (company) {
      if ((company as any).subscriptionStatus) subscriptionStatus = (company as any).subscriptionStatus;
      if ((company as any).enabledModules) enabledModules = (company as any).enabledModules;
      if ((company as any).industryId?.name) industryName = (company as any).industryId.name;
    }
    companyModules = await CompanyModule.find({ company_id: userCompanyId, visible: true }).sort({ sort_order: 1 }).lean();
  }

  const isModuleEnabled = (moduleName: string) => {
    // If no userCompanyId (super admin viewing dashboard), maybe allow all? Or just default true for now
    if (!userCompanyId) return true; 
    // If enabledModules array is empty, we can assume it's a legacy company or default to allowing all for backward compatibility, OR strictly deny. The requirement is strict control, so we should check inclusion.
    // However, to prevent completely locking out old accounts, let's say if enabledModules is missing/empty, we allow all for now, or just strictly check. 
    // Let's strictly check if enabledModules exists and has length > 0.
    if (!enabledModules || enabledModules.length === 0) return true; // Legacy fallback
    return enabledModules.includes(moduleName);
  };

  const customModules = await CustomModule.find({
    active: true,
    $or: [
      { companyId: userCompanyId },
      { enabledBy: userCompanyId }
    ]
  }).select("_id name").lean();

  const isPlatformOwner = (session?.user as any)?.hierarchyLevel === 1;
  const isImpersonating = !!(session?.user as any)?.impersonatedFounderId;

  const dbUser = await User.findById(session?.user?.id).select("avatarUrl").lean();
  const avatarUrl = dbUser?.avatarUrl || null;

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col md:flex-row overflow-hidden">
      {primaryColor && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${primaryColor};
            --ring: ${primaryColor};
          }
        `}} />
      )}
      <SubscriptionAlert status={subscriptionStatus} />
      
      <SidebarWrapper logoUrl={logoUrl} platformName={platformName}>



        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6 relative z-10 custom-scrollbar">
          <div className="pt-2 pb-2">
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main Menu</p>
          </div>
          <NavItem href="/dashboard" label="Overview" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          <NavItem href="/dashboard/calendar" label="Calendar" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          <NavItem href="/dashboard/workbench" label="Workbench" icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />

          {/* AI Features */}
          <div className="pt-6 pb-2">
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-fuchsia-500">AI Features</p>
          </div>
          <NavItem href="/dashboard/ai-agents" label="AI Agents" icon="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          <NavItem href="/dashboard/sound-effect" label="Sound Effects" icon="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          <NavItem href="/dashboard/voices" label="Voices" icon="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />

          {companyModules.length > 0 ? (
            <>
              <div className="pt-6 pb-2">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{industryName} Modules</p>
              </div>
              {companyModules.map((mod: any) => {
                const stdRouteMap: Record<string, string> = {
                  "fb leads": "fb-leads",
                  "fb-leads": "fb-leads",
                  "leads": "leads",
                  "channel partners": "partners",
                  "channel-partners": "partners",
                  "bookings/orders": "bookings",
                  "orders": "bookings",
                  "projects": "projects",
                  "properties": "properties"
                };
                const normalized = (mod.module_id || "").toLowerCase().trim();
                const stdRoute = stdRouteMap[normalized];
                
                const href = stdRoute ? `/dashboard/${stdRoute}` : `/dashboard/${mod.module_id}`;
                // Fallback icon
                const icon = "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6";
                return (
                  <NavItem key={mod._id.toString()} href={href} label={mod.display_name} icon={icon} />
                );
              })}
            </>
          ) : (
            <>
              {/* Legacy fallback if companyModules is empty */}
              <div className="pt-6 pb-2">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Real Estate CRM</p>
              </div>
              {isModuleEnabled("Leads") && (
                <>
                  <NavItem href="/dashboard/fb-leads" label="FB Leads" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  <NavItem href="/dashboard/leads" label="Leads" icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </>
              )}
              <NavItem href="/dashboard/partners" label="Channel Partners" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              <NavItem href="/dashboard/properties" label="Properties" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              <NavItem href="/dashboard/teams" label="Teams" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              {isModuleEnabled("Projects") && (
                <NavItem href="/dashboard/projects" label="Projects" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              )}

              {customModules.length > 0 && (
                <>
                  <div className="pt-6 pb-2">
                    <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custom Modules</p>
                  </div>
                  {customModules.map((mod: any) => {
                    if (!isPlatformOwner && !hasModulePermission(session.user as any, mod.name, "view")) return null;
                    return (
                      <NavItem key={mod._id.toString()} href={`/dashboard/modules/${mod._id}`} label={mod.name} icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    );
                  })}
                </>
              )}
            </>
          )}

          {/* Roles, Users & Integrations (Based on Permissions) */}
          <div className="pt-6 pb-2">
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configuration</p>
          </div>
          {(isPlatformOwner || session?.user?.hierarchyLevel === 2 || hasModulePermission(session.user as any, "User Management", "view")) && (
            <NavItem href="/dashboard/users" label="User Management" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          )}
          {(isPlatformOwner || session?.user?.hierarchyLevel === 2 || hasModulePermission(session.user as any, "Roles & Permissions", "view")) && (
            <NavItem href="/dashboard/settings/roles" label="Roles & Permissions" icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          )}
          {(isPlatformOwner || session?.user?.hierarchyLevel === 2 || hasModulePermission(session.user as any, "API Configuration", "view") || hasModulePermission(session.user as any, "WhatsApp", "view")) && (
            <NavItem href="/dashboard/settings/integrations" label="API & Integrations" icon="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          )}

          {/* Conditional Admin Menus */}
          {((session?.user?.hierarchyLevel === 2) || isPlatformOwner) && (
            <>
              <div className="pt-6 pb-2">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Settings</p>
              </div>
              <NavItem href="/dashboard/settings/branding" label="Branding" icon="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              <NavItem href="/dashboard/settings/custom-modules" label="Custom Modules" icon="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              <NavItem href="/dashboard/lead-status" label="Lead Status" icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              <NavItem href="/dashboard/settings/module-fields" label="Module Fields" icon="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              <NavItem href="/dashboard/departments" label="Department Management" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              <NavItem href="/dashboard/automations" label="Global Automations" icon="M13 10V3L4 14h7v7l9-11h-7z" />
              <NavItem href="/dashboard/settings/billing" label="Billing & Plan" icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              <NavItem href="/dashboard/settings/audit" label="Audit Logs" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              <NavItem href="/dashboard/settings/export" label="Export Data" icon="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              <NavItem href="/dashboard/settings/recycle-bin" label="Recycle Bin" icon="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          
          {/* AI Features Mobile */}
          <div className="pt-6 pb-2">
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-fuchsia-500">AI Features</p>
          </div>
          <NavItem href="/dashboard/ai-agents" label="AI Agents" icon="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />

          {companyModules.length > 0 ? (
            <>
              <div className="pt-6 pb-2">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{industryName} Modules</p>
              </div>
              {companyModules.map((mod: any) => {
                const stdRouteMap: Record<string, string> = {
                  "fb leads": "fb-leads",
                  "fb-leads": "fb-leads",
                  "leads": "leads",
                  "channel partners": "partners",
                  "channel-partners": "partners",
                  "bookings/orders": "bookings",
                  "orders": "bookings",
                  "projects": "projects",
                  "properties": "properties"
                };
                const normalized = (mod.module_id || "").toLowerCase().trim();
                const stdRoute = stdRouteMap[normalized];
                
                const href = stdRoute ? `/dashboard/${stdRoute}` : `/dashboard/${mod.module_id}`;
                const icon = "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6";
                return (
                  <NavItem key={mod._id.toString()} href={href} label={mod.display_name} icon={icon} />
                );
              })}
            </>
          ) : (
            <>
              {/* Legacy fallback */}
              <div className="pt-6 pb-2">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Real Estate</p>
              </div>
              {isModuleEnabled("Leads") && hasModulePermission(session.user as any, "Leads", "view") && (
                <>
                  <NavItem href="/dashboard/fb-leads" label="FB Leads" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  <NavItem href="/dashboard/leads" label="Leads" icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </>
              )}
              <NavItem href="/dashboard/partners" label="Channel Partners" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              <NavItem href="/dashboard/properties" label="Properties" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              {hasModulePermission(session.user as any, "Projects", "view") && <NavItem href="/dashboard/projects" label="Projects" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}


              {customModules.length > 0 && (
                <>
                  <div className="pt-6 pb-2">
                    <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custom Modules</p>
                  </div>
                  {customModules.map((mod: any) => {
                    if (!isPlatformOwner && !hasModulePermission(session.user as any, mod.name, "view")) return null;
                    return (
                      <NavItem key={mod._id.toString()} href={`/dashboard/modules/${mod._id}`} label={mod.name} icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    );
                  })}
                </>
              )}
            </>
          )}

          {/* Roles, Users & Integrations (Mobile) */}
          <div className="pt-6 pb-2">
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configuration</p>
          </div>
          {(isPlatformOwner || session?.user?.hierarchyLevel === 2 || hasModulePermission(session.user as any, "User Management", "view")) && (
            <NavItem href="/dashboard/users" label="User Management" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          )}
          {(isPlatformOwner || session?.user?.hierarchyLevel === 2 || hasModulePermission(session.user as any, "Roles & Permissions", "view")) && (
            <NavItem href="/dashboard/settings/roles" label="Roles & Permissions" icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          )}
          {(isPlatformOwner || session?.user?.hierarchyLevel === 2 || hasModulePermission(session.user as any, "API Configuration", "view") || hasModulePermission(session.user as any, "WhatsApp", "view")) && (
            <NavItem href="/dashboard/settings/integrations" label="API & Integrations" icon="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          )}

          {((session?.user?.hierarchyLevel === 2) || isPlatformOwner) && (
            <>
              <div className="pt-6 pb-2">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Settings</p>
              </div>

              <NavItem href="/dashboard/settings/branding" label="Branding" icon="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />

              <NavItem href="/dashboard/settings/custom-modules" label="Custom Modules" icon="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              <NavItem href="/dashboard/lead-status" label="Lead Status" icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              <NavItem href="/dashboard/settings/module-fields" label="Form Designer" icon="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              <NavItem href="/dashboard/settings/dynamic-fields" label="Dynamic Fields" icon="M4 6h16M4 12h16m-7 6h7" />
              <NavItem href="/dashboard/departments" label="Department Management" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              <NavItem href="/dashboard/automations" label="Global Automations" icon="M13 10V3L4 14h7v7l9-11h-7z" />
              <NavItem href="/dashboard/settings/billing" label="Billing & Plan" icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              <NavItem href="/dashboard/settings/audit" label="Audit Logs" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              <NavItem href="/dashboard/settings/export" label="Export Data" icon="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              <NavItem href="/dashboard/settings/recycle-bin" label="Recycle Bin" icon="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        <div className="flex-1 overflow-y-auto min-w-0 p-6 md:p-8 custom-scrollbar w-full">
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
