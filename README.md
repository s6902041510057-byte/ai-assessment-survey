# แบบประเมินพฤติกรรมการใช้ปัญญาประดิษฐ์ (AI)

เว็บแบบประเมินออนไลน์สำหรับนักเรียน ไม่ระบุตัวตัวตน พร้อมหน้า Admin สำหรับเจ้าของแบบประเมินเพื่อดูข้อมูล สร้างกราฟ และส่งออก CSV

## เทคโนโลยี

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres) สำหรับเก็บคำตอบ
- Recharts สำหรับกราฟ
- ฟอนต์ TH-Sarabun
- Deploy บน Vercel

## ติดตั้งและรัน

```bash
pnpm install
cp .env.local.example .env.local
# แก้ไข .env.local ให้ใส่ค่า Supabase จริง
pnpm dev
```

เปิด http://localhost:3000

> 💡 หรือดับเบิลคลิกไฟล์ `start.bat` แล้วเปิด http://localhost:3000

## ตั้งค่า Supabase

1. สร้างโปรเจกต์ที่ https://supabase.com
2. ไปที่ SQL Editor → New query → วางคำสั่งจาก `supabase/schema.sql` **ทีละ statement** (Supabase รันได้ครั้งละ 1 คำสั่ง) → Run
3. คัดลอก Project URL และ anon key, service_role key จาก Settings → API
4. ใส่ใน `.env.local`

## หน้า Admin

- URL: `/admin`
- รหัสผ่าน: ค่า `ADMIN_PASSWORD` ใน `.env.local` (ค่าเริ่มต้น 1234 — **ควรเปลี่ยนก่อนใช้งานจริง**)
- สามารถดูตารางข้อมูล, กราฟเปรียบเทียบตามระดับชั้น/ด้าน, รายละเอียดรายข้อ, คำถามปลายเปิด, ลบข้อมูล และดาวน์โหลด CSV ได้

## Deploy บน Vercel

1. Push โค้ดไป GitHub
2. Import repo ใน Vercel
3. เพิ่ม Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD` (ตั้งรหัสที่แข็งแรง)
4. Deploy

หลัง deploy ได้ URL จริง ให้สร้าง QR Code ชี้ไปที่ URL นั้น (เช่น https://www.qr-code-generator.com) แล้วพิมพ์แจกนักเรียน

## ปรับแต่งคำถาม

แก้ไขคำถามทั้งหมดใน `src/data/survey.ts` (คำถาม, ตัวเลือก, เกณฑ์คะแนน, ด้าน)

## โครงสร้าง

```
src/
├── app/
│   ├── page.tsx            # หน้า Welcome
│   ├── survey/page.tsx     # หน้าแบบประเมิน
│   ├── admin/page.tsx      # หน้า Admin
│   └── api/                # API routes
├── components/form/        # SurveyShell, QuestionCard
├── data/survey.ts          # คำถามทั้งหมด (37 ข้อ)
└── lib/                    # types, supabase, export
```
