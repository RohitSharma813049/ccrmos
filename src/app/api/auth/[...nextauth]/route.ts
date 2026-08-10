import NextAuth from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";

async function auth(req: NextRequest, context: any) {
  const cookieHeader = req.headers.get("cookie") || "";
  const impersonatedFounderId = cookieHeader.match(/impersonatedFounderId=([^;]+)/)?.[1];
  const impersonatedCompanyId = cookieHeader.match(/impersonatedCompanyId=([^;]+)/)?.[1];

  return await NextAuth(req, context, {
    ...authOptions,
    callbacks: {
      ...authOptions.callbacks,
      async jwt({ token, user, account, profile, isNewUser }) {
        let finalToken = token;
        if (authOptions.callbacks?.jwt) {
          finalToken = await authOptions.callbacks.jwt({ token, user, account, profile, isNewUser }) as any;
        }
        if (impersonatedFounderId) {
          (finalToken as any)._impersonatedFounderId = impersonatedFounderId;
        }
        if (impersonatedCompanyId) {
          (finalToken as any)._impersonatedCompanyId = impersonatedCompanyId;
        }
        return finalToken;
      }
    }
  });
}

export { auth as GET, auth as POST };
