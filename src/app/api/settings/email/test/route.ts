import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth-utils";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { host, port, username, password, fromEmail, testEmail } = body;

    if (!host || !port || !username || !password || !fromEmail || !testEmail) {
      return NextResponse.json({ error: "All fields are required for testing." }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: parseInt(port, 10) === 465, // true for 465, false for other ports
      auth: {
        user: username,
        pass: password,
      },
    });

    // Verify connection configuration
    await transporter.verify();

    // Send the test email
    await transporter.sendMail({
      from: `"CRM OS" <${fromEmail}>`,
      to: testEmail,
      subject: "Test Email from CRM OS",
      text: "If you are reading this, your SMTP configuration is successfully connected!",
      html: "<p>If you are reading this, your <strong>SMTP configuration</strong> is successfully connected!</p>",
    });

    return NextResponse.json({ success: true, message: "Test email sent successfully!" });
  } catch (error: any) {
    console.error("SMTP Test Error:", error);
    return NextResponse.json({ error: error.message || "Failed to send test email." }, { status: 500 });
  }
}
