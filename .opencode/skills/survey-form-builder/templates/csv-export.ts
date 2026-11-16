// คัดลอกไปที่ src/lib/export.ts
// รองรับภาษาไทยใน Excel ด้วย BOM และ escaping ที่ปลอดภัย

export type AnswerValue = string | string[] | number | null | undefined;

export function toCSV(
  rows: { question: string; answer: string }[],
  header = ["คำถาม", "คำตอบ"],
): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [header.map(escape).join(",")];
  for (const row of rows) {
    lines.push([row.question, row.answer].map(escape).join(","));
  }
  // BOM สำหรับ Excel ให้อ่าน UTF-8 ภาษาไทยได้ถูกต้อง
  return "\uFEFF" + lines.join("\r\n");
}

export function formatAnswer(value: AnswerValue): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join("; ");
  return String(value);
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function timestampName(prefix = "survey") {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  return `${prefix}-${stamp}.csv`;
}
