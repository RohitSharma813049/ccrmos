import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import IndustriesClient from "@/modules/settings/components/IndustriesClient";

export default async function IndustriesPage() {
  await requirePermission(PERMISSIONS.CREATE_INDUSTRY_TEMPLATES);
  return <IndustriesClient />;
}
