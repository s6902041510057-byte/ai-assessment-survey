# การจัดการข้อมูลคำตอบ (Data & Export)

เนื่องจากไม่มี backend ข้อมูลคำตอบอยู่ในเบราว์เซอร์ของผู้ตอบเท่านั้น

## localStorage draft

- key: `assessment-form:draft:<surveyId>` (กันชนกับแบบสอบถามอื่น)
- เก็บค่าเป็น JSON `{ answers: Record<string, unknown>, updatedAt: number }`
- บันทึกอัตโนมัติด้วย `useEffect` (debounce 300ms)
- แสดงข้อความ "บันทึกคำตอบชั่วคราวแล้ว" เล็กๆ มุมขวาบน
- ถ้าผู้ตอบกลับมาคราวหลังเห็นคำตอบเดิม ให้มีปุ่ม "เริ่มใหม่"

## CSV Export (สำคัญ)

ใช้ `templates/csv-export.ts` ซึ่งจัดการ:

- BOM `\uFEFF` ขึ้นหน้าไฟล์ เพื่อให้ Excel อ่านภาษาไทยไม่เป็นสระควาย
- quote ทุกเซลล์ด้วย `"` และ escape `"` ภายในเป็น `""`
- คั่นด้วย comma, newline `\r\n`
- ชื่อไฟล์: `survey-<id>-<YYYYMMDD-HHmm>.csv`
- มี 2 คอลัมน์: `คำถาม`, `คำตอบ`

ตัวอย่างการใช้:

```ts
import { toCSV, downloadCSV } from "@/lib/export";

const rows = questions.map((q) => ({
  question: q.title,
  answer: formatAnswer(answers[q.id]),
}));
const csv = toCSV(rows);
downloadCSV(csv, timestampName("survey"));
```

## JSON Export

- ปุ่ม "คัดลอก JSON" ใช้ `navigator.clipboard.writeText(JSON.stringify(payload, null, 2))`
- payload ควรมี metadata: `surveyId`, `submittedAt` (ISO), `answers`

## พิมพ์ / PDF

- ปุ่ม "พิมพ์" เรียก `window.print()` พร้อม print stylesheet ที่ซ่อนปุ่มและเฉดสี

## ความเป็นส่วนตัว

- ห้ามเก็บข้อมูลที่อ่อนไหว (เลขบัตรประชาชน, ข้อมูลสุขภาพ) ถ้าไม่จำเป็น
- ระบุในหน้าแบบสอบถามว่าข้อมูลถูกเก็บในเบราว์เซอร์ของผู้ตอบ และจะถูกลบเมื่อส่งเสร็จ
- ให้ผู้ตอบกดล้างข้อมูลเองได้ผ่านปุ่ม "ล้างคำตอบทั้งหมด"
