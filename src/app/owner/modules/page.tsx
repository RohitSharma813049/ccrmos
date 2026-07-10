import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import ModulesClient from "@/modules/settings/components/ModulesClient";

export default async function ModulesPage() {
  await requirePermission(PERMISSIONS.CREATE_DYNAMIC_MODULES);
  return <ModulesClient />;
}
