# การ Deploy (GitHub + Vercel)

## 1. ขึ้น GitHub

```bash
git init
git add .
git commit -m "feat: initial survey app"
gh repo create assessment-form --source=. --public --push
```

หรือสร้าง repo จากเว็บก่อนแล้ว:

```bash
git remote add origin <url>
git push -u origin main
```

ตรวจ `.gitignore` ให้ครบ:

```gitignore
node_modules
.next
.env
.env*.local
.DS_Store
*.log
```

ใช้ Conventional Commits ตลอด: `feat: add rating question`, `fix: validation message`

## 2. ขึ้น Vercel

1. ไป https://vercel.com → Add New Project
2. Import repo `assessment-form`
3. Framework Preset: **Next.js** (ตรงจากการตรวจจับอัตโนมัติ)
4. Root Directory: ค่าเริ่มต้น (ถ้าโปรเจกต์ไม่ได้อยู่ใน subfolder)
5. Build Command / Output: ค่าเริ่มต้นของ Next.js
6. Environment Variables: เพิ่มเฉพาะที่จำเป็น (ถ้ามี) — ห้ามใส่ secret ลงในโค้ด
7. Deploy

## 3. หลัง deploy

- เปิด URL ที่ได้ในเบราว์เซอร์จริง ทดสอบส่งแบบสอบถามจริง
- ตรวจว่า URL เป็น https, โหลดเร็ว, responsive บนมือถือ
- ตั้ง env var ที่ต้องการเข้าถึงฝั่ง client ด้วย prefix `NEXT_PUBLIC_`
- ถ้าต้องการ custom domain: Vercel → Settings → Domains

## 4. อัปเดตครั้งถัดไป

push ไปที่ `main` แล้ว Vercel deploy อัตโนมัติ

```bash
git add .
git commit -m "feat: add CSV export"
git push
```

ทุกครั้งที่ deploy ให้รัน checklist ใน `references/quality-checklist.md` อีกครั้ง
