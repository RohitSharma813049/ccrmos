import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import WhitelabelClient from "@/modules/settings/components/WhitelabelClient";

export default async function WhitelabelPage() {
  await requirePermission(PERMISSIONS.WHITE_LABEL_MANAGEMENT);
  return <WhitelabelClient />;
}
