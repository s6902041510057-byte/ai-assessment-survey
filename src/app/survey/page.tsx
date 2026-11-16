import { SurveyShell } from "@/components/form/SurveyShell";
import { Logo } from "@/components/Logo";

export default function SurveyPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header banner */}
      <header className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        {/* subtle pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 24px)",
          }}
        />
        <div className="relative mx-auto max-w-[680px] px-4 py-8 sm:py-10">
          {/* emblem + badge */}
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

      <SurveyShell />

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-600">
          🔒 ข้อมูลของคุณจะถูกเก็บเป็นความลับและใช้เพื่อการศึกษาเท่านั้น
        </p>
        <p className="mt-1">แบบประเมินพฤติกรรมการใช้ปัญญาประดิษฐ์ (AI) · สำหรับนักเรียน</p>
      </footer>
    </main>
  );
}
