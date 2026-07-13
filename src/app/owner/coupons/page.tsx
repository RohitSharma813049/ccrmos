import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import CouponsClient from "@/modules/settings/components/CouponsClient";

export default async function CouponsPage() {
  await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
  return <CouponsClient />;
}
