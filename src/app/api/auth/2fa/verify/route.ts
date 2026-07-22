import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import User from "@/modules/users/schemas/User";
import { verifySync } from "otplib";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, disable } = await req.json();

    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (disable) {
      // Disabling 2FA
      if (!user.twoFactorEnabled) {
        return NextResponse.json({ error: "2FA is not enabled" }, { status: 400 });
      }
      
      // Verify code before disabling
      const isValid = verifySync({
        token: code,
        secret: user.twoFactorSecret || ""
      });

      if (!isValid) {
        return NextResponse.json({ error: "Invalid authenticator code" }, { status: 400 });
      }

      user.twoFactorEnabled = false;
      user.twoFactorSecret = "";
      await user.save();
      return NextResponse.json({ success: true, message: "2FA disabled successfully" });
    } else {
      // Enabling 2FA
      if (!user.twoFactorSecret) {
        return NextResponse.json({ error: "No 2FA secret found. Setup 2FA first." }, { status: 400 });
      }

      const isValid = verifySync({
        token: code,
        secret: user.twoFactorSecret
      });

      if (!isValid) {
        return NextResponse.json({ error: "Invalid authenticator code" }, { status: 400 });
      }

      user.twoFactorEnabled = true;
      await user.save();
      return NextResponse.json({ success: true, message: "2FA enabled successfully" });
    }
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
