// คัดลอกไปที่ src/components/form/QuestionCard.tsx
// การ์ดคำถามพร้อมตัวเลือกแบบ card + rating scale
// ใช้ design tokens จาก references/ui-design-system.md (Tailwind v4 @theme)

"use client";

import type { Question } from "@/data/survey";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  value?: string | string[] | number;
  error?: string;
  onChange: (value: string | string[] | number) => void;
}

export function QuestionCard({
  question,
  index,
  total,
  value,
  error,
  onChange,
}: QuestionCardProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <p className="text-sm text-muted">
        ข้อที่ {index + 1} / {total}
      </p>
      <h2 className="mt-1 text-lg font-semibold text-text sm:text-xl">
        {question.title}
        {question.required && <span className="ml-1 text-error">*</span>}
      </h2>
      {question.description && (
        <p className="mt-1 text-sm text-muted">{question.description}</p>
      )}

      <div className="mt-5">
        {question.type === "single-choice" && (
          <div className="space-y-3" role="radiogroup" aria-label={question.title}>
            {question.options.map((opt) => {
              const active = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange(opt.value)}
                  aria-pressed={active}
                  className={[
                    "w-full rounded-xl border px-4 py-3 text-left transition-colors duration-150",
                    active
                      ? "border-primary bg-primary-soft font-medium text-primary"
                      : "border-border text-text hover:border-primary",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {question.type === "rating" && (
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={question.title}>
            {Array.from(
              { length: question.max - question.min + 1 },
              (_, i) => question.min + i,
            ).map((n) => {
              const active = value === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange(n)}
                  aria-pressed={active}
                  className={[
                    "h-12 w-12 rounded-full border text-sm font-semibold transition-colors duration-150",
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-border text-text hover:border-primary",
                  ].join(" ")}
                >
                  {n}
                </button>
              );
            })}
          </div>
        )}

        {(question.type === "short-text" ||
          question.type === "email" ||
          question.type === "number" ||
          question.type === "date") && (
          <input
            type={
              question.type === "email"
                ? "email"
                : question.type === "number"
                  ? "number"
                  : question.type === "date"
                    ? "date"
                    : "text"
            }
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="h-11 w-full rounded-lg border border-border px-3 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            placeholder="พิมพ์คำตอบของคุณ"
          />
        )}

        {question.type === "long-text" && (
          <textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full rounded-lg border border-border px-3 py-2 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            placeholder="พิมพ์คำตอบของคุณ"
          />
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
