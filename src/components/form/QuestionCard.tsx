"use client";

import type { Question } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  index: number;
  value?: string | string[] | number;
  error?: string;
  onChange: (value: string | string[] | number | undefined) => void;
  onToggle?: (value: string | number) => void;
}

export function QuestionCard({
  question,
  index,
  value,
  error,
  onChange,
  onToggle,
}: QuestionCardProps) {
  const handleMultiToggle = (optValue: string) => {
    const current = Array.isArray(value) ? (value as string[]) : [];
    const next = current.includes(optValue)
      ? current.filter((v) => v !== optValue)
      : [...current, optValue];
    onChange(next);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-900 text-sm font-bold text-white">
          {index + 1}
        </span>
        <div>
          <h2 className="text-base font-bold leading-relaxed text-slate-800 sm:text-lg">
            {question.title}
            {question.required && <span className="ml-1.5 text-rose-500">*</span>}
          </h2>
          {question.description && (
            <p className="mt-1 text-sm text-slate-500">{question.description}</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        {question.type === "dropdown" && (
          <select
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="h-12 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-blue-800 focus:ring-4 focus:ring-blue-800/15"
          >
            <option value="">— เลือกระดับชั้น —</option>
            {question.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {question.type === "single-choice" && (
          <div className="space-y-2.5" role="radiogroup" aria-label={question.title}>
            {question.options.map((opt) => {
              const active = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => (active && onToggle ? onToggle(opt.value) : onChange(opt.value))}
                  aria-pressed={active}
                  className={[
                    "flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all duration-150",
                    active
                      ? "border-blue-800 bg-blue-50 font-semibold text-blue-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50/50",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                      active
                        ? "border-blue-800 bg-blue-800"
                        : "border-slate-300 bg-white",
                    ].join(" ")}
                  >
                    {active && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {question.type === "multiple-choice" && (
          <div className="space-y-2.5" role="group" aria-label={question.title}>
            {question.options.map((opt) => {
              const active = Array.isArray(value) && (value as string[]).includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleMultiToggle(opt.value)}
                  aria-pressed={active}
                  className={[
                    "flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all duration-150",
                    active
                      ? "border-blue-800 bg-blue-50 font-semibold text-blue-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50/50",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition",
                      active
                        ? "border-blue-800 bg-blue-800"
                        : "border-slate-300 bg-white",
                    ].join(" ")}
                  >
                    {active && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {question.type === "scale" && (
          <div>
            <div className="flex flex-wrap justify-center gap-2" role="radiogroup" aria-label={question.title}>
              {Array.from({ length: question.max - question.min + 1 }, (_, i) => question.min + i).map(
                (n) => {
                  const active = value === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => (active && onToggle ? onToggle(n) : onChange(n))}
                      aria-pressed={active}
                      className={[
                        "h-12 w-12 rounded-full border-2 text-sm font-bold transition-all duration-150",
                        active
                          ? "border-blue-800 bg-blue-900 text-white shadow-md scale-110"
                          : "border-slate-300 bg-white text-slate-600 hover:border-blue-500 hover:text-blue-800",
                      ].join(" ")}
                    >
                      {n}
                    </button>
                  );
                },
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
              {question.labels.map((lbl, i) => (
                <span key={i} className="whitespace-nowrap">
                  <span className="font-bold text-slate-700">{i + 1}</span> = {lbl}
                </span>
              ))}
            </div>
          </div>
        )}

        {question.type === "short-text" && (
          <input
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="h-12 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-blue-800 focus:ring-4 focus:ring-blue-800/15"
            placeholder="พิมพ์คำตอบของคุณ"
          />
        )}

        {question.type === "long-text" && (
          <textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-800 focus:ring-4 focus:ring-blue-800/15"
            placeholder="พิมพ์คำตอบของคุณ"
          />
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
