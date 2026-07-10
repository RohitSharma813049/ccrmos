import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Company from "@/modules/companies/schemas/Company";
import User from "@/modules/users/schemas/User";
import Role from "@/modules/roles/schemas/Role";
import { requirePermission, requireAuthenticatedUser } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    if (user.hierarchyLevel !== 1) throw new Error("Forbidden: Platform Owner access required.");
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const founderRole = await Role.findOne({ name: "founder" });
    if (!founderRole) {
      return NextResponse.json({ error: "Founder role not found" }, { status: 400 });
    }

    const companies = await Company.find();
    const results = [];

    for (const company of companies) {
      if (company.adminEmail) {
        const email = company.adminEmail.toLowerCase();
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            role: founderRole._id,
            companyId: company._id
          });
          results.push(`Created user for ${email}`);
        } else {
          user.role = founderRole._id;
          user.companyId = company._id;
          await user.save();
          results.push(`Updated user ${email}`);
        }
      }
    }
    
    return NextResponse.json({ message: "Sync complete", results }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
