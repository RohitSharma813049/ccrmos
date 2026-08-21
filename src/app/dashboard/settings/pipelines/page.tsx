import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import PipelinesClient from "@/modules/settings/components/PipelinesClient";

export default async function PipelinesPage() {
  await requirePermission(PERMISSIONS.MANAGE_TEAMS);
  return <PipelinesClient />;
}
