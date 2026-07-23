import crypto from "crypto";
import Company from "@/modules/companies/schemas/Company";
import User from "@/modules/users/schemas/User";
import Role from "@/modules/roles/schemas/Role";
import SubscriptionPlan from "@/modules/settings/schemas/SubscriptionPlan";
import IndustryTemplate from "@/modules/settings/schemas/IndustryTemplate";
import CustomModule from "@/modules/settings/schemas/CustomModule";
import DynamicField from "@/modules/settings/schemas/DynamicField";
import ApiKey from "@/modules/settings/schemas/ApiKey";
import nodemailer from "nodemailer";

export class CompanyService {
  static async getCompaniesWithUserCounts(page: number = 1, limit: number = 10, search: string = "") {
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { adminEmail: { $regex: search, $options: "i" } }
      ];
    }
    const skip = (page - 1) * limit;
    const total = await Company.countDocuments(query);

    const companies = await Company.find(query).populate("subscriptionPlanId").sort({ createdAt: -1 }).skip(skip).limit(limit);
    
    const companiesWithCounts = await Promise.all(
      companies.map(async (company) => {
        const usersCount = await User.countDocuments({ companyId: company._id });
        const companyObj = company.toObject();
        return {
          ...companyObj,
          plan: company.subscriptionPlanId ? (company.subscriptionPlanId as any).name : companyObj.plan,
          users: usersCount
        };
      })
    );
    
    return {
      companies: companiesWithCounts,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  static async registerTenant({ name, adminEmail, subscriptionPlanId, usersQuota, industryId, enabledModules }: { name: string, adminEmail: string, subscriptionPlanId?: string, usersQuota?: number, industryId?: string, enabledModules?: string[] }) {
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
    
    const checkoutToken = crypto.randomBytes(32).toString("hex");

    // Create the company as pending/suspended
    const newCompany = await Company.create({
      name,
      adminEmail: normalizedEmail,
      subscriptionPlanId: subscriptionPlanId || undefined,
      usersQuota: usersQuota || 5,
      industryId: industryId || undefined,
      status: "Suspended",
      subscriptionStatus: "pending_payment",
      checkoutToken,
      enabledModules: enabledModules || []
    });

    // Automatically create the founder role and user account for this new tenant
    const founderRole = await Role.create({
      name: "Founder",
      companyId: newCompany._id,
      permissions: {} // Founders typically bypass permission checks, but you can add full permissions if needed
    });

    const founder = await User.create({
      email: normalizedEmail,
      role: founderRole._id,
      companyId: newCompany._id,
      hierarchyLevel: 2,
    });
    founder.founderId = founder._id;
    await founder.save();
    
    // Provision Industry-Specific Dynamic Fields
    if (industryId) {
      // Find all global dynamic fields tied to this industry
      const industryFields = await DynamicField.find({ industryId, tenantScope: "Global" }).lean();
      
      if (industryFields && industryFields.length > 0) {
        const newFields = industryFields.map((field: any) => ({
          ...field,
          _id: undefined, // Let mongoose generate a new ID
          companyId: newCompany._id,
          tenantScope: "Local", // Convert to local so company can edit
          industryId: undefined, // No longer globally tied
          createdAt: undefined,
          updatedAt: undefined
        }));
        await DynamicField.insertMany(newFields);
      }
    }
    
    // Automatically generate a default API Key for the new tenant
    const rawKey = `crm_live_${crypto.randomBytes(24).toString("hex")}`;
    await ApiKey.create({
      name: "Default API Key",
      key: rawKey,
      founderId: founder._id,
      companyId: newCompany._id
    });
    
    // Send email using nodemailer
    if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout?token=${checkoutToken}`;

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Admin Panel" <noreply@example.com>',
          to: normalizedEmail,
          subject: "Complete your CRM Setup",
          text: `Welcome! Please complete your setup and payment by visiting: ${checkoutUrl}`,
          html: `<p>Welcome to CRM OS!</p><p>Please complete your setup and payment by clicking the link below:</p><p><a href="${checkoutUrl}"><strong>Complete Setup</strong></a></p>`,
        });
        console.log(`Checkout email sent to ${normalizedEmail}`);
      } catch (emailError) {
        console.error(`Failed to send checkout email to ${normalizedEmail}:`, emailError);
      }
    } else {
      console.warn("Email configuration is missing. Cannot send checkout email. Mock URL:", `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout?token=${checkoutToken}`);
    }
    
    return newCompany;
  }
}
