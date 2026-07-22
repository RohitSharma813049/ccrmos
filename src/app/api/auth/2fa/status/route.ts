import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import User from "@/modules/users/schemas/User";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);
    
    return NextResponse.json({
      enabled: user?.twoFactorEnabled || false
    }, { status: 200 });

  } catch (error) {
    console.error("Error getting 2FA status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
