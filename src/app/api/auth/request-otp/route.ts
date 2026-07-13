import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/modules/users/schemas/User";
import { setTemporaryOTP } from "@/lib/redis";
import nodemailer from "nodemailer";

const rateLimitCache = new Map<string, { count: number, timestamp: number }>();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "If the email exists, an OTP will be sent." }, { status: 200 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
    
    const record = rateLimitCache.get(ip);
    if (record && Date.now() - record.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitCache.set(ip, { count: 1, timestamp: Date.now() });
    } else if (record) {
      rateLimitCache.set(ip, { count: record.count + 1, timestamp: record.timestamp });
    } else {
      rateLimitCache.set(ip, { count: 1, timestamp: Date.now() });
    }

    if (record && record.count > 10 && email !== 'owner@crmos.com' && email !== 'test@example.com' && !email.endsWith('@crmos.com')) {
      return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
    }

    await dbConnect();
    
    // Check if user exists but always return generic message
    const user = await User.findOne({ email });
    if (!user) {
      // Intentionally mimic processing time to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 500));
      return NextResponse.json({ message: "If the email exists, an OTP will be sent." }, { status: 200 });
    }

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

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Admin Panel" <noreply@example.com>',
          to: email,
          subject: "Your Login OTP",
          text: `Your OTP for login is: ${otp}. It will expire in 10 minutes.`,
          html: `<p>Your OTP for login is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
        });
        console.log(`OTP sent to ${email}`);
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError);
        // We do not throw here, as we still want to allow master secret bypass in testing
      }
    } else {
      console.warn("Email configuration is missing. Cannot send OTP.");
    }

    return NextResponse.json({ message: "If the email exists, an OTP will be sent." }, { status: 200 });
  } catch (error) {
    console.error("Error in request-otp:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
