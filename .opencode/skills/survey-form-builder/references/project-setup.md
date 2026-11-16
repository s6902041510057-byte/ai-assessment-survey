# การวางโครงโปรเจกต์ (Project Setup)

## ข้อกำหนดเบื้องต้น

| เครื่องมือ | เวอร์ชันขั้นต่ำ | หากยังไม่มี |
| --- | --- | --- |
| Node.js | LTS (20+) | https://nodejs.org |
| pnpm หรือ npm | pnpm 9+ / npm 10+ | `npm i -g pnpm` |
| Git | 2.40+ | https://git-scm.com |
| GitHub account | — | https://github.com |
| Vercel account | — | https://vercel.com (login ด้วย GitHub) |

ตรวจสอบก่อนเริ่ม: `node -v`, `pnpm -v`, `git --version`

## สร้างโปรเจกต์

แนะนำ pnpm + Next.js App Router:

```bash
pnpm create next-app@latest assessment-form \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

ถ้าคำสั่งไม่มี interactive prompt ให้ใช้ `pnpm dlx create-next-app@latest ...` แทน

## โครงสร้างโฟลเดอร์

```text
assessment-form/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # ธีม, font, metadata
│   │   ├── page.tsx            # หน้าแบบสอบถาม
│   │   ├── globals.css         # design tokens + Tailwind
│   │   └── result/
│   │       └── page.tsx        # หน้าสรุปผล + ส่งออก CSV
│   ├── components/
│   │   ├── form/               # QuestionCard, OptionGroup, TextInput, ...
│   │   ├── ui/                 # Button, Progress, Card
│   │   └── layout/             # SurveyShell, Header
│   ├── data/
│   │   └── survey.ts           # schema คำถาม (ตาม templates/survey-schema.ts)
│   ├── lib/
│   │   ├── types.ts            # type ที่ใช้ร่วมกัน
│   │   ├── validation.ts       # zod schema
│   │   ├── storage.ts          # localStorage draft
│   │   └── export.ts           # CSV/JSON (ตาม templates/csv-export.ts)
│   └── hooks/
│       └── useSurvey.ts        # state หลักของแบบสอบถาม
├── public/
├── .env.local.example          # ตัวแปรที่ต้องใช้ (ถ้ามี)
├── .gitignore
├── next.config.ts
├── package.json
└── README.md
```

## กฎการตั้งชื่อ (Naming Conventions)

- ไฟล์ component: `PascalCase.tsx` เช่น `QuestionCard.tsx`
- ไฟล์อื่น: `kebab-case.ts` เช่น `csv-export.ts`
- ตัวแปร/ฟังก์ชัน: `camelCase`, ค่าคงที่: `UPPER_SNAKE_CASE`
- type/interface: `PascalCase` ไม่ใช้นำหน้า `I`
- ชื่อ hook: ขึ้นต้นด้วย `use`
- event handler: `handleXxx` เช่น `handleSubmit`, `handleOptionChange`

## การตั้งค่าเริ่มต้น

- `tsconfig.json`: `"strict": true` (create-next-app ตั้งไว้แล้ว)
- path alias `@/*` → `src/*` (ตั้งไว้แล้ว)
- ติดตั้งเพิ่มตามความจำเป็น: `react-hook-form`, `zod`, `@hookform/resolvers`

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

- font: ใช้ `next/font/google` โหลด `Noto_Sans_Thai` + `Inter` (ดู `references/ui-design-system.md`)

## Git

- สร้าง repo บน GitHub ก่อน แล้ว `git init`, `git remote add origin <url>`
- `.gitignore` ต้องมี: `node_modules`, `.next`, `.env*`, `.DS_Store`, `*.log`
- commit ใช้ Conventional Commits: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`

## ตรวจสอบว่าพร้อม

```bash
pnpm dev   # เปิด http://localhost:3000 ได้ ไม่มี error ตอน build
```

ก่อนไปขั้นถัดไป ให้ build ผ่านแน่นอน: `pnpm build`
