import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth-utils";
import User from "@/modules/users/schemas/User";

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    
    // Only Platform Owners can impersonate
    if (user.hierarchyLevel !== 1) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { founderId } = await req.json();
    const response = NextResponse.json({ success: true });

    if (founderId) {
      const founder = await User.findById(founderId);
      if (founder && founder.companyId) {
        response.cookies.set("impersonatedCompanyId", founder.companyId.toString(), {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24,
        });
      }

      response.cookies.set("impersonatedFounderId", founderId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      });
    } else {
      response.cookies.delete("impersonatedFounderId");
      response.cookies.delete("impersonatedCompanyId");
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
