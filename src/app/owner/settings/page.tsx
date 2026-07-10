import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import SettingsClient from "@/modules/settings/components/SettingsClient";

export default async function SettingsPage() {
  await requirePermission(PERMISSIONS.GLOBAL_SETTINGS);
  return <SettingsClient />;
}
