import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import Link from "next/link";
import { redirect } from "next/navigation";
import AICopilot from "@/components/ui/AICopilot";
import OwnerSidebar from "@/components/layout/OwnerSidebar";
import dbConnect from "@/lib/db";
import SystemSetting from "@/modules/settings/schemas/SystemSetting";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  try {
    // SECURITY: Enforce that only users with Platform Owner permissions can access this entire route group.
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
  } catch (error) {
    redirect("/dashboard");
  }

  await dbConnect();
  const globalWhitelabel = await SystemSetting.findOne({ key: 'whitelabel', companyId: null });
  const branding = globalWhitelabel?.value || {};
  const primaryColor = branding.primaryColor || null;

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
      <OwnerSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen w-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="hidden md:flex h-16 border-b border-border bg-card/50 backdrop-blur-xl items-center justify-between px-4 md:px-8 shrink-0">
          <h1 className="text-xs md:text-sm font-medium text-muted-foreground tracking-wide uppercase">Owner Control Center</h1>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <span className="text-sm text-foreground">System Active</span>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto min-w-0 p-4 md:p-8 custom-scrollbar w-full">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
      
      <AICopilot />
    </div>
  );
}
