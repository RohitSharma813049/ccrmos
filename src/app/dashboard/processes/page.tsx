import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import ProcessesClient from "@/modules/companies/components/ProcessesClient";

export default async function ProcessesPage() {
  // Using MANAGE_DEPARTMENTS since processes fall under the same hierarchy structure
  await requirePermission(PERMISSIONS.MANAGE_DEPARTMENTS);

  return <ProcessesClient />;
}
