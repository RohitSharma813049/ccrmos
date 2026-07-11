import NextAuth, { NextAuthOptions } from "next-auth";
import { cookies } from "next/headers";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/modules/users/schemas/User";
import "@/modules/roles/schemas/Role"; // Side-effect import to prevent tree-shaking
import VerificationToken from "@/modules/auth/schemas/VerificationToken";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          throw new Error("Email and OTP are required");
        }

        await dbConnect();

        const { email, otp } = credentials;

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

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role ? (user.role as any).name : null,
          permissions: user.role ? (user.role as any).permissions : {},
          companyId: user.companyId ? user.companyId.toString() : null,
          founderId: user.founderId ? user.founderId.toString() : null,
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

          if (token.hierarchyLevel === 1) {
            const cookieStore = await cookies();
            const impersonated = cookieStore.get("impersonatedFounderId")?.value;
            if (impersonated) {
              (session.user as any).impersonatedFounderId = impersonated;
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
