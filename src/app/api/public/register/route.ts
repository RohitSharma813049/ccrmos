import { NextResponse } from "next/server";
import { CompanyService } from "@/modules/companies/services/company.service";
import dbConnect from "@/lib/db";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { 
      companyName, 
      adminEmail, 
      adminName, 
      password, 
      subscriptionPlanId, 
      industryId, 
      domain 
    } = body;

    if (!companyName || !adminEmail || !password || !subscriptionPlanId) {
      return NextResponse.json(
        { error: "Missing required fields for registration." },
        { status: 400 }
      );
    }

    // CompanyService.registerTenant takes { name, adminEmail, subscriptionPlanId }
    // It automatically creates a Founder user with the provided email.
    // However, it does not take a password parameter natively, since users typically set it via email link.
    // For this public flow, we'll let registerTenant do its default logic, and we can manually set the password on the User model afterwards.

    const newCompany = await CompanyService.registerTenant({
      name: companyName,
      adminEmail,
      subscriptionPlanId,
      industryId
    });

    const checkoutToken = newCompany.checkoutToken;

    // Set user password natively here since registerTenant doesn't take it
    const User = require("@/modules/users/schemas/User").default;
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { email: adminEmail.trim().toLowerCase() }, 
      { $set: { password: hashedPassword, name: adminName } }
    );

    return NextResponse.json({
      success: true,
      companyId: newCompany._id,
      checkoutToken
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error registering tenant:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register account." },
      { status: 500 }
    );
  }
}
