import IntegrationsClient from "@/modules/settings/components/IntegrationsClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;
  
  // Only Platform Owners (1) and Founders (2) can manage API Integrations
  if (user.hierarchyLevel > 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-lg text-center border border-red-100 shadow-sm">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-red-700/80">You do not have permission to manage API Integrations. Only Founders can access this area.</p>
        </div>
      </div>
    );
  }

  return <IntegrationsClient />;
}
