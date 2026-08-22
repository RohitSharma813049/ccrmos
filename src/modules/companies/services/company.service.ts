import crypto from "crypto";
import Company from "@/modules/companies/schemas/Company";
import User from "@/modules/users/schemas/User";
import GlobalRole from "@/modules/owner/schemas/GlobalRole";
import Role from "@/modules/users/schemas/Role";
import LeadStatus from "@/modules/leads/schemas/LeadStatus";
import SubscriptionPlan from "@/modules/settings/schemas/SubscriptionPlan";
import IndustryTemplate from "@/modules/settings/schemas/IndustryTemplate";
import CustomModule from "@/modules/settings/schemas/CustomModule";
import DynamicField from "@/modules/settings/schemas/DynamicField";
import ApiKey from "@/modules/settings/schemas/ApiKey";
import nodemailer from "nodemailer";

import TemplateModule from "@/modules/settings/schemas/TemplateModule";
import CompanyModule from "@/modules/companies/schemas/CompanyModule";

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
        const companyModules = await CompanyModule.find({ company_id: company._id }).select('module_id').lean();
        const enabledModules = companyModules.map((m: any) => m.module_id);
        
        const companyObj = company.toObject();
        return {
          ...companyObj,
          plan: company.subscriptionPlanId ? (company.subscriptionPlanId as any).name : companyObj.plan,
          users: usersCount,
          enabledModules
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

  static async registerTenant({ name, adminEmail, subscriptionPlanId, usersQuota, templateId, industryId, enabledModules }: { name: string, adminEmail: string, subscriptionPlanId?: string, usersQuota?: number, templateId?: string, industryId?: string, enabledModules?: string[] }) {
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
      selected_template_id: templateId || undefined,
      status: "Suspended",
      subscriptionStatus: "pending_payment",
      checkoutToken
    });

    // Find or create the Global Founder role
    let founderRole = await GlobalRole.findOne({ name: "Founder" });
    if (!founderRole) {
      founderRole = await GlobalRole.create({
        name: "Founder",
        description: "System default Founder role",
        permissions: { all: true },
        isActive: true
      });
    }

    const founder = await User.create({
      email: normalizedEmail,
      role: founderRole._id,
      companyId: newCompany._id,
      hierarchyLevel: 2,
    });
    founder.founderId = founder._id;
    await founder.save();
    
    // Provision Default Lead Statuses
    const defaultStatuses = [
      { name: 'New', category: 'Fresh Lead', color: '#3b82f6' },
      { name: 'Contacted', category: 'Interested', color: '#f59e0b' },
      { name: 'In Progress', category: 'Neutral', color: '#8b5cf6' },
      { name: 'Qualified', category: 'Interested', color: '#10b981' },
      { name: 'Closed Won', category: 'Deal Closed', color: '#059669' },
      { name: 'Closed Lost', category: 'Deal Cancelled', color: '#ef4444' }
    ];
    
    const statusesToInsert = defaultStatuses.map((st, i) => ({
      ...st,
      sortOrder: i,
      tenantId: newCompany._id,
      active: true,
      createdBy: founder._id,
      updatedBy: founder._id
    }));
    await LeadStatus.insertMany(statusesToInsert);
    
    // --- DYNAMIC TENANT PROVISIONING ---
    // 1. Provision Global Roles
    const roleQuery: any = {
      isActive: true,
      $or: [
        { tenantScope: "Global" },
        { tenantScope: "Industry", industryId }
      ]
    };
    if (subscriptionPlanId) {
      roleQuery.$or.forEach((cond: any) => {
        cond.$and = [
          { $or: [{ planId: subscriptionPlanId }, { planId: null }, { planId: { $exists: false } }] }
        ];
      });
    }
    
    const globalRoles = await GlobalRole.find(roleQuery).lean();
    if (globalRoles.length > 0) {
      const clonedRoles = globalRoles.map((gr: any) => ({
        companyId: newCompany._id,
        name: gr.name,
        description: gr.description,
        permissions: gr.permissions,
      }));
      // Filter out duplicate "Founder" role if it came from templates
      const uniqueClonedRoles = clonedRoles.filter(r => r.name !== "Founder");
      if (uniqueClonedRoles.length > 0) {
        await Role.insertMany(uniqueClonedRoles).catch(e => console.error("Error provisioning roles:", e));
      }
    }

    // 2. Provision Custom Modules
    const customModuleQuery: any = {
      active: true,
      $or: [
        { tenantScope: "Global" },
        { tenantScope: "Industry", industryId }
      ]
    };
    const customModules = await CustomModule.find(customModuleQuery).lean();
    if (customModules.length > 0) {
      const companyCustomModulesData = customModules.map((mod: any, index: number) => ({
        company_id: newCompany._id,
        module_id: mod._id.toString(), // using CustomModule ID as module_id for dynamic modules
        visible: true,
        display_name: mod.name,
        sort_order: 100 + index, // sort after standard modules
        is_customized: false,
      }));
      await CompanyModule.insertMany(companyCustomModulesData).catch(e => console.error("Error provisioning custom modules:", e));
    }
    // -----------------------------------
    // Provision Modules & Fields from Template
    if (templateId) {
      // 1. Provision Company Modules
      const templateModules = await TemplateModule.find({ template_id: templateId }).lean();
      if (templateModules && templateModules.length > 0) {
        const companyModulesData = templateModules.map((tm: any) => ({
          company_id: newCompany._id,
          module_id: tm.module_id,
          visible: true,
          display_name: tm.default_display_name,
          sort_order: tm.sort_order,
          is_customized: false,
        }));
        await CompanyModule.insertMany(companyModulesData);
      }
      
      // 2. Provision Dynamic Fields from the template's legacy definition or if they were global
      // Note: We need to pull from the IndustryTemplate if it has inline fields, OR adapt if fields were defined globally
      const template = await IndustryTemplate.findById(templateId).lean();
      if (template && template.fields && template.fields.length > 0) {
        const newFields = template.fields.map((field: any) => ({
          ...field,
          _id: undefined, // Let mongoose generate a new ID
          companyId: newCompany._id,
          tenantScope: "Local",
          industryId: undefined, 
          createdAt: undefined,
          updatedAt: undefined
        }));
        await DynamicField.insertMany(newFields);
      }
    } else if (enabledModules && enabledModules.length > 0) {
      // Provision the modules selected by the admin during creation
      const companyModulesData = enabledModules.map((mod: string, index: number) => ({
        company_id: newCompany._id,
        module_id: mod,
        visible: true,
        display_name: mod.charAt(0).toUpperCase() + mod.slice(1),
        sort_order: index,
        is_customized: false,
      }));
      await CompanyModule.insertMany(companyModulesData);
    } else if (industryId) {
      // Provision Default Modules from Industry if no Template is selected
      const Industry = require("@/modules/settings/schemas/Industry").default;
      const industry = await Industry.findById(industryId).lean();
      if (industry && industry.defaultModules && industry.defaultModules.length > 0) {
        const companyModulesData = industry.defaultModules.map((mod: string, index: number) => ({
          company_id: newCompany._id,
          module_id: mod,
          visible: true,
          display_name: mod.charAt(0).toUpperCase() + mod.slice(1),
          sort_order: index,
          is_customized: false,
        }));
        await CompanyModule.insertMany(companyModulesData);
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

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const checkoutUrl = `${appUrl}/checkout?token=${checkoutToken}`;

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
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
      console.warn("Email configuration is missing. Cannot send checkout email. Mock URL:", `${appUrl}/checkout?token=${checkoutToken}`);
    }
    
    return newCompany;
  }
}
