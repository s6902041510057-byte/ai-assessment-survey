"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export default function WelcomePage() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  const handleStart = () => {
    setStarting(true);
    setTimeout(() => router.push("/survey"), 600);
  };

  return (
    <main className="flex min-h-screen flex-col bg-slate-100">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 24px)",
          }}
        />
        <div className="relative mx-auto max-w-[680px] px-4 py-8 sm:py-10">
          <div className="mb-4 flex items-center gap-3">
            <Logo size={56} className="border-2 border-amber-300 shadow-lg" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-200">
                แบบประเมินออนไลน์
              </p>
              <p className="text-xs text-blue-200">ฉบับประเมินพฤติกรรมการใช้ AI</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold leading-snug sm:text-3xl">
            แบบประเมินพฤติกรรมการใช้ปัญญาประดิษฐ์ (AI)
          </h1>
          <p className="mt-2 text-sm text-blue-100 sm:text-base">
            เพื่อส่งเสริมการเรียนรู้ของนักเรียน · ไม่ระบุตัวตัวตน · ใช้เวลา 5–8 นาที
          </p>
          <div className="mt-4 h-1 w-24 rounded-full bg-amber-300" />
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto w-full max-w-[680px] flex-1 px-4 py-12">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">ยินดีต้อนรับ</h2>
          <p className="mt-3 leading-relaxed text-slate-600">
            แบบประเมินฉบับนี้จัดทำขึ้นเพื่อศึกษาพฤติกรรมและความคิดเห็นของนักเรียน
            เกี่ยวกับการใช้ปัญญาประดิษฐ์ (AI) ในการเรียนและการทำงาน
            ข้อมูลที่ได้จะนำไปใช้เพื่อพัฒนาการจัดการเรียนรู้ให้เหมาะสมกับนักเรียน
          </p>
          <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-800">✓</span>
              ไม่ระบุตัวตัวตน และไม่มีผลต่อคะแนนการเรียน
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-800">✓</span>
              ตอบตามพฤติกรรมและความคิดเห็นที่เกิดขึ้นจริง
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-800">✓</span>
              ใช้เวลาไม่นาน ประมาณ 5–8 นาที
            </li>
          </ul>

          <button
            type="button"
            onClick={handleStart}
            disabled={starting}
            className="mt-8 rounded-lg bg-blue-900 px-10 py-4 text-lg font-bold text-white shadow-md transition hover:bg-blue-800 disabled:opacity-60"
          >
            {starting ? "กำลังนำทาง..." : "เริ่มทำแบบประเมิน"}
          </button>

          <p className="mt-4 text-xs text-slate-500">
            กดปุ่มด้านบนเพื่อเริ่มต้นการทำแบบประเมิน
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-600">
          🔒 ข้อมูลของคุณจะถูกเก็บเป็นความลับและใช้เพื่อการศึกษาเท่านั้น
        </p>
        <p className="mt-1">แบบประเมินพฤติกรรมการใช้ปัญญาประดิษฐ์ (AI) · สำหรับนักเรียน</p>
      </footer>
    </main>
  );
}
