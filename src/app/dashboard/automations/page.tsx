import { requirePermission, getSession } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import AutomationsClient from "@/modules/automation/components/AutomationsClient";

export default async function AutomationsPage() {
  const session = await getSession();
  const hierarchyLevel = (session?.user as any)?.hierarchyLevel;
  
  // Platform owners (hierarchy 1) bypass permission checks in requirePermission, but let's be explicit
  // about the global flag.
  const isGlobal = hierarchyLevel === 1;

  if (!isGlobal) {
    // SECURITY: Only users with CONFIGURE_COMPANY_AUTOMATIONS permission (Founder) can load this page
    await requirePermission(PERMISSIONS.CONFIGURE_COMPANY_AUTOMATIONS);
  }

  return <AutomationsClient isGlobal={isGlobal} />;
}
