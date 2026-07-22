import TwoFactorClient from "./TwoFactorClient";

export default function SecuritySettingsPage() {
  return (
    <div className="p-8 pb-20">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Security Settings</h1>
      <p className="text-gray-600 mt-1">Manage your account security and authentication methods.</p>
      
      <TwoFactorClient />
    </div>
  );
}
