import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth-utils";

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
      response.cookies.set("impersonatedFounderId", founderId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      });
    } else {
      response.cookies.delete("impersonatedFounderId");
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
