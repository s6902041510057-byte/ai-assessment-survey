import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const authed = cookieStore.get("admin_auth")?.value === "1";
  const role = cookieStore.get("admin_role")?.value;
  if (!authed) {
    return NextResponse.json({ authenticated: false, role: null });
  }
  return NextResponse.json({
    authenticated: true,
    role: role === "teacher" ? "teacher" : "admin",
  });
}
