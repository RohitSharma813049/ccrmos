import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import ConversionsClient from "@/modules/settings/components/ConversionsClient";

export default async function ConversionsPage() {
  await requirePermission(PERMISSIONS.MANAGE_TEAMS);
  return <ConversionsClient />;
}
