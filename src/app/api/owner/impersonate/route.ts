import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuthenticatedUser } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    
    // Only Platform Owners can impersonate
    if (user.hierarchyLevel !== 1) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { founderId } = await req.json();
    const cookieStore = cookies();

    if (founderId) {
      // Set the impersonation cookie
      cookieStore.set("impersonatedFounderId", founderId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 // 1 day
      });
    } else {
      // Clear the cookie
      cookieStore.delete("impersonatedFounderId");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
