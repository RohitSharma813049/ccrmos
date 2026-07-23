import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import TenantCustomModulesClient from "@/modules/dynamic/components/TenantCustomModulesClient";

export default async function CustomModulesPage() {
  await requirePermission(PERMISSIONS.ASSIGN_PERMISSIONS); 
  return <TenantCustomModulesClient />;
}
