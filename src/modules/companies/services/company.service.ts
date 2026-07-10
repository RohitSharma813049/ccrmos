import mongoose from "mongoose";
import Company from "@/modules/companies/schemas/Company";
import User from "@/modules/users/schemas/User";
import Role from "@/modules/roles/schemas/Role";

export class CompanyService {
  static async getCompaniesWithUserCounts() {
    const companies = await Company.find().sort({ createdAt: -1 });
    
    const companiesWithCounts = await Promise.all(
      companies.map(async (company) => {
        const usersCount = await User.countDocuments({ companyId: company._id });
        return {
          ...company.toObject(),
          users: usersCount
        };
      })
    );
    
    return companiesWithCounts;
  }

  static async registerTenant({ name, adminEmail, plan, usersQuota }: { name: string, adminEmail: string, plan?: "Basic" | "Pro" | "Enterprise", usersQuota?: number }) {
    if (!name || !adminEmail) {
      throw new Error("Name and Admin Email are required.");
    }
    
    // Create the company
    const newCompany = await Company.create({
      name,
      adminEmail,
      plan: plan || "Basic",
      usersQuota: usersQuota || 5,
      status: "Active"
    });

    // Automatically create the founder user account
    const founderRole: any = await Role.findOne({ name: "founder" });
    
    if (founderRole) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });
      if (!existingUser) {
        await User.create({
          email: adminEmail,
          role: founderRole._id,
          companyId: newCompany._id
        });
      } else {
        // If user exists, update their role and companyId
        existingUser.role = founderRole._id;
        existingUser.companyId = newCompany._id;
        await existingUser.save();
      }
    }
    
    return newCompany;
  }
}
