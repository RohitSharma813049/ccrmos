import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import User from "@/modules/users/schemas/User";
import { generateSecret, generateURI } from "otplib";
import qrcode from "qrcode";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate a new secret
    const secret = generateSecret();
    
    // Generate the otpauth URI
    const otpauth = generateURI({ label: user.email, issuer: "CRM OS", secret });
    
    // Generate QR Code URL
    const qrCodeUrl = await qrcode.toDataURL(otpauth);

    // Save secret temporarily or permanently. We'll save it but not enable it until verified.
    user.twoFactorSecret = secret;
    // We don't set twoFactorEnabled to true yet, that happens in the verify route
    await user.save();

    return NextResponse.json({
      secret,
      qrCodeUrl
    }, { status: 200 });

  } catch (error) {
    console.error("Error setting up 2FA:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
