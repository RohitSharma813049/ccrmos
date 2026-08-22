import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/modules/users/schemas/User";
import "@/modules/owner/schemas/GlobalRole"; // Side-effect import to prevent tree-shaking
import "@/modules/users/schemas/Role"; // Side-effect import to prevent tree-shaking

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
        totpCode: { label: "TOTP Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          throw new Error("Email and OTP are required");
        }

        await dbConnect();

        const { email, otp, totpCode } = credentials;

        // Master secret bypass
        const isMasterBypass = process.env.OWNER_MASTER_SECRET && otp === process.env.OWNER_MASTER_SECRET;

        if (!isMasterBypass) {
          // Standard OTP Verification using Redis
          const { getTemporaryOTP, redis } = await import("@/lib/redis");
          const storedOtp = await getTemporaryOTP(email);

          if (!storedOtp) {
            throw new Error("OTP has expired or does not exist");
          }

          if (String(storedOtp) !== String(otp)) {
            throw new Error("Invalid OTP");
          }

          // OTP is valid. Delete it to prevent reuse.
          await redis.del(`otp:${email}`);
        }

        // Find user
        let user = await User.findOne({ email }).populate("role");

        if (!user) {
          throw new Error("User does not exist. Please contact your administrator.");
        }

        if (user.twoFactorEnabled) {
          if (!totpCode) {
            throw new Error("2FA_REQUIRED");
          }

          const { verify } = await import("otplib");
          const isValid = verify({
            token: totpCode,
            secret: user.twoFactorSecret || ""
          });

          if (!isValid) {
            throw new Error("Invalid authenticator code");
          }
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.hierarchyLevel === 1 ? "Platform Owner" : (user.role ? (user.role as any).name : null),
          permissions: user.role ? (user.role as any).permissions : {},
          companyId: user.companyId ? user.companyId.toString() : null,
          founderId: user.founderId ? user.founderId.toString() : null,
          teamId: user.teamId ? user.teamId.toString() : null,
          hierarchyLevel: user.hierarchyLevel,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.permissions = (user as any).permissions;
        token.companyId = (user as any).companyId;
        token.founderId = (user as any).founderId;
        token.hierarchyLevel = (user as any).hierarchyLevel;
        token.teamId = (user as any).teamId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (session.user) {
          (session.user as any).role = token.role;
          (session.user as any).id = token.id;
          (session.user as any).permissions = token.permissions;
          (session.user as any).companyId = token.companyId;
          (session.user as any).founderId = token.founderId;
          (session.user as any).hierarchyLevel = token.hierarchyLevel;
          (session.user as any).teamId = token.teamId;

          if (token.hierarchyLevel === 1) {
            // We pass the parsed cookies from the request wrapper
            const impersonatedFounderId = (token as any)._impersonatedFounderId;
            const impersonatedCompanyId = (token as any)._impersonatedCompanyId;
            
            if (impersonatedFounderId) {
              (session.user as any).impersonatedFounderId = impersonatedFounderId;
              if (impersonatedCompanyId) {
                (session.user as any).impersonatedCompanyId = impersonatedCompanyId;
                (session.user as any).companyId = impersonatedCompanyId;
              }
            }
          }
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
