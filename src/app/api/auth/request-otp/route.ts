import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/modules/users/schemas/User";
import { setTemporaryOTP } from "@/lib/redis";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await dbConnect();

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save the new token in Redis (valid for 10 minutes = 600 seconds)
    await setTemporaryOTP(email, otp, 600);

    // Send the OTP via email
    if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Admin Panel" <noreply@example.com>',
        to: email,
        subject: "Your Login OTP",
        text: `Your OTP for login is: ${otp}. It will expire in 10 minutes.`,
        html: `<p>Your OTP for login is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
      });
      console.log(`OTP sent to ${email}`);
    } else {
      console.warn("Email configuration is missing. OTP generated: ", otp);
    }

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in request-otp:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
