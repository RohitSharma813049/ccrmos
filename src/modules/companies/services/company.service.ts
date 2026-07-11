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

    const normalizedEmail = adminEmail.trim().toLowerCase();
    const existingCompany = await Company.findOne({ adminEmail: normalizedEmail });
    if (existingCompany) {
      throw new Error("A company already exists for this admin email.");
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new Error("This admin email is already assigned to another user.");
    }
    
    // Create the company
    const newCompany = await Company.create({
      name,
      adminEmail: normalizedEmail,
      plan: plan || "Basic",
      usersQuota: usersQuota || 5,
      status: "Active"
    });

    // Automatically create the founder user account
    const founderRole: any = await Role.findOne({ name: "founder" });
    
    if (!founderRole) {
      throw new Error("Founder role not found.");
    }

    const founder = await User.create({
      email: normalizedEmail,
      role: founderRole._id,
      companyId: newCompany._id,
      hierarchyLevel: 2,
    });
    founder.founderId = founder._id;
    await founder.save();
    
    return newCompany;
  }
}
