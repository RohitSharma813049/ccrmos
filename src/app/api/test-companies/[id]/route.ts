import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Company from "@/modules/companies/schemas/Company";
import User from "@/modules/users/schemas/User";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { id } = await params;
    
    const company = await Company.findByIdAndDelete(id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    
    await User.deleteMany({ companyId: id });
    return NextResponse.json({ message: "Tenant deleted successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Test DELETE error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
