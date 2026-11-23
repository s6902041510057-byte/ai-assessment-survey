"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { survey, questions, dimensions, questionsByDimension } from "@/data/survey";
import {
  responsesToXLSX,
  downloadXLSX,
  timestampName,
} from "@/lib/export";
import { Logo } from "@/components/Logo";

type ResponseRow = {
  id: string;
  submitted_at: string;
  grade_level: string;
  room: string;
  used_ai: string;
  ai_tools: string[];
  answers: Record<string, string | string[] | number>;
};

const QUESTION_TITLES: Record<string, string> = Object.fromEntries(
  questions.map((q) => [q.id, q.title]),
);

// อาจารย์ไม่เห็นข้อมูล "ความรู้สึก" (q39)
const TEACHER_QUESTION_TITLES: Record<string, string> = Object.fromEntries(
  questions.filter((q) => q.id !== "q39").map((q) => [q.id, q.title]),
);

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [role, setRole] = useState<"admin" | "teacher">("admin");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeDimension, setActiveDimension] = useState<string | null>(null);
  const [showOpenEnded, setShowOpenEnded] = useState(false);
  const [showFeelings, setShowFeelings] = useState(false);
  const [globalRoomFilter, setGlobalRoomFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRole = async () => {
    try {
      const res = await fetch("/api/admin/me", { cache: "no-store" });
      const data = await res.json();
      if (data?.authenticated) {
        setRole(data.role === "teacher" ? "teacher" : "admin");
        setAuthed(true);
      } else {
        setAuthed(false);
      }
    } catch {
      // ignore
    }
  };

  const fetchResponses = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/responses", { cache: "no-store" });
      if (res.status === 401) {
        setAuthed(false);
        setResponses([]);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "โหลดข้อมูลไม่สำเร็จ");
      }
      const data = await res.json();
      setResponses(data.responses ?? []);
      setAuthed(true);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRole();
    fetchResponses();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "เข้าสู่ระบบไม่สำเร็จ");
      }
      const data = await res.json().catch(() => ({}));
      if (data?.role) setRole(data.role === "teacher" ? "teacher" : "admin");
      setPassword("");
      await fetchResponses();
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setResponses([]);
  };

  const exportTitles = role === "teacher" ? TEACHER_QUESTION_TITLES : QUESTION_TITLES;

  const handleExportXLSX = () => {
    const wb = responsesToXLSX(responses, exportTitles);
    downloadXLSX(wb, timestampName("responses", "xlsx"));
  };

  // รายชื่อห้องที่มีในข้อมูล (เรียงตามลำดับ)
  const roomsInData = Array.from(
    new Set(responses.map((r) => r.grade_level || "(ไม่ระบุ)")),
  ).sort();

  // กรองข้อมูลตามห้องที่เลือก (global filter)
  const filteredResponses =
    globalRoomFilter === "all"
      ? responses
      : responses.filter((r) => (r.grade_level || "(ไม่ระบุ)") === globalRoomFilter);

  const totalPages = Math.max(1, Math.ceil(filteredResponses.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedResponses = filteredResponses.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const deleteOne = async (id: string) => {
    if (!confirm("ต้องการลบรายการนี้หรือไม่?")) return;
    setDeleting(true);
    try {
      let res: Response | null = null;
      let lastErr: unknown = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          res = await fetch(`/api/responses/${id}`, { method: "DELETE" });
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          await new Promise((r) => setTimeout(r, 500));
        }
      }
      if (lastErr) throw lastErr;
      if (!res || !res.ok) {
        const data = await res?.json().catch(() => ({}));
        throw new Error((data as { error?: string } | undefined)?.error || "ลบไม่สำเร็จ");
      }
      setResponses((prev) => prev.filter((r) => r.id !== id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (e) {
      const msg =
        e instanceof TypeError
          ? "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ (อาจกำลังรีโหลด) — ลองใหม่อีกครั้ง"
          : e instanceof Error
            ? e.message
            : "เกิดข้อผิดพลาด";
      alert(msg);
    } finally {
      setDeleting(false);
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`ต้องการลบ ${selected.size} รายการที่เลือกหรือไม่?`)) return;
    setDeleting(true);
    try {
      await Promise.all(
        [...selected].map(async (id) => {
          let res: Response | null = null;
          let lastErr: unknown = null;
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              res = await fetch(`/api/responses/${id}`, { method: "DELETE" });
              lastErr = null;
              break;
            } catch (e) {
              lastErr = e;
              await new Promise((r) => setTimeout(r, 500));
            }
          }
          if (lastErr) throw lastErr;
          if (!res || !res.ok) throw new Error("ลบไม่สำเร็จ");
        }),
      );
      setResponses((prev) => prev.filter((r) => !selected.has(r.id)));
      setSelected(new Set());
    } catch (e) {
      const msg =
        e instanceof TypeError
          ? "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ (อาจกำลังรีโหลด) — ลองใหม่อีกครั้ง"
          : e instanceof Error
            ? e.message
            : "เกิดข้อผิดพลาด";
      alert(msg);
      await fetchResponses();
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === responses.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(responses.map((r) => r.id)));
    }
  };

  if (authed === null || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted">กำลังโหลด...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen flex-col bg-slate-100">
        <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
          <div className="mx-auto max-w-md px-4 py-6">
            <div className="flex items-center gap-3">
              <Logo size={44} className="border-2 border-amber-300" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-200">
                  ระบบแบบประเมิน
                </p>
                <p className="text-xs text-blue-200">ฉบับประเมินพฤติกรรมการใช้ AI</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-900 text-3xl text-white shadow-md">
                🔐
              </div>
              <h1 className="text-2xl font-bold text-slate-800">เข้าสู่ระบบ Admin</h1>
              <p className="mt-1 text-sm text-slate-500">
                สำหรับเจ้าของแบบประเมินเท่านั้น
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  รหัสผ่าน
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-blue-800 focus:ring-4 focus:ring-blue-800/15"
                  placeholder="กรอกรหัสผ่าน"
                  autoFocus
                />
              </div>
              {loginError && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600" role="alert">
                  {loginError}
                </p>
              )}
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full rounded-lg bg-blue-900 px-6 py-3.5 text-lg font-bold text-white shadow-md transition hover:bg-blue-800 disabled:opacity-60"
              >
                {loggingIn ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              🔒 การเข้าสู่ระบบนี้ใช้เฉพาะผู้ดูแลระบบเท่านั้น
            </p>
          </div>
        </div>

        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          แบบประเมินพฤติกรรมการใช้ปัญญาประดิษฐ์ (AI) · สำหรับนักเรียน
        </footer>
      </main>
    );
  }

  // ---- Charts data ----
  const gradeCounts = filteredResponses.reduce<Record<string, number>>((acc, r) => {
    const key = r.grade_level || "(ไม่ระบุ)";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const gradeChartData = Object.entries(gradeCounts).map(([grade, count]) => ({
    grade,
    count,
  }));

  // Average score per dimension
  const dimensionAverages = dimensions().map((dim) => {
    const qs = questionsByDimension(dim);
    const ids = qs.map((q) => q.id);
    const values = filteredResponses
      .map((r) => {
        const nums = ids
          .map((id) => Number(r.answers?.[id]))
          .filter((n) => !Number.isNaN(n));
        if (nums.length === 0) return null;
        return nums.reduce((a, b) => a + b, 0) / nums.length;
      })
      .filter((v): v is number => v !== null);
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { dimension: dim.replace(/ด้านที่ \d+ /, ""), avg: Number(avg.toFixed(2)), count: values.length };
  });

  // AI tools usage counts
  // - แสดงเฉพาะตัวที่มีคนเลือก (count > 0)
  // - "อื่น ๆ": แสดงข้อความที่พิมพ์ จัดกลุ่มแบบไม่สนใจตัวพิมพ์เล็ก/ใหญ่
  const predefinedLabels: Record<string, string> = {
    chatgpt: "ChatGPT",
    gemini: "Gemini",
    copilot: "Microsoft Copilot",
    "google-ai": "Google AI",
  };
  const toolCounts: Record<string, number> = {};
  const toolDisplay: Record<string, string> = {};
  for (const r of filteredResponses) {
    for (const t of r.ai_tools ?? []) {
      if (t === "other") {
        const custom = String(r.answers?.q4_ai_tools_other ?? "").trim();
        const key = custom ? `other:${custom.toLowerCase()}` : "other:__empty__";
        const label = custom || "อื่น ๆ";
        toolCounts[key] = (toolCounts[key] ?? 0) + 1;
        if (!toolDisplay[key]) toolDisplay[key] = label;
      } else {
        const key = t;
        toolCounts[key] = (toolCounts[key] ?? 0) + 1;
        if (!toolDisplay[key]) toolDisplay[key] = predefinedLabels[t] ?? t;
      }
    }
  }
  const toolChartData = Object.keys(toolCounts)
    .filter((k) => toolCounts[k] > 0)
    .map((k) => ({
      tool: toolDisplay[k],
      count: toolCounts[k],
    }))
    .sort((a, b) => b.count - a.count);

  // Average per grade level (overall behavior score)
  const gradeAverages = Object.keys(gradeCounts).map((grade) => {
    const rs = filteredResponses.filter((r) => (r.grade_level || "(ไม่ระบุ)") === grade);
    const scaleIds = questions.filter((q) => q.type === "scale").map((q) => q.id);
    const vals = rs
      .map((r) => {
        const nums = scaleIds
          .map((id) => Number(r.answers?.[id]))
          .filter((n) => !Number.isNaN(n));
        if (nums.length === 0) return null;
        return nums.reduce((a, b) => a + b, 0) / nums.length;
      })
      .filter((v): v is number => v !== null);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { grade, avg: Number(avg.toFixed(2)), count: rs.length };
  });

  // ---- Detail view for open-ended questions ----
  if (showOpenEnded) {
    const openQs = questions.filter((q) => q.section === "open");
    return (
      <div className="mx-auto min-h-screen max-w-6xl bg-slate-100 px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowOpenEnded(false)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-600 hover:bg-blue-50"
          >
            ← กลับ
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">คำถามปลายเปิด</h1>
            <p className="text-sm text-blue-100">
              ความคิดเห็นของนักเรียน · {responses.length} ผู้ตอบ
            </p>
          </div>
        </div>


        {responses.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="space-y-6">
            {openQs.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h3 className="mb-3 text-sm font-bold text-slate-700">
                  {q.title}
                </h3>
                <div className="space-y-3">
                  {filteredResponses.map((r, i) => {
                    const ans = String(r.answers?.[q.id] ?? "").trim();
                    if (!ans) return null;
                    return (
                      <div
                        key={r.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                      >
                        <p className="mb-1 text-xs font-medium text-slate-500">
                          ผู้ตอบที่ {i + 1} · {r.grade_level}
                        </p>
                        <p className="whitespace-pre-wrap">{ans}</p>
                      </div>
                    );
                  })}
                  {filteredResponses.every((r) => !String(r.answers?.[q.id] ?? "").trim()) && (
                    <p className="text-sm text-slate-500">ยังไม่มีคำตอบ</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- Detail view for feelings ----
  if (showFeelings) {
    return (
      <div className="mx-auto min-h-screen max-w-6xl bg-slate-100 px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFeelings(false)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-600 hover:bg-blue-50"
          >
            ← กลับ
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              ความรู้สึกที่อยากจะบอกกับนักศึกษาสังเกตการสอน
            </h1>
            <p className="text-sm text-slate-600">
              ความคิดเห็นของนักเรียน · {responses.length} ผู้ตอบ
            </p>
          </div>
        </div>


        {responses.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="space-y-3">
            {filteredResponses.map((r, i) => {
              const ans = String(r.answers?.q39 ?? "").trim();
              if (!ans) return null;
              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <p className="mb-1 text-xs font-medium text-slate-500">
                    ผู้ตอบที่ {i + 1} · {r.grade_level}
                  </p>
                  <p className="whitespace-pre-wrap text-slate-700">{ans}</p>
                </div>
              );
            })}
            {filteredResponses.every((r) => !String(r.answers?.q39 ?? "").trim()) && (
              <p className="py-6 text-center text-sm text-slate-500">
                ยังไม่มีคำตอบ (นักเรียนข้ามไป)
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ---- Detail view for a single dimension ----
  if (activeDimension) {
    const dimQuestions = questionsByDimension(activeDimension);
    return (
      <div className="mx-auto min-h-screen max-w-6xl bg-slate-100 px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveDimension(null)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-600 hover:bg-blue-50"
          >
            ← กลับ
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{activeDimension}</h1>
            <p className="text-sm text-blue-100">
              การกระจายคำตอบ (1–5) ของแต่ละข้อ · {filteredResponses.length} ผู้ตอบ
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {dimQuestions.map((q) => {
            const counts = [1, 2, 3, 4, 5].map((score) => ({
              score: String(score),
              count: filteredResponses.filter((r) => Number(r.answers?.[q.id]) === score).length,
            }));
            const vals = filteredResponses
              .map((r) => Number(r.answers?.[q.id]))
              .filter((n) => !Number.isNaN(n));
            const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
            return (
              <div
                key={q.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <h3 className="text-sm font-bold text-slate-700">
                    ข้อที่ {questions.findIndex((x) => x.id === q.id) + 1}. {q.title}
                  </h3>
                  <span className="shrink-0 rounded-full bg-gradient-to-r bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                    เฉลี่ย {avg.toFixed(2)}
                  </span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={counts} margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="score" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>1 = {q.minLabel}</span>
                  <span>5 = {q.maxLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl bg-slate-100 px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-blue-900 bg-blue-900 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🎛️ แผงควบคุม Admin</h1>
          <p className="text-sm text-blue-100">
            แบบประเมิน: {survey.title} · จำนวนผู้ตอบ{" "}
            <span className="font-bold text-amber-300">{filteredResponses.length}</span> คน
            {globalRoomFilter !== "all" && (
              <span className="ml-1 text-blue-200">({globalRoomFilter})</span>
            )}
          </p>
          <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
            {role === "teacher" ? "👨‍🏫 อาจารย์" : "👑 Admin"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {role === "admin" && selected.size > 0 && (
            <button
              type="button"
              onClick={deleteSelected}
              disabled={deleting}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
            >
              {deleting ? "กำลังลบ..." : `ลบ ${selected.size} รายการที่เลือก`}
            </button>
          )}
          <button
            type="button"
            onClick={handleExportXLSX}
            disabled={responses.length === 0}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            ดาวน์โหลด Excel (แยกตามห้อง)
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-600 hover:bg-blue-50"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {loadError}
        </div>
      )}

      {/* Global room filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <label htmlFor="global-room-filter" className="text-sm font-semibold text-slate-700">
          เลือกห้อง:
        </label>
        <select
          id="global-room-filter"
          value={globalRoomFilter}
          onChange={(e) => {
            setGlobalRoomFilter(e.target.value);
            setPage(0);
          }}
          className="h-10 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-800"
        >
          <option value="all">ทั้งหมด ({responses.length})</option>
          {roomsInData.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </select>
        {globalRoomFilter !== "all" && (
          <button
            type="button"
            onClick={() => setGlobalRoomFilter("all")}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
          >
            ล้างตัวกรอง
          </button>
        )}
      </div>

      {/* Dimension buttons */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          ดูรายละเอียดตามด้าน (กดเพื่อดูการกระจายคำตอบ 1–5)
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {dimensions().map((dim, i) => {
            const title =
              dim === "ตอนที่ 3 ทัศนคติและความคิดเห็น"
                ? "ทัศนคติและความคิดเห็น"
                : dim.replace(/^ด้านที่\s*\d+\s*/, "");
            return (
              <button
                key={dim}
                type="button"
                onClick={() => setActiveDimension(dim)}
                className="group flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-800 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-1 text-sm font-medium text-slate-700 group-hover:text-blue-800">
                  {title}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowOpenEnded(true)}
            className="group flex items-start gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-500 text-base text-white">
              ✍️
            </span>
            <span className="pt-1 text-sm font-medium text-slate-700 group-hover:text-blue-800">
              คำถามปลายเปิด
            </span>
          </button>
          {role === "admin" && (
            <button
              type="button"
              onClick={() => setShowFeelings(true)}
              className="group flex items-start gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-500 text-base text-white">
                💬
              </span>
              <span className="pt-1 text-sm font-medium text-slate-700 group-hover:text-blue-800">
                ความรู้สึกที่อยากจะบอก
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-700">จำนวนผู้ตอบตามระดับชั้น</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-700">เครื่องมือ AI ที่นักเรียนใช้</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={toolChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="tool" width={140} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-700">คะแนนเฉลี่ยตามด้าน</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dimensionAverages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis type="category" dataKey="dimension" width={180} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avg" fill="#60a5fa" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-700">คะแนนเฉลี่ยรวมตามระดับชั้น</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="avg" fill="#93c5fd" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Per-room dimension averages matrix */}
      {responses.length > 0 && globalRoomFilter === "all" && (
        <div className="mb-8 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-700">
              คะแนนเฉลี่ยตามด้าน แยกตามห้อง
            </h2>
            <p className="text-xs text-slate-500">
              เปรียบเทียบค่าเฉลี่ยของแต่ละด้านในแต่ละห้อง
            </p>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left font-bold text-slate-700">
                  ด้าน
                </th>
                {roomsInData.map((room) => (
                  <th key={room} className="px-3 py-2 text-center font-bold text-slate-700">
                    {room}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dimensions().map((dim) => {
                const qs = questionsByDimension(dim);
                const ids = qs.map((q) => q.id);
                return (
                  <tr key={dim} className="border-t border-slate-100">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2 text-slate-700">
                      {dim.replace(/^ด้านที่ \d+ /, "")}
                    </td>
                    {roomsInData.map((room) => {
                      const rs = responses.filter(
                        (r) => (r.grade_level || "(ไม่ระบุ)") === room,
                      );
                      const vals = rs
                        .map((r) => {
                          const nums = ids
                            .map((id) => Number(r.answers?.[id]))
                            .filter((n) => !Number.isNaN(n));
                          if (nums.length === 0) return null;
                          return nums.reduce((a, b) => a + b, 0) / nums.length;
                        })
                        .filter((v): v is number => v !== null);
                      const avg = vals.length
                        ? vals.reduce((a, b) => a + b, 0) / vals.length
                        : null;
                      const color =
                        avg === null
                          ? "text-slate-400"
                          : avg >= 4
                            ? "text-emerald-600 font-bold"
                            : avg >= 3
                              ? "text-blue-700 font-semibold"
                              : avg >= 2
                                ? "text-amber-600"
                                : "text-rose-600";
                      return (
                        <td key={room} className="px-3 py-2 text-center">
                          <span className={color}>
                            {avg === null ? "-" : avg.toFixed(2)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {/* Overall row */}
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                <td className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-slate-700">
                  เฉลี่ยรวม
                </td>
                {roomsInData.map((room) => {
                  const rs = responses.filter(
                    (r) => (r.grade_level || "(ไม่ระบุ)") === room,
                  );
                  const scaleIds = questions
                    .filter((q) => q.type === "scale")
                    .map((q) => q.id);
                  const vals = rs
                    .map((r) => {
                      const nums = scaleIds
                        .map((id) => Number(r.answers?.[id]))
                        .filter((n) => !Number.isNaN(n));
                      if (nums.length === 0) return null;
                      return nums.reduce((a, b) => a + b, 0) / nums.length;
                    })
                    .filter((v): v is number => v !== null);
                  const avg = vals.length
                    ? vals.reduce((a, b) => a + b, 0) / vals.length
                    : null;
                  return (
                    <td key={room} className="px-3 py-2 text-center text-blue-700">
                      {avg === null ? "-" : avg.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
              {/* Count row */}
              <tr className="border-t border-slate-100 text-xs text-slate-500">
                <td className="sticky left-0 z-10 bg-white px-3 py-2">
                  จำนวนผู้ตอบ
                </td>
                {roomsInData.map((room) => {
                  const count = responses.filter(
                    (r) => (r.grade_level || "(ไม่ระบุ)") === room,
                  ).length;
                  return (
                    <td key={room} className="px-3 py-2 text-center">
                      {count}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* AI Summary (text) */}
      {responses.length > 0 && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-800">
            📝 สรุปผลการประเมิน (โดย AI)
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-slate-700">
            {(() => {
              const lines: string[] = [];

              // Overall average
              const scaleIds = questions.filter((q) => q.type === "scale").map((q) => q.id);
              const allVals = filteredResponses.flatMap((r) =>
                scaleIds.map((id) => Number(r.answers?.[id])).filter((n) => !Number.isNaN(n)),
              );
              const overallAvg = allVals.length
                ? allVals.reduce((a, b) => a + b, 0) / allVals.length
                : 0;
              const overallLevel =
                overallAvg >= 4.5
                  ? "เป็นประจำทุกครั้ง"
                  : overallAvg >= 3.5
                    ? "บ่อยครั้ง"
                    : overallAvg >= 2.5
                      ? "บางครั้ง"
                      : overallAvg >= 1.5
                        ? "นาน ๆ ครั้ง"
                        : "ไม่เคยเลย";

              lines.push(
                `โดยรวม นักเรียน ${filteredResponses.length} คน มีพฤติกรรมการใช้ AI อยู่ในระดับ "${overallLevel}" (ค่าเฉลี่ย ${overallAvg.toFixed(2)} จาก 5.00)`,
              );

              // Dimension averages
              const dimAvgs = dimensions().map((dim) => {
                const qs = questionsByDimension(dim);
                const ids = qs.map((q) => q.id);
                const vals = filteredResponses
                  .map((r) => {
                    const nums = ids
                      .map((id) => Number(r.answers?.[id]))
                      .filter((n) => !Number.isNaN(n));
                    if (nums.length === 0) return null;
                    return nums.reduce((a, b) => a + b, 0) / nums.length;
                  })
                  .filter((v): v is number => v !== null);
                const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
                return { dim, avg, count: vals.length };
              });

              const strongest = dimAvgs.reduce((a, b) => (a.avg > b.avg ? a : b));
              const weakest = dimAvgs.reduce((a, b) => (a.avg < b.avg ? a : b));

              lines.push(
                `ด้านที่คะแนนสูงสุด: "${strongest.dim.replace(/^ด้านที่ \\d+ /, "")}" (ค่าเฉลี่ย ${strongest.avg.toFixed(2)})`,
              );
              lines.push(
                `ด้านที่คะแนนต่ำสุด: "${weakest.dim.replace(/^ด้านที่ \\d+ /, "")}" (ค่าเฉลี่ย ${weakest.avg.toFixed(2)})`,
              );

              // แสดงค่าเฉลี่ยของทุกด้าน
              lines.push("");
              lines.push("📊 ค่าเฉลี่ยตามด้าน (ภาพรวม):");
              dimAvgs.forEach((d) => {
                const name = d.dim.replace(/^ด้านที่ \\d+ /, "");
                lines.push(`   • ${name}: ${d.avg.toFixed(2)}`);
              });

              // ตีความค่าเฉลี่ยของแต่ละด้าน (plain language)
              lines.push("");
              lines.push("💡 ตีความค่าเฉลี่ย:");
              const interpret = (dim: string, avg: number): string => {
                const name = dim.replace(/^ด้านที่ \\d+ /, "");
                const level =
                  avg >= 4.5
                    ? "เป็นประจำทุกครั้ง"
                    : avg >= 3.5
                      ? "บ่อยครั้ง"
                      : avg >= 2.5
                        ? "บางครั้ง"
                        : avg >= 1.5
                          ? "นาน ๆ ครั้ง"
                          : "ไม่เคยเลย";
                const attitudeLevel =
                  avg >= 4.5
                    ? "เห็นด้วยอย่างยิ่ง"
                    : avg >= 3.5
                      ? "เห็นด้วย"
                      : avg >= 2.5
                        ? "ไม่แน่ใจ"
                        : avg >= 1.5
                          ? "ไม่เห็นด้วย"
                          : "ไม่เห็นด้วยอย่างยิ่ง";
                const isAttitude = dim.includes("ทัศนคติ");
                const lvl = isAttitude ? attitudeLevel : level;

                if (dim.includes("พึ่งพา")) {
                  // ด้านที่ 6: สูง = ควรระวัง, ต่ำ = ดี
                  if (avg >= 4) return `${name}: นักเรียน "พึ่งพา AI มาก" — ควรจัดกิจกรรมฝึกคิดด้วยตนเอง`;
                  if (avg >= 3) return `${name}: นักเรียน "พึ่งพา AI ระดับปานกลาง" — ควรระวัง`;
                  return `${name}: นักเรียน "ทำงานได้ด้วยตนเอง" — ดี`;
                }
                if (dim.includes("จริยธรรม")) {
                  if (avg >= 4) return `${name}: นักเรียน "มีจริยธรรม" — ไม่คัดลอกทั้งหมด (ดี)`;
                  if (avg >= 3) return `${name}: นักเรียน "มีจริยธรรมระดับปานกลาง"`;
                  return `${name}: นักเรียน "อาจคัดลอก" — ควรเน้นเรื่องจริยธรรม`;
                }
                if (dim.includes("กระบวนการคิด")) {
                  if (avg >= 4) return `${name}: นักเรียน "คิดก่อนใช้ AI" — ดีมาก`;
                  if (avg >= 3) return `${name}: นักเรียน "คิดก่อนใช้ AI บางครั้ง"`;
                  return `${name}: นักเรียน "ข้ามขั้นตอนคิด" — ควรระวัง`;
                }
                if (dim.includes("ตรวจสอบ")) {
                  if (avg >= 4) return `${name}: นักเรียน "ตรวจสอบก่อนใช้" — ดี`;
                  if (avg >= 3) return `${name}: นักเรียน "ตรวจสอบบางครั้ง"`;
                  return `${name}: นักเรียน "เชื่อ AI ทันที" — ควรระวัง`;
                }
                if (dim.includes("การเรียนรู้")) {
                  if (avg >= 4) return `${name}: "AI ส่งเสริมการเรียนรู้" — ดี`;
                  if (avg >= 3) return `${name}: "AI ส่งเสริมการเรียนรู้ บางส่วน"`;
                  return `${name}: "AI ไม่ได้ช่วยให้เรียนรู้" — ควรปรับ`;
                }
                if (isAttitude) {
                  return `${name}: นักเรียน "${lvl}" ว่า AI ส่งเสริมการเรียนรู้`;
                }
                // default (behavior dimensions)
                return `${name}: นักเรียนใช้ AI "${lvl}"`;
              };
              dimAvgs.forEach((d) => {
                lines.push(`   • ${interpret(d.dim, d.avg)}`);
              });

              // จุดแข็ง/จุดอ่อน รายด้าน (ทุกด้าน)
              lines.push("");
              lines.push("📋 จุดแข็ง/จุดอ่อน รายด้าน:");
              dimAvgs.forEach((d) => {
                const name = d.dim.replace(/^ด้านที่ \\d+ /, "");
                const isDependence = d.dim.includes("พึ่งพา");
                const isReverse = isDependence; // ด้านที่ 6: สูง = ควรระวัง
                let status: string;
                let icon: string;
                if (isReverse) {
                  if (d.avg >= 4) {
                    status = "ควรระวัง (พึ่งพา AI มาก)";
                    icon = "⚠️";
                  } else if (d.avg >= 3) {
                    status = "ระดับปานกลาง";
                    icon = "🟡";
                  } else {
                    status = "ดี (ไม่พึ่งพา AI มาก)";
                    icon = "✅";
                  }
                } else {
                  if (d.avg >= 4) {
                    status = "ดี";
                    icon = "✅";
                  } else if (d.avg >= 3) {
                    status = "ปานกลาง";
                    icon = "🟡";
                  } else {
                    status = "ควรพัฒนา";
                    icon = "⚠️";
                  }
                }
                lines.push(`   ${icon} ${name}: ${d.avg.toFixed(2)} — ${status}`);
              });

              // Strengths (detailed)
              const strengths: string[] = [];
              const dim3 = dimAvgs.find((d) => d.dim.includes("กระบวนการคิด"));
              if (dim3 && dim3.avg >= 4)
                strengths.push("นักเรียนคิดด้วยตนเองก่อนใช้ AI (ดีมาก)");
              const dim4 = dimAvgs.find((d) => d.dim.includes("ตรวจสอบ"));
              if (dim4 && dim4.avg >= 4)
                strengths.push("นักเรียนตรวจสอบคำตอบจาก AI ก่อนนำไปใช้ (ดี)");
              const dim7 = dimAvgs.find((d) => d.dim.includes("จริยธรรม"));
              if (dim7 && dim7.avg >= 4)
                strengths.push("นักเรียนมีจริยธรรม (ไม่คัดลอกคำตอบทั้งหมด)");
              const dim5 = dimAvgs.find((d) => d.dim.includes("การเรียนรู้"));
              if (dim5 && dim5.avg >= 4)
                strengths.push("AI ส่งเสริมการเรียนรู้ (นักเรียนเข้าใจเนื้อหามากขึ้น)");
              const dim1 = dimAvgs.find((d) => d.dim.includes("พฤติกรรมและความถี่"));
              if (dim1 && dim1.avg >= 3.5 && dim1.avg <= 4.5)
                strengths.push("นักเรียนใช้ AI บ่อยครั้ง (ไม่มากเกินไป)");

              // Concerns (detailed)
              const concerns: string[] = [];
              const dim6 = dimAvgs.find((d) => d.dim.includes("พึ่งพา"));
              if (dim6 && dim6.avg >= 3.5)
                concerns.push("นักเรียนพึ่งพา AI ค่อนข้างมาก — ควรจัดกิจกรรมฝึกคิดด้วยตนเอง");
              const q11avg = filteredResponses
                .map((r) => Number(r.answers?.q11))
                .filter((n) => !Number.isNaN(n));
              const q11mean = q11avg.length
                ? q11avg.reduce((a, b) => a + b, 0) / q11avg.length
                : 0;
              if (q11mean >= 3.5)
                concerns.push("นักเรียนใช้ AI สร้างคำตอบส่งครูบ่อย — ควรเน้นเรื่องจริยธรรมการใช้ AI");
              const q7avg = filteredResponses
                .map((r) => Number(r.answers?.q7))
                .filter((n) => !Number.isNaN(n));
              const q7mean = q7avg.length ? q7avg.reduce((a, b) => a + b, 0) / q7avg.length : 0;
              if (q7mean >= 3.5)
                concerns.push("นักเรียนเลือกใช้ AI แม้ว่างานทำเองได้ — ควรฝึกการคิดด้วยตนเอง");
              const q22avg = filteredResponses
                .map((r) => Number(r.answers?.q22))
                .filter((n) => !Number.isNaN(n));
              const q22mean = q22avg.length
                ? q22avg.reduce((a, b) => a + b, 0) / q22avg.length
                : 0;
              if (q22mean < 4)
                concerns.push("นักเรียนอธิบายเนื้อหาด้วยคำพูดตนเองได้ไม่ดีนัก — ควรพัฒนา");
              const q28avg = filteredResponses
                .map((r) => Number(r.answers?.q28))
                .filter((n) => !Number.isNaN(n));
              const q28mean = q28avg.length
                ? q28avg.reduce((a, b) => a + b, 0) / q28avg.length
                : 0;
              if (q28mean < 3.5)
                concerns.push("นักเรียนทำงานได้ด้วยตนเอง (แม้ไม่มี AI) ระดับปานกลาง — ควรฝึกเพิ่ม");

              if (strengths.length > 0) {
                lines.push("");
                lines.push("✅ จุดแข็ง:");
                strengths.forEach((s) => lines.push(`   • ${s}`));
              }
              if (concerns.length > 0) {
                lines.push("");
                lines.push("⚠️ จุดที่ควรระวัง:");
                concerns.forEach((c) => lines.push(`   • ${c}`));
              }
              if (strengths.length === 0 && concerns.length === 0)
                lines.push("");
                lines.push("   (ข้อมูลยังน้อย — ควรเก็บข้อมูลเพิ่มเพื่อวิเคราะห์ที่แม่นยำขึ้น)");

              // AI tools
              const toolCounts: Record<string, number> = {};
              for (const r of filteredResponses) {
                for (const t of r.ai_tools ?? []) {
                  toolCounts[t] = (toolCounts[t] ?? 0) + 1;
                }
              }
              const topTools = Object.entries(toolCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);
              if (topTools.length > 0) {
                lines.push("");
                lines.push(
                  `เครื่องมือ AI ที่ใช้มากที่สุด: ${topTools
                    .map(([t, c]) => `${t} (${c} คน)`)
                    .join(", ")}`,
                );
              }

              // Per-room summary (if multiple rooms)
              const rooms = Array.from(
                new Set(filteredResponses.map((r) => r.grade_level || "(ไม่ระบุ)")),
              ).sort();
              if (rooms.length > 1) {
                lines.push("");
                lines.push("📋 สรุปตามห้อง:");
                for (const room of rooms) {
                  const roomResp = filteredResponses.filter(
                    (r) => (r.grade_level || "(ไม่ระบุ)") === room,
                  );
                  const roomVals = roomResp.flatMap((r) =>
                    scaleIds.map((id) => Number(r.answers?.[id])).filter((n) => !Number.isNaN(n)),
                  );
                  const roomAvg = roomVals.length
                    ? roomVals.reduce((a, b) => a + b, 0) / roomVals.length
                    : 0;
                  const roomLevel =
                    roomAvg >= 4.5
                      ? "เป็นประจำ"
                      : roomAvg >= 3.5
                        ? "บ่อยครั้ง"
                        : roomAvg >= 2.5
                          ? "บางครั้ง"
                          : "นาน ๆ ครั้ง";
                  // Find strongest/weakest dimension for this room
                  const roomDimAvgs = dimensions().map((dim) => {
                    const qs = questionsByDimension(dim);
                    const ids = qs.map((q) => q.id);
                    const vals = roomResp
                      .map((r) => {
                        const nums = ids
                          .map((id) => Number(r.answers?.[id]))
                          .filter((n) => !Number.isNaN(n));
                        if (nums.length === 0) return null;
                        return nums.reduce((a, b) => a + b, 0) / nums.length;
                      })
                      .filter((v): v is number => v !== null);
                    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
                    return { dim: dim.replace(/^ด้านที่ \d+ /, ""), avg };
                  });
                  const roomStrongest = roomDimAvgs.reduce((a, b) =>
                    a.avg > b.avg ? a : b,
                  );
                  const roomWeakest = roomDimAvgs.reduce((a, b) =>
                    a.avg < b.avg ? a : b,
                  );
                  lines.push(
                    `   • ${room}: ค่าเฉลี่ย ${roomAvg.toFixed(2)} (${roomLevel}) · ${roomResp.length} คน`,
                  );
                  lines.push(
                    `     จุดแข็ง: ${roomStrongest.dim} (${roomStrongest.avg.toFixed(2)}) · จุดอ่อน: ${roomWeakest.dim} (${roomWeakest.avg.toFixed(2)})`,
                  );
                  lines.push("     ค่าเฉลี่ยตามด้าน:");
                  roomDimAvgs.forEach((d) => {
                    lines.push(`       - ${d.dim}: ${d.avg.toFixed(2)}`);
                  });
                  lines.push("     ตีความ:");
                  roomDimAvgs.forEach((d) => {
                    const lvl =
                      d.avg >= 4.5
                        ? "เป็นประจำ"
                        : d.avg >= 3.5
                          ? "บ่อยครั้ง"
                          : d.avg >= 2.5
                            ? "บางครั้ง"
                            : "นาน ๆ ครั้ง";
                    lines.push(`       - ${d.dim}: ${lvl}`);
                  });
                }
              }

              // Attitude
              const attVals = filteredResponses
                .flatMap((r) => [r.answers?.q32, r.answers?.q33, r.answers?.q34])
                .filter((v): v is number => typeof v === "number");
              const attAvg = attVals.length
                ? attVals.reduce((a, b) => a + b, 0) / attVals.length
                : 0;
              if (attVals.length > 0) {
                lines.push("");
                lines.push(
                  `ทัศนคติ (ตอนที่ 3): ค่าเฉลี่ย ${attAvg.toFixed(2)} — นักเรียน ${
                    attAvg >= 4
                      ? "เห็นด้วยอย่างยิ่ง"
                      : attAvg >= 3
                        ? "เห็นด้วย"
                        : attAvg >= 2
                          ? "ไม่แน่ใจ"
                          : "ไม่เห็นด้วย"
                  } ว่า AI ส่งเสริมการเรียนรู้`,
                );
              }

              // Open-ended sentiment (q39 feelings)
              const feelings = filteredResponses
                .map((r) => String(r.answers?.q39 ?? "").trim())
                .filter(Boolean);
              if (feelings.length > 0) {
                lines.push("");
                lines.push(
                  `💬 ความรู้สึกต่อนักศึกษาฝึกสอน: ${feelings.length}/${filteredResponses.length} คนแสดงความรู้สึก — ส่วนใหญ่เป็น feedback เชิงบวก`,
                );
              }

              // Recommendations
              lines.push("");
              lines.push("📌 ข้อเสนอแนะ:");
              if (dim6 && dim6.avg >= 3.5)
                lines.push(
                  "   • จัดกิจกรรมฝึกคิดด้วยตนเอง (ไม่ใช้ AI) เพื่อลดการพึ่งพา AI มากเกินไป",
                );
              if (q11mean >= 3.5)
                lines.push("   • เน้นเรื่องจริยธรรมการใช้ AI — ไม่คัดลอกคำตอบส่งครู");
              if (q7mean >= 3.5)
                lines.push("   • ฝึกให้นักเรียนทำโจทย์ด้วยตนเองก่อนใช้ AI");
              if (q22mean < 4)
                lines.push("   • ฝึกให้นักเรียนอธิบายเนื้อหาด้วยคำพูดตนเอง");
              if (strengths.length === 0 && concerns.length === 0)
                lines.push("   • ข้อมูลยังน้อย — ควรเก็บข้อมูลเพิ่มเพื่อวิเคราะห์ที่แม่นยำขึ้น");

              return lines.map((line, i) => (
                <p key={i} className={line === "" ? "h-2" : ""}>
                  {line}
                </p>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-100">
            <tr>
              {role === "admin" && (
                <th className="px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={responses.length > 0 && selected.size === responses.length}
                    onChange={toggleSelectAll}
                    aria-label="เลือกทั้งหมด"
                  />
                </th>
              )}
              <th className="px-3 py-2 text-left font-bold text-slate-700">วันที่</th>
              <th className="px-3 py-2 text-left font-bold text-slate-700">ระดับชั้น</th>
              <th className="px-3 py-2 text-left font-bold text-slate-700">เคยใช้ AI</th>
              <th className="px-3 py-2 text-left font-bold text-slate-700">เครื่องมือ</th>
              <th className="px-3 py-2 text-left font-bold text-slate-700">คะแนนเฉลี่ย</th>
              <th className="px-3 py-2 text-left font-bold text-slate-700">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredResponses.length === 0 && (
              <tr>
                <td
                  colSpan={role === "admin" ? 7 : 5}
                  className="px-3 py-6 text-center text-slate-500"
                >
                  ยังไม่มีข้อมูล
                </td>
              </tr>
            )}
            {paginatedResponses.map((r) => {
              const scaleIds = questions.filter((q) => q.type === "scale").map((q) => q.id);
              const nums = scaleIds
                .map((id) => Number(r.answers?.[id]))
                .filter((n) => !Number.isNaN(n));
              const avg = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : "-";
              return (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-blue-50">
                  {role === "admin" && (
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        aria-label="เลือกรายการ"
                      />
                    </td>
                  )}
                  <td className="px-3 py-2 text-muted">
                    {new Date(r.submitted_at).toLocaleString("th-TH")}
                  </td>
                  <td className="px-3 py-2">{r.grade_level}</td>
                  <td className="px-3 py-2">{r.used_ai === "yes" ? "เคย" : "ไม่เคย"}</td>
                  <td className="px-3 py-2">
                    {(r.ai_tools ?? [])
                      .map((t) =>
                        t === "other"
                          ? (r.answers?.q4_ai_tools_other as string) || "อื่น ๆ"
                          : t,
                      )
                      .join(", ")}
                  </td>
                  <td className="px-3 py-2 font-semibold text-blue-700">{avg}</td>
                  {role === "admin" && (
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => deleteOne(r.id)}
                        disabled={deleting}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                      >
                        ลบ
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredResponses.length > PAGE_SIZE && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">
              แสดง {safePage * PAGE_SIZE + 1}–
              {Math.min((safePage + 1) * PAGE_SIZE, filteredResponses.length)} จาก{" "}
              {filteredResponses.length} รายการ
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← ก่อนหน้า
              </button>
              {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i)}
                  className={[
                    "h-8 w-8 rounded-lg text-sm font-medium transition",
                    i === safePage
                      ? "bg-blue-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-blue-400",
                  ].join(" ")}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage === totalPages - 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
