import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import DirectorsClient from "@/modules/companies/components/DirectorsClient";

export default async function DirectorsPage() {
  // SECURITY: Only users with MANAGE_DIRECTORS permission (Founder) can load this page
  await requirePermission(PERMISSIONS.MANAGE_DIRECTORS);

  return <DirectorsClient />;
}
