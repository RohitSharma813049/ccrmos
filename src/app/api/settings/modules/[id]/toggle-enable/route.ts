import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CustomModule from '@/modules/settings/schemas/CustomModule';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function PUT(req: Request, context: any) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    // Only founders (hierarchyLevel 2) or SuperAdmins (hierarchyLevel 1) can toggle modules
    if (user.hierarchyLevel > 2) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { params } = context;
    const { id } = await Promise.resolve(params);

    const userCompanyId = user.companyId || user.impersonatedFounderId;
    if (!userCompanyId && user.hierarchyLevel !== 1) {
      return NextResponse.json({ error: "No company associated with user" }, { status: 400 });
    }

    const mod = await CustomModule.findById(id);
    if (!mod) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // You can only toggle Global or Industry modules. Company scoped modules are inherently enabled for their owner.
    if (mod.tenantScope === "Company") {
      return NextResponse.json({ error: "Cannot toggle opt-in for a company-scoped module" }, { status: 400 });
    }

    const enabledArray = mod.enabledBy || [];
    const companyIdStr = userCompanyId.toString();

    const isEnabled = enabledArray.some((cid: any) => cid.toString() === companyIdStr);

    if (isEnabled) {
      // Disable it
      mod.enabledBy = enabledArray.filter((cid: any) => cid.toString() !== companyIdStr);
    } else {
      // Enable it
      if (!mod.enabledBy) mod.enabledBy = [];
      mod.enabledBy.push(userCompanyId);
    }

    await mod.save();

    return NextResponse.json({ success: true, enabled: !isEnabled });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
