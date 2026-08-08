import dbConnect from "@/lib/db";
import CompanyModule from "@/modules/companies/schemas/CompanyModule";
import DynamicField from "@/modules/settings/schemas/DynamicField";
import DynamicModuleClient from "@/modules/dynamic/components/DynamicModuleClient";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth-utils";
import Link from "next/link";

export default async function CatchAllModulePage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const session = await getSession();
  if (!session?.user) notFound();

  const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
  if (!userCompanyId) notFound();

  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  // Try to find a CompanyModule that matches this route
  // The route could be the module_id itself or some normalized version
  const companyModules = await CompanyModule.find({ company_id: userCompanyId, visible: true }).lean();
  
  let matchingModule = null;
  for (const mod of companyModules) {
    const modIdLower = (mod.module_id || "").toLowerCase().trim();
    if (modIdLower === decodedSlug || modIdLower.replace(/[^a-z0-9]/g, '-') === decodedSlug) {
      matchingModule = mod;
      break;
    }
  }

  if (!matchingModule) {
    notFound();
  }

  // Fetch fields for this module
  // The 'target' in DynamicField is typically the exact module_id string
  const dynamicFields = await DynamicField.find({
    target: matchingModule.module_id,
    $or: [
      { tenantScope: "Global" },
      { tenantScope: "Industry" }, // Might need proper industry filtering but this is a dashboard view, fields should be filtered on edit. We'll fetch all matching target for now
      { companyId: userCompanyId }
    ]
  }).sort({ section: 1, order: 1 }).lean();

  if (!dynamicFields || dynamicFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6 space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Module Under Construction</h2>
        <p className="text-muted-foreground max-w-md">
          The <strong>{matchingModule.display_name}</strong> module has been enabled, but no fields have been configured for it yet.
        </p>
        <Link 
          href="/dashboard/settings/module-fields"
          className="mt-6 px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go to Form Designer
        </Link>
      </div>
    );
  }

  // Create a synthetic module schema that DynamicModuleClient can consume
  const moduleSchema = {
    _id: matchingModule._id.toString(),
    name: matchingModule.display_name,
    description: `Manage records for ${matchingModule.display_name}`,
    fields: dynamicFields
  };

  const serializedModule = JSON.parse(JSON.stringify(moduleSchema));

  return <DynamicModuleClient moduleSchema={serializedModule} />;
}
