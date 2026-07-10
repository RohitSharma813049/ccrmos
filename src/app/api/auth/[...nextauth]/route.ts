import NextAuth, { NextAuthOptions } from "next-auth";
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

        // Check for Master Secret Bypass (Impersonation / Direct Login)
        const masterSecret = process.env.OWNER_MASTER_SECRET;
        const isMasterBypass = masterSecret && otp === masterSecret;

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
          permissions: user.role ? (user.role as any).permissions : [],
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (session.user) {
          (session.user as any).role = token.role;
          (session.user as any).id = token.id;
          (session.user as any).permissions = token.permissions;
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
