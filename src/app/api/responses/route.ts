import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";

async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return c.get("admin_auth")?.value === "1";
}

const MAX_BODY_SIZE = 1_000_000; // 1 MB

export async function POST(req: NextRequest) {
  // จำกัดขนาด request body เพื่อป้องกัน DoS
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "ข้อมูลขนาดใหญ่เกินไป" }, { status: 413 });
  }

  const sb = supabaseAdmin();
  if (!sb) {
    return NextResponse.json(
      { error: "Supabase ยังไม่ได้ตั้งค่า — ดู README.md หัวข้อ 'ตั้งค่า Supabase'" },
      { status: 503 },
    );
  }

  let body: {
    grade_level?: unknown;
    used_ai?: unknown;
    ai_tools?: unknown;
    answers?: unknown;
  };
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "ข้อมูลขนาดใหญ่เกินไป" }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const grade_level = String(body?.grade_level ?? "").trim();
  const used_ai = String(body?.used_ai ?? "").trim();
  const ai_tools = Array.isArray(body?.ai_tools) ? body.ai_tools.map(String) : [];
  const answers = (body?.answers ?? {}) as Record<string, string | string[] | number>;

  if (!grade_level) {
    return NextResponse.json({ error: "กรุณากรอกระดับชั้น" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("responses")
    .insert({
      grade_level,
      used_ai,
      ai_tools,
      answers,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data?.id });
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 });
  }
  const sb = supabaseAdmin();
  if (!sb) {
    return NextResponse.json(
      { error: "Supabase ยังไม่ได้ตั้งค่า" },
      { status: 503 },
    );
  }

  const { data, error } = await sb
    .from("responses")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ responses: data ?? [] });
}
