import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import DepartmentsClient from "@/modules/companies/components/DepartmentsClient";

export default async function DepartmentsPage() {
  // We can require a high-level permission or a specific one for managing departments
  await requirePermission(PERMISSIONS.MANAGE_DEPARTMENTS);

  return <DepartmentsClient />;
}
