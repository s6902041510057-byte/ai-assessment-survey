# สถาปัตยกรรมฟอร์ม (Form Architecture)

## แนวคิด

- ข้อมูลคำถาม (schema) อยู่ใน `src/data/survey.ts` แยกจาก UI เพื่อให้แก้คำถามง่าย
- state ของคำตอบอยู่ที่ hook เดียว `useSurvey` (หรือ React Hook Form)
- validation ใช้ zod ที่แปลงจาก schema คำถามอัตโนมัติ

## โมเดลข้อมูล

ใช้ type จาก `templates/survey-schema.ts`:

```ts
type QuestionType =
  | "short-text" | "long-text" | "email" | "number" | "date"
  | "single-choice" | "multiple-choice" | "dropdown"
  | "rating" | "scale" | "file";

interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
}

interface ChoiceQuestion extends BaseQuestion {
  type: "single-choice" | "multiple-choice" | "dropdown";
  options: { value: string; label: string }[];
}

interface RatingQuestion extends BaseQuestion {
  type: "rating" | "scale";
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}

type Question = BaseQuestion | ChoiceQuestion | RatingQuestion;
```

## การจัดการ state

แนะนำ React Hook Form + zod:

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

- ใช้ `useForm<SurveyAnswers>({ resolver: zodResolver(surveySchema) })`
- คำถาม multiple-choice เก็บเป็น `string[]`
- คำถามที่ข้าม (skip logic) ให้ `watch` ค่าแล้ว conditional render

### ตัวเลือกแบบไม่ใช้ library (โปรเจกต์เล็ก)

ใช้ `useState<Record<string, unknown>>` + ฟังก์ชัน validate เองก็เพียงพอ แต่ต้องทำ validation ครบทุกคำถามเอง

## ขั้นตอนการทำงาน (multi-step vs single-page)

- คำถาม ≤ 5 ข้อ แนะนำหน้าเดียว (single page) ดูง่าย ส่งเร็ว
- คำถาม > 5 ข้อ แนะนำทีละข้อ หรือทีละหมวด พร้อม progress bar
- มีการเปลี่ยนหน้า ให้บันทึก draft ลง localStorage อัตโนมัติทุกครั้งที่ค่าเปลี่ยน

## Conditional / Skip Logic

- ใน schema เพิ่ม `showIf?: { questionId: string; equals: string | string[] }`
- คำถามที่ถูกซ่อนไม่ต้อง validation

## Validation

- ข้อความ error เป็นภาษาไทย กระชับ บอกวิธีแก้ เช่น "กรุณากรอกอีเมลให้ถูกต้อง เช่น name@example.com"
- แสดง error หลัง blur หรือตอน submit เท่านั้น ไม่แสดงตอนพิมพ์
- คำถามบังคับไม่ผ่าน: scroll ไปที่คำถามแรกที่ผิด + focus

## หน้าสรุปผล

- แสดงตารางสรุปคำตอบก่อนส่งจริง (ถ้าต้องการให้ผู้ตอบตรวจสอบ)
- ปุ่ม "ส่งคำตอบ" และปุ่ม "ดาวน์โหลด CSV" พร้อมกัน
- หลังส่ง: ล้าง localStorage, แสดงหน้าสำเร็จ
