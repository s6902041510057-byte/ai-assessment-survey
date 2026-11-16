---
name: สร้างเว็บแบบสอบถาม
description: พัฒนาเว็บแบบสอบถาม/แบบฟอร์มออนไลน์ด้วย Next.js + Tailwind CSS + TypeScript ออกแบบ UI สวยงาม เก็บโค้ดบน GitHub deploy บน Vercel และส่งออกคำตอบเป็น CSV — ใช้เมื่อผู้ใช้พูดถึง แบบสอบถาม, แบบฟอร์ม, survey, questionnaire, assessment form, evaluation form
---

# สร้างเว็บแบบสอบถาม (Survey / Assessment Form Builder)

ใช้สำหรับพัฒนาเว็บแบบสอบถามออนไลน์ครบวงจร ตั้งแต่วางโครง ออกแบบ UI พัฒนาฟอร์ม ทดสอบ ไปจนถึง deploy บน Vercel และเก็บโค้ดบน GitHub โดยข้อมูลคำตอบเก็บในเบราว์เซอร์ของผู้ตอบและส่งออกเป็น CSV (ไม่มี backend)

## หลักการตามต้นหลัง

1. **เข้าใจก่อนลงมือ** — ถามให้ชัดเจนก่อนสร้าง: จำนวน/ประเภทคำถาม, กลุ่มเป้าหมาย, ภาษา, ชื่อแบบสอบถาม แล้วสรุป requirement ให้ผู้ใช้ยืนยันก่อนเริ่ม
2. **รอบคอบ** — ใช้ checklist ใน `references/quality-checklist.md` เป็นตัวตรวจทุกขั้น ห้ามข้ามขั้น
3. **โค้ดมืออาชีพ** — TypeScript strict, แยก data / UI / logic ชัดเจน, ตั้งชื่อให้สื่อความหมาย, validation ครบทุก input
4. **กราฟิกสวยงาม** — ยึด design system ใน `references/ui-design-system.md` เป็นต้นแบบเสมอ
5. **ข้อมูลไม่หลุด** — เก็บ localStorage เป็น draft + ส่งออก CSV/JSON ตาม `references/data-export.md`

## ขั้นตอนการทำงาน

| # | ขั้นตอน | ไฟล์อ้างอิง |
| - | ------- | ----------- |
| 1 | วิเคราะห์ความต้องการและสรุป requirement | — (ถามผู้ใช้) |
| 2 | วางโครงโปรเจกต์ Next.js + Tailwind + TS | `references/project-setup.md` |
| 3 | ออกแบบ UI ตาม design system | `references/ui-design-system.md` |
| 4 | พัฒนาฟอร์มและ validation | `references/form-architecture.md`, `templates/survey-schema.ts`, `templates/question-card.tsx` |
| 5 | เพิ่มการส่งออกข้อมูล | `references/data-export.md`, `templates/csv-export.ts` |
| 6 | ตรวจคุณภาพครบทุกข้อ | `references/quality-checklist.md` |
| 7 | ขึ้น GitHub และ deploy Vercel | `references/deployment.md` |

## กฎการใช้ไฟล์ template

- ไฟล์ใน `templates/` เป็นโค้ดต้นแบบ — **คัดลอก** ไปปรับในโปรเจกต์ ห้ามแก้ไขใน templates โดยตรง
- ไฟล์ใน `references/` เป็นคู่มือ — อ่านเมื่อต้องการรายละเอียดขั้นตอนนั้น

## เมื่อไหร่ควรถามผู้ใช้

- คำถามหรือประเภทคำถามไม่ชัดเจน
- ต้องเก็บข้อมูลอ่อนไหว (บัตรประชาชน, สุขภาพ, การเงิน)
- ต้องการ custom domain, หลายภาษา, หรือฟีเจอร์พิเศษนอกเหนือจาก scope ของ skill
