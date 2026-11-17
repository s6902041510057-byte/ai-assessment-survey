import * as XLSX from "xlsx";

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

export function timestampName(prefix = "survey", ext = "csv") {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  return `${prefix}-${stamp}.${ext}`;
}

// Build a flat CSV for admin export (one row per respondent)
export function responsesToCSV(
  responses: Array<{
    submitted_at: string;
    answers: Record<string, string | string[] | number>;
  }>,
  questionTitles: Record<string, string>,
): string {
  const questionIds = Object.keys(questionTitles);
  // ใช้คอลัมน์ "submitted_at" + คอลัมน์คำถามเท่านั้น (ไม่ซ้ำข้อมูล)
  const header = ["submitted_at", ...questionIds.map((id) => questionTitles[id])];

  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [header.map(escape).join(",")];

  for (const r of responses) {
    const row = [
      r.submitted_at,
      ...questionIds.map((id) => {
        // สำหรับข้อ "AI ที่คุณเคยใช้" ให้แปลง "other" เป็นข้อความที่พิมพ์
        if (id === "q4_ai_tools") {
          const val = r.answers?.[id];
          if (Array.isArray(val)) {
            return (val as string[])
              .map((t) =>
                t === "other"
                  ? ((r.answers?.q4_ai_tools_other as string) || "อื่น ๆ")
                  : t,
              )
              .join("; ");
          }
        }
        return formatAnswer(r.answers?.[id]);
      }),
    ];
    lines.push(row.map(escape).join(","));
  }
  return "\uFEFF" + lines.join("\r\n");
}

// ---------- Excel (.xlsx) export แยก sheet ตามห้อง ----------

export interface XlsxResponse {
  submitted_at: string;
  grade_level: string;
  used_ai: string;
  ai_tools: string[];
  answers: Record<string, string | string[] | number>;
}

function buildXlsxRows(
  responses: XlsxResponse[],
  questionTitles: Record<string, string>,
): Record<string, string>[] {
  const questionIds = Object.keys(questionTitles);
  return responses.map((r) => {
    const row: Record<string, string> = {
      submitted_at: r.submitted_at,
    };
    for (const id of questionIds) {
      let val = formatAnswer(r.answers?.[id]);
      // สำหรับข้อ "AI ที่คุณเคยใช้" ให้แปลง "other" เป็นข้อความที่พิมพ์
      if (id === "q4_ai_tools") {
        const v = r.answers?.[id];
        if (Array.isArray(v)) {
          val = (v as string[])
            .map((t) =>
              t === "other"
                ? ((r.answers?.q4_ai_tools_other as string) || "อื่น ๆ")
                : t,
            )
            .join("; ");
        }
      }
      row[questionTitles[id]] = val;
    }
    return row;
  });
}

export function responsesToXLSX(
  responses: XlsxResponse[],
  questionTitles: Record<string, string>,
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const byRoom = new Map<string, XlsxResponse[]>();
  for (const r of responses) {
    const room = r.grade_level || "(ไม่ระบุ)";
    if (!byRoom.has(room)) byRoom.set(room, []);
    byRoom.get(room)!.push(r);
  }
  const rooms = [...byRoom.keys()].sort();

  const wsAll = XLSX.utils.json_to_sheet(buildXlsxRows(responses, questionTitles));
  XLSX.utils.book_append_sheet(wb, wsAll, "ทั้งหมด");

  for (const room of rooms) {
    const rows = buildXlsxRows(byRoom.get(room)!, questionTitles);
    const ws = XLSX.utils.json_to_sheet(rows);
    const base =
      room.replace(/[\\/?*[\]:]/g, "_").slice(0, 31) || "sheet";
    const existing = wb.SheetNames.filter((n) => n === base).length;
    const sheetName = existing ? `${base}_${existing}`.slice(0, 31) : base;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  return wb;
}

export function downloadXLSX(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}
