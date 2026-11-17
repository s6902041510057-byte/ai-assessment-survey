import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Simple in-memory rate limiter (per instance)
const attempts = new Map<string, number[]>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_ATTEMPTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const list = attempts.get(ip) ?? [];
  const recent = list.filter((t) => now - t < WINDOW_MS);
  attempts.set(ip, recent);
  if (recent.length >= MAX_ATTEMPTS) return true;
  recent.push(now);
  attempts.set(ip, recent);
  return false;
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "พยายามเข้าสู่ระบบมากเกินไป กรุณารอ 1 นาที" },
      { status: 429 },
    );
  }

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
