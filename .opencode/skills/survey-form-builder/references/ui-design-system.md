# ระบบออกแบบ UI (Design System)

เป้าหมาย: แบบสอบถามที่ดูมืออาชีพ อ่านง่าย และใช้งานได้ดีทั้งเดสก์ท็อป แท็บเล็ต มือถือ

## 1. Design Tokens

กำหนดเป็น CSS custom properties ใน `src/app/globals.css` แล้ว map เข้า Tailwind (v4 `@theme`) เพื่อให้ใช้ class ได้ทั้งหมด

### สี (Color)

| Token | ค่า | ใช้กับ |
| --- | --- | --- |
| `--color-primary` | `#4F46E5` (indigo-600) | ปุ่มหลัก, ตัวเลือกที่ถูกเลือก, focus ring |
| `--color-primary-hover` | `#4338CA` | hover ปุ่มหลัก |
| `--color-primary-soft` | `#EEF2FF` | พื้นหลังตัวเลือกที่ active, highlight |
| `--color-surface` | `#FFFFFF` | การ์ด |
| `--color-bg` | `#F8FAFC` (slate-50) | พื้นหลังหน้า |
| `--color-text` | `#0F172A` (slate-900) | ตัวหนังสือหลัก |
| `--color-muted` | `#64748B` (slate-500) | คำอธิบายรอง, helper text |
| `--color-border` | `#E2E8F0` (slate-200) | เส้นขอบ |
| `--color-success` | `#16A34A` | ส่งสำเร็จ |
| `--color-error` | `#DC2626` | ข้อผิดพลาด |
| `--color-warning` | `#D97706` | แจ้งเตือน |

ข้อกำหนด: ตัวหนังสือบนพื้นขาว/สลัตต้องผ่าน WCAG AA (อย่างน้อย 4.5:1) ทุกคู่สี

### ตัวหนังสือ (Typography)

- ภาษาไทย: `Noto Sans Thai` (Google Fonts) — อ่านง่ายในทุกขนาด
- ตัวเลข/ภาษาอังกฤษ: `Inter`
- โหลดด้วย `next/font/google` และตั้ง CSS variable `--font-thai`, `--font-eng`
- สเกล: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 px
- น้ำหนัก: 400 (body), 500 (label), 600 (หัวข้อ), 700 (ตัวเลขใหญ่/สรุป)

### ระยะห่าง (Spacing)

ใช้ grid 8px: 4, 8, 12, 16, 24, 32, 48, 64

### มุม/เงา/ขอบ

- radius: 8px (input), 12px (การ์ด), 16px (กล่องใหญ่), 999px (ปุ่ม pill)
- shadow: `0 1px 2px rgba(15,23,42,.06)` สำหรับการ์ด, `0 8px 24px rgba(15,23,42,.12)` สำหรับการ์ดที่ active
- border 1px `--color-border`

## 2. เลย์เอาต์หน้าแบบสอบถาม

- พื้นหลัง `--color-bg` ทั้งหน้า เน้นความสะอาด
- เนื้อหาอยู่กลางจอ `max-w-[680px] mx-auto px-4 py-8 sm:py-12`
- การ์ดคำถามกว้างเต็มคอนเทนเนอร์ มี padding 24–32px และระยะห่างระหว่างคำถาม 16–24px
- มือถือ: padding 16px, ขนาดตัวหนังสือ body 16px (ป้องกัน zoom บน iOS)

## 3. คอมโพเนนต์หลัก

### Progress bar

- แถบสี `--color-primary` บนแถบ `--color-border` สูง 6px มุมมน
- ข้อความ "ข้อที่ X / Y" ข้างบนด้านขวา, ฟอนต์ 14px สี `--color-muted`
- เปลี่ยนความกว้างด้วย `transition-[width] duration-300`

### Question card

- การ์ดขาว มุม 12px เงาเบา
- หัวคำถาม 18–20px น้ำหนัก 600 สี `--color-text`
- คำถามบังคับ: มี `*` สี `--color-error` และ helper text "จำเป็นต้องตอบ" จางๆ
- helper text 14px สี `--color-muted`

### ตัวเลือก (Radio / Checkbox)

- รูปแบบ "การ์ดตัวเลือก": กรอบ 1px `--color-border` มุม 8px padding 12–16px
- hover: border เปลี่ยนเป็น `--color-primary`, พื้นหลัง `--color-primary-soft` เล็กน้อย
- เลือกแล้ว: border 2px `--color-primary`, พื้นหลัง `--color-primary-soft`
- transition 150ms

### Input / Textarea

- ความสูง 44px (touch-friendly), ขอบ 1px `--color-border`, มุม 8px
- focus: border `--color-primary` + ring 3px `rgba(79,70,229,.15)`
- error: border `--color-error` + ข้อความ error 14px สีเดียวกัน

### ปุ่ม

- ปุ่มหลัก: พื้น `--color-primary` ตัวหนังสือขาว ความสูง 48px มุม 12px น้ำหนัก 600
- hover: `--color-primary-hover`, active: ย่อเล็กน้อย `scale-[.98]`
- disabled: ความทึบ 50%, cursor not-allowed
- ปุ่มรอง: พื้นขาว ขอบ `--color-border`

### Rating scale

- ปุ่มตัวเลข 1–5 เป็นวงกลม 48px
- ตอน hover/active เปลี่ยนสีเป็น primary

## 4. การเคลื่อนไหว (Motion)

- ระยะเวลา 150–200ms, easing `ease-out`
- เปลี่ยนหน้าระหว่างคำถาม: fade + เลื่อนขึ้น 8px (200ms)
- เคารพ `prefers-reduced-motion: reduce` ให้ยุบเป็น fade หรือไม่มีแอนิเมชัน

## 5. สถานะอื่น

- กำลังโหลด: skeleton สี `--color-border` pulse
- ส่งสำเร็จ: ไอคอนเช็คกลมสี `--color-success` + หัวข้อ "ส่งคำตอบเรียบร้อยแล้ว"
- ข้อผิดพลาด: ข้อความสี `--color-error` พร้อมปุ่มลองใหม่
- คำตอบว่าง: ถ้าไม่บังคับให้ข้ามได้ ห้ามบล็อก

## 6. การเข้าถึง (Accessibility)

- ทุก input มี `<label>` ที่ผูกด้วย `htmlFor` / `id`
- กลุ่มตัวเลือกใช้ `<fieldset>` + `<legend>`
- รักษา focus order: header → คำถาม → ตัวเลือก → ปุ่ม
- focus ring ต้องมองเห็นชัดเสมอ (ห้าม `outline-none` โดยไม่มีทดแทน)
- รองรับ keyboard 100%: ลูกศรเลือก radio, tab เลื่อนไปตัวเลือกถัดไป
- ตัวหนังสืออย่างน้อย 16px ใน input (iOS)

## 7. Tailwind v4 ตัวอย่าง setup

```css
@import "tailwindcss";

@theme {
  --color-primary: #4F46E5;
  --color-primary-hover: #4338CA;
  --color-primary-soft: #EEF2FF;
  --color-surface: #FFFFFF;
  --color-bg: #F8FAFC;
  --color-text: #0F172A;
  --color-muted: #64748B;
  --color-border: #E2E8F0;
  --color-success: #16A34A;
  --color-error: #DC2626;
  --color-warning: #D97706;
}
```

ถ้าใช้ Tailwind v3 ให้กำหนดใน `tailwind.config.ts` ส่วน `theme.extend.colors` แทน โดยเก็บค่าสีเดียวกัน
