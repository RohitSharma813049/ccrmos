import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import SubscriptionsClient from "@/modules/settings/components/SubscriptionsClient";

export default async function SubscriptionsPage() {
  await requirePermission(PERMISSIONS.SUBSCRIPTION_MANAGEMENT);
  return <SubscriptionsClient />;
}
