import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import AutomationsClient from "@/modules/automation/components/AutomationsClient";

export default async function AutomationsPage() {
  // SECURITY: Only users with CONFIGURE_COMPANY_AUTOMATIONS permission (Founder) can load this page
  await requirePermission(PERMISSIONS.CONFIGURE_COMPANY_AUTOMATIONS);

  return <AutomationsClient />;
}
