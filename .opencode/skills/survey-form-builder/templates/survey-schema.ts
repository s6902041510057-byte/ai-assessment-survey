// ตัวอย่าง schema แบบสอบถาม + zod
// คัดลอกไปที่ src/data/survey.ts แล้วปรับตามความต้องการ

import { z } from "zod";

export const questionTypes = [
  "short-text",
  "long-text",
  "email",
  "number",
  "date",
  "single-choice",
  "multiple-choice",
  "dropdown",
  "rating",
  "scale",
] as const;

export type QuestionType = (typeof questionTypes)[number];

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  showIf?: { questionId: string; equals: string | string[] };
}

export interface ChoiceQuestion extends BaseQuestion {
  type: "single-choice" | "multiple-choice" | "dropdown";
  options: { value: string; label: string }[];
}

export interface RatingQuestion extends BaseQuestion {
  type: "rating" | "scale";
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}

export type Question = BaseQuestion | ChoiceQuestion | RatingQuestion;

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

// ---------- ตัวอย่างคำถาม ----------
export const sampleSurvey: Survey = {
  id: "employee-engagement",
  title: "แบบสอบถามความผูกพันของบุคลากร",
  description: "กรุณาตอบตามความเป็นจริง ข้อมูลถูกเก็บในเบราว์เซอร์ของท่าน",
  questions: [
    {
      id: "department",
      type: "single-choice",
      title: "ท่านสังกัดแผนกใด",
      required: true,
      options: [
        { value: "it", label: "เทคโนโลยีสารสนเทศ" },
        { value: "hr", label: "ทรัพยากรบุคคล" },
        { value: "finance", label: "การเงิน" },
        { value: "other", label: "อื่นๆ" },
      ],
    },
    {
      id: "satisfaction",
      type: "rating",
      title: "ระดับความพึงพอใจโดยรวม",
      required: true,
      min: 1,
      max: 5,
      minLabel: "น้อยที่สุด",
      maxLabel: "มากที่สุด",
    },
    {
      id: "improvements",
      type: "multiple-choice",
      title: "สิ่งที่ควรปรับปรุง",
      description: "เลือกได้มากกว่า 1 ข้อ",
      required: false,
      options: [
        { value: "communication", label: "การสื่อสารภายใน" },
        { value: "benefits", label: "สวัสดิการ" },
        { value: "tools", label: "เครื่องมือการทำงาน" },
      ],
    },
    {
      id: "comment",
      type: "long-text",
      title: "ข้อเสนอแนะเพิ่มเติม",
      description: "ไม่เกิน 500 ตัวอักษร",
      required: false,
    },
  ],
};

// ---------- สร้าง zod schema จาก questions ----------
export type SurveyAnswers = Record<string, string | string[] | number>;

export function buildZodSchema(survey: Survey) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const q of survey.questions) {
    let field: z.ZodTypeAny;
    switch (q.type) {
      case "multiple-choice":
        field = z.array(z.string());
        break;
      case "rating":
      case "scale":
        field = z.coerce.number().min(q.min).max(q.max);
        break;
      case "email":
        field = z.string().email("กรุณากรอกอีเมลให้ถูกต้อง");
        break;
      case "number":
        field = z.coerce.number();
        break;
      case "date":
        field = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "กรุณาเลือกวันที่");
        break;
      default:
        field = z.string();
    }
    if (q.required) {
      shape[q.id] = field;
      if (q.type === "short-text" || q.type === "long-text") {
        shape[q.id] = (field as z.ZodString).min(1, "จำเป็นต้องตอบคำถามนี้");
      }
    } else {
      shape[q.id] = field.optional();
    }
  }
  return z.object(shape);
}
