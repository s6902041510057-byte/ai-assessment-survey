"use client";

import { useEffect, useState, useCallback } from "react";
import { QuestionCard } from "./QuestionCard";
import { survey, buildPages } from "@/data/survey";
import type { Answers } from "@/lib/types";

const DRAFT_KEY = `assessment-form:draft:${survey.id}`;

function loadDraft(): Answers {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed?.answers ?? {};
  } catch {
    return {};
  }
}

function saveDraft(answers: Answers) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, updatedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function SurveyShell() {
  const pages = buildPages();
  const allQuestions = survey.questions;
  const totalQuestions = allQuestions.length;

  const [answers, setAnswers] = useState<Answers>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // อ่าน draft จาก localStorage ตอนเริ่มต้น (client-only)
  useEffect(() => {
    const d = loadDraft();
    if (Object.keys(d).length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers(d);
      setDraftRestored(true);
    }
  }, []);

  useEffect(() => {
    if (submitted) return;
    const t = setTimeout(() => saveDraft(answers), 300);
    return () => clearTimeout(t);
  }, [answers, submitted]);

  const currentPage = pages[pageIndex];
  const pageQuestions = currentPage.questions;

  const answeredCount = allQuestions.filter((q) => {
    const v = answers[q.id];
    if (v === undefined || v === null || v === "") return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  }).length;

  const setValue = useCallback((id: string, v: string | string[] | number | undefined) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (v === undefined) delete next[id];
      else next[id] = v;
      return next;
    });
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const toggleValue = useCallback(
    (id: string, v: string | number) => {
      setAnswers((prev) => {
        const cur = prev[id];
        const next = { ...prev };
        if (cur === v) delete next[id];
        else next[id] = v;
        return next;
      });
    },
    [],
  );

  const isRequired = (q: { id: string; required: boolean }) => {
    if (!q.required) return false;
    // ข้อ q4 (AI ที่เคยใช้) บังคับเฉพาะเมื่อตอบว่า "เคย" ใช้ AI
    if (q.id === "q4_ai_tools" && answers.q3_used_ai !== "yes") return false;
    return true;
  };

  const goNext = () => {
    // อนุญาตให้กดถัดไปได้แม้ยังไม่ตอบ — validation จะทำตอนส่ง
    if (pageIndex < pages.length - 1) {
      setPageIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goPrev = () => {
    if (pageIndex > 0) {
      setPageIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    for (const q of allQuestions) {
      if (!isRequired(q)) continue;
      const v = answers[q.id];
      if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
        newErrors[q.id] = "จำเป็นต้องตอบคำถามนี้";
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstErrId = allQuestions.find((q) => newErrors[q.id])?.id;
      if (firstErrId) {
        // เด้งไปหน้าที่มีคำถามที่ยังไม่ได้ตอบ
        const targetPage = pages.findIndex((p) =>
          p.questions.some((q) => q.id === firstErrId),
        );
        if (targetPage >= 0 && targetPage !== pageIndex) {
          setPageIndex(targetPage);
        }
        setTimeout(() => {
          const el = document.getElementById(firstErrId);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        grade_level: String(answers.q1_grade ?? ""),
        used_ai: String(answers.q3_used_ai ?? ""),
        ai_tools: Array.isArray(answers.q4_ai_tools) ? (answers.q4_ai_tools as string[]) : [],
        answers,
      };

      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "ส่งคำตอบไม่สำเร็จ");
      }

      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!confirm("ต้องการล้างคำตอบทั้งหมดและเริ่มใหม่หรือไม่?")) return;
    setAnswers({});
    setPageIndex(0);
    setErrors({});
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-[680px] px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-900 shadow-lg">
          <svg
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">ส่งคำตอบเรียบร้อยแล้ว</h1>
        <p className="mt-2 text-slate-500">ขอบคุณที่ให้ความร่วมมือในการตอบแบบประเมิน</p>

        {/* Contact channels */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="mb-3 text-sm font-semibold text-slate-700">ติดต่อ / สอบถาม</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://www.facebook.com/share/1dVzV2YbXd/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 transition hover:bg-blue-100"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#1877F2]">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg> Facebook: ฟิตรี มะหมัด
            </a>
            <a
              href="https://www.instagram.com/fitree.hm/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-medium text-pink-800 transition hover:bg-pink-100"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#E4405F]">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg> Instagram: fitree.hm
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isOpenPage = currentPage.id === "open";
  const isFeelingsPage = currentPage.id === "feelings";
  const otherSelected =
    Array.isArray(answers.q4_ai_tools) && (answers.q4_ai_tools as string[]).includes("other");

  const handleSkipFeelings = () => {
    setValue("q39", undefined);
    handleSubmit();
  };

  return (
    <div className="mx-auto max-w-[680px] px-4 py-8 sm:py-12">
      {draftRestored && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
          บันทึกคำตอบชั่วคราวแล้ว — คุณสามารถดำเนินการต่อได้ หรือ{" "}
          <button type="button" onClick={handleReset} className="underline">
            เริ่มใหม่
          </button>
        </div>
      )}

      {/* Progress */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">
            หน้าที่ {pageIndex + 1} / {pages.length}
          </span>
          <span className="rounded-full bg-blue-900 px-2.5 py-0.5 text-xs font-bold text-white">
            {answeredCount} / {totalQuestions} ข้อ · {Math.round(
              (answeredCount / totalQuestions) * 100,
            )}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-800 transition-[width] duration-300"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Page title */}
      <div className="mb-5 border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-800 sm:text-xl">{currentPage.title}</h2>
        {currentPage.subtitle && (
          <p className="mt-1 text-sm text-slate-500">{currentPage.subtitle}</p>
        )}
      </div>

      {isOpenPage && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
          💡 กด &quot;ส่ง&quot; เพื่อไปยังหน้าแสดงความรู้สึก (ไม่บังคับ — สามารถข้ามได้)
        </div>
      )}

      {currentPage.id.startsWith("ด้านที่") && (
        <div className="mb-6 rounded-lg border-l-4 border-blue-800 bg-blue-50 p-4 text-sm text-slate-700">
          <span className="font-semibold text-blue-900">เกณฑ์:</span> 5 = เป็นประจำทุกครั้ง, 4 = บ่อยครั้ง, 3 = บางครั้ง, 2 = นาน ๆ ครั้ง, 1 = ไม่เคยเลย
        </div>
      )}
      {currentPage.id === "attitude" && (
        <div className="mb-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-slate-700">
          <span className="font-semibold text-amber-800">เกณฑ์:</span> 5 = เห็นด้วยอย่างยิ่ง, 4 = เห็นด้วย, 3 = ไม่แน่ใจ, 2 = ไม่เห็นด้วย, 1 = ไม่เห็นด้วยอย่างยิ่ง
        </div>
      )}

      {/* Questions on this page */}
      <div className="space-y-5">
        {pageQuestions.map((q) => {
          const globalIndex = allQuestions.findIndex((x) => x.id === q.id);
          return (
            <div key={q.id} id={q.id}>
              {q.type === "scale" && q.dimension && pageQuestions.length > 1 && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-800">
                  {q.dimension}
                </p>
              )}
              <QuestionCard
                question={
                  q.id === "q4_ai_tools"
                    ? { ...q, required: answers.q3_used_ai === "yes" }
                    : q
                }
                index={globalIndex}
                value={answers[q.id]}
                error={errors[q.id]}
                onChange={(v) => setValue(q.id, v)}
                onToggle={(v) => toggleValue(q.id, v)}
              />
            </div>
          );
        })}

        {/* "อื่น ๆ" text input for q4 */}
        {pageQuestions.some((q) => q.id === "q4_ai_tools") && otherSelected && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <label htmlFor="q4_other" className="mb-2 block text-sm font-medium text-slate-700">
              โปรดระบุ AI อื่น ๆ ที่คุณเคยใช้
            </label>
            <input
              id="q4_other"
              type="text"
              value={(answers.q4_ai_tools_other as string) ?? ""}
              onChange={(e) => setValue("q4_ai_tools_other", e.target.value)}
              className="h-12 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-blue-800 focus:ring-4 focus:ring-blue-800/15"
              placeholder="เช่น Perplexity, Claude, Poe"
            />
          </div>
        )}
      </div>

      {isFeelingsPage && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="mb-2 text-xs font-semibold text-slate-600">ติดต่อ / สอบถาม</p>
          <div className="flex flex-wrap justify-center gap-2">
            <a
              href="https://www.facebook.com/share/1dVzV2YbXd/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-800 transition hover:bg-blue-100"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#1877F2]">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg> Facebook: ฟิตรี มะหมัด
            </a>
            <a
              href="https://www.instagram.com/fitree.hm/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-800 transition hover:bg-pink-100"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#E4405F]">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg> Instagram: fitree.hm
            </a>
          </div>
        </div>
      )}

      {submitError && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {submitError}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex flex-row items-center justify-between gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={pageIndex === 0}
          className="rounded-lg border-2 border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-800 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
        >
          ← ย้อนกลับ
        </button>

        <div className="flex flex-wrap gap-3">
          {isFeelingsPage ? (
            <>
              <button
                type="button"
                onClick={handleSkipFeelings}
                disabled={submitting}
                className="rounded-lg border-2 border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-800 disabled:opacity-50 sm:px-6"
              >
                ข้าม (ไม่ตอบ)
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-blue-900 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800 disabled:opacity-50 sm:px-8 sm:text-base"
              >
                {submitting ? "กำลังส่ง..." : "ส่งคำตอบ"}
              </button>
            </>
          ) : isOpenPage ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg bg-blue-900 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800 sm:px-8 sm:text-base"
            >
              ส่ง →
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg bg-blue-900 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800 sm:px-8 sm:text-base"
            >
              ถัดไป →
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
