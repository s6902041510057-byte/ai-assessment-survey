import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const password = String(body?.password ?? "");
  const adminPw = process.env.ADMIN_PASSWORD || "1234";
  const teacherPw = process.env.TEACHER_PASSWORD || "teacher";

  let role: "admin" | "teacher" | null = null;
  if (password === adminPw) role = "admin";
  else if (password === teacherPw) role = "teacher";

  if (!role) {
    return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_auth", "1", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  cookieStore.set("admin_role", role, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ ok: true, role });
}
