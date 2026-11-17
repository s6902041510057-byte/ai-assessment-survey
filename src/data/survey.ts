import type { Survey, Question, ScaleQuestion } from "@/lib/types";

export const SURVEY_ID = "ai-usage-behavior";

export const survey: Survey = {
  id: SURVEY_ID,
  title: "แบบประเมินพฤติกรรมการใช้ปัญญาประดิษฐ์ (AI) เพื่อส่งเสริมการเรียนรู้ของนักเรียน",
  intro:
    "แบบประเมินฉบับนี้จัดทำขึ้นเพื่อศึกษาพฤติกรรมและความคิดเห็นของนักเรียนเกี่ยวกับการใช้ปัญญาประดิษฐ์ (AI) ในการเรียนและการทำงาน ข้อมูลที่ได้จะนำไปใช้เพื่อศึกษาและพัฒนาการจัดการเรียนรู้ให้เหมาะสมกับนักเรียน\n\nโปรดตอบตามพฤติกรรมและความคิดเห็นที่เกิดขึ้นจริง ไม่มีคำตอบที่ถูกหรือผิด และไม่มีผลต่อคะแนนการเรียนของนักเรียน",
  sections: [
    { id: "general", title: "ตอนที่ 1 ข้อมูลทั่วไป" },
    { id: "behavior", title: "ตอนที่ 2 แบบประเมินพฤติกรรมการใช้ AI" },
    { id: "attitude", title: "ตอนที่ 3 ทัศนคติและความคิดเห็นเกี่ยวกับการใช้ AI" },
    { id: "open", title: "ตอนที่ 4 คำถามปลายเปิด" },
    { id: "feelings", title: "ความรู้สึกต่อการสอนของนักศึกษาฝึกสอน" },
  ],
  questions: [
    // ---- ตอนที่ 1 ข้อมูลทั่วไป ----
    {
      id: "q1_grade",
      type: "grade-room",
      title: "ระดับชั้น",
      required: true,
      section: "general",
      options: [
        { value: "1ชทส1", label: "1ชทส1" },
        { value: "1ชทส2", label: "1ชทส2" },
        { value: "1ชทส3", label: "1ชทส3" },
        { value: "2ชทส1", label: "2ชทส1" },
        { value: "2ชทส2", label: "2ชทส2" },
        { value: "2ชทส3", label: "2ชทส3" },
        { value: "2ชทส4", label: "2ชทส4" },
        { value: "2ชทส5", label: "2ชทส5" },
        { value: "3ชทส1", label: "3ชทส1" },
        { value: "3ชทส2", label: "3ชทส2" },
        { value: "3ชทส3", label: "3ชทส3" },
        { value: "3ชทส4", label: "3ชทส4" },
        { value: "3ชทส5", label: "3ชทส5" },
        { value: "3ชทส6", label: "3ชทส6" },
        { value: "1สทส1", label: "1สทส1" },
        { value: "1สทส2", label: "1สทส2" },
        { value: "1สทส3", label: "1สทส3" },
        { value: "2สทส1", label: "2สทส1" },
        { value: "2สทส2", label: "2สทส2" },
        { value: "2สทส3", label: "2สทส3" },
      ],
    },
    {
      id: "q3_used_ai",
      type: "single-choice",
      title: "คุณเคยใช้ AI ช่วยในการเรียนหรือทำงานหรือไม่",
      required: true,
      section: "general",
      options: [
        { value: "yes", label: "เคย" },
        { value: "no", label: "ไม่เคย" },
      ],
    },
    {
      id: "q4_ai_tools",
      type: "multiple-choice",
      title: "AI ที่คุณเคยใช้ (เลือกได้มากกว่า 1 ข้อ)",
      required: true,
      section: "general",
      options: [
        { value: "chatgpt", label: "ChatGPT" },
        { value: "gemini", label: "Gemini" },
        { value: "copilot", label: "Microsoft Copilot" },
        { value: "google-ai", label: "Google AI" },
        { value: "other", label: "อื่น ๆ" },
      ],
    },

    // ---- ตอนที่ 2 แบบประเมินพฤติกรรม ----
    {
      id: "q5",
      type: "scale",
      title: "ใช้ AI ช่วยในการทำงานหรือการบ้านที่ได้รับมอบหมาย",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 1 พฤติกรรมและความถี่ในการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q6",
      type: "scale",
      title: "ใช้ AI เป็นประจำในการเรียนหรือค้นหาความรู้",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 1 พฤติกรรมและความถี่ในการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q7",
      type: "scale",
      title: "เลือกใช้ AI แม้ว่างานที่ได้รับมอบหมายจะเป็นงานที่ฉันสามารถทำเองได้",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 1 พฤติกรรมและความถี่ในการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q8",
      type: "scale",
      title: "ใช้ AI เพื่ออธิบายเนื้อหาที่ฉันไม่เข้าใจ",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 2 วัตถุประสงค์ในการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q9",
      type: "scale",
      title: "ใช้ AI เพื่อค้นหาแนวคิดหรือแนวทางในการทำงาน",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 2 วัตถุประสงค์ในการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q10",
      type: "scale",
      title: "ใช้ AI เพื่อช่วยตรวจสอบความถูกต้องของคำตอบ",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 2 วัตถุประสงค์ในการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q11",
      type: "scale",
      title: "ใช้ AI เพื่อสร้างคำตอบสำหรับนำไปส่งครู",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 2 วัตถุประสงค์ในการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q12",
      type: "scale",
      title: "ก่อนใช้ AI พยายามคิดหาคำตอบด้วยตนเองก่อน",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 3 กระบวนการคิดก่อนและระหว่างการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q13",
      type: "scale",
      title: "พยายามทำความเข้าใจโจทย์ก่อนนำไปถาม AI",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 3 กระบวนการคิดก่อนและระหว่างการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q14",
      type: "scale",
      title: "ใช้ความคิดของตนเองร่วมกับคำแนะนำจาก AI",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 3 กระบวนการคิดก่อนและระหว่างการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q15",
      type: "scale",
      title: "นำคำตอบจาก AI มาปรับปรุงด้วยความคิดของตนเอง",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 3 กระบวนการคิดก่อนและระหว่างการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q16",
      type: "scale",
      title: "พยายามหาคำตอบด้วยตนเองเมื่อ AI ให้คำตอบที่ไม่ตรงกับความต้องการ",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 3 กระบวนการคิดก่อนและระหว่างการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q17",
      type: "scale",
      title: "ตรวจสอบความถูกต้องของข้อมูลที่ AI ให้มาก่อนนำไปใช้",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 4 การตรวจสอบและประเมินคำตอบจาก AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q18",
      type: "scale",
      title: "เปรียบเทียบคำตอบจาก AI กับแหล่งข้อมูลอื่น",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 4 การตรวจสอบและประเมินคำตอบจาก AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q19",
      type: "scale",
      title: "ไม่เชื่อคำตอบจาก AI ในทันทีโดยไม่ตรวจสอบ",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 4 การตรวจสอบและประเมินคำตอบจาก AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q20",
      type: "scale",
      title: "พิจารณาว่าคำตอบจาก AI มีความเหมาะสมกับงานที่ได้รับหรือไม่",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 4 การตรวจสอบและประเมินคำตอบจาก AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q21",
      type: "scale",
      title: "หลังจากใช้ AI เข้าใจเนื้อหาที่เรียนมากขึ้น",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 5 การเรียนรู้และความเข้าใจหลังจากใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q22",
      type: "scale",
      title: "สามารถอธิบายเนื้อหาที่ได้จาก AI ด้วยคำพูดของตนเอง",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 5 การเรียนรู้และความเข้าใจหลังจากใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q23",
      type: "scale",
      title: "สามารถนำความรู้ที่ได้จาก AI ไปประยุกต์ใช้กับงานอื่นได้",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 5 การเรียนรู้และความเข้าใจหลังจากใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q24",
      type: "scale",
      title: "สามารถทำโจทย์ลักษณะเดียวกันได้ด้วยตนเองหลังจากเรียนรู้ผ่าน AI",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 5 การเรียนรู้และความเข้าใจหลังจากใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q25",
      type: "scale",
      title: "รู้สึกว่าการทำงานโดยไม่มี AI เป็นเรื่องยาก",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 6 การพึ่งพา AI ในการทำงาน",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q26",
      type: "scale",
      title: "เมื่อได้รับมอบหมายงาน มักนึกถึงการใช้ AI เป็นสิ่งแรก",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 6 การพึ่งพา AI ในการทำงาน",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q27",
      type: "scale",
      title: "มักรอให้ AI คิดคำตอบให้ก่อนที่จะลงมือทำงาน",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 6 การพึ่งพา AI ในการทำงาน",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q28",
      type: "scale",
      title: "สามารถทำงานที่ได้รับมอบหมายได้ แม้จะไม่มี AI ช่วย",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 6 การพึ่งพา AI ในการทำงาน",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q29",
      type: "scale",
      title: "ไม่คัดลอกคำตอบจาก AI ทั้งหมดไปส่งโดยไม่ทำความเข้าใจ",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 7 จริยธรรมและความรับผิดชอบในการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q30",
      type: "scale",
      title: "นำข้อมูลจาก AI มาปรับปรุงให้เป็นผลงานของตนเอง",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 7 จริยธรรมและความรับผิดชอบในการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },
    {
      id: "q31",
      type: "scale",
      title: "ใช้ AI ตามข้อตกลงหรือกติกาที่ครูกำหนด",
      required: true,
      section: "behavior",
      dimension: "ด้านที่ 7 จริยธรรมและความรับผิดชอบในการใช้ AI",
      min: 1,
      max: 5,
      minLabel: "ไม่เคยเลย",
      maxLabel: "เป็นประจำทุกครั้ง",
      labels: ["ไม่เคยเลย", "นาน ๆ ครั้ง", "บางครั้ง", "บ่อยครั้ง", "เป็นประจำทุกครั้ง"],
    },

    // ---- ตอนที่ 3 ทัศนคติ ----
    {
      id: "q32",
      type: "scale",
      title: "คิดว่า AI เป็นเครื่องมือที่ช่วยส่งเสริมการเรียนรู้ของฉันได้",
      required: true,
      section: "attitude",
      min: 1,
      max: 5,
      minLabel: "ไม่เห็นด้วยอย่างยิ่ง",
      maxLabel: "เห็นด้วยอย่างยิ่ง",
      labels: ["ไม่เห็นด้วยอย่างยิ่ง", "ไม่เห็นด้วย", "ไม่แน่ใจ", "เห็นด้วย", "เห็นด้วยอย่างยิ่ง"],
    },
    {
      id: "q33",
      type: "scale",
      title: "คิดว่าการใช้ AI มากเกินไปอาจทำให้ฉันมีโอกาสฝึกคิดด้วยตนเองน้อยลง",
      required: true,
      section: "attitude",
      min: 1,
      max: 5,
      minLabel: "ไม่เห็นด้วยอย่างยิ่ง",
      maxLabel: "เห็นด้วยอย่างยิ่ง",
      labels: ["ไม่เห็นด้วยอย่างยิ่ง", "ไม่เห็นด้วย", "ไม่แน่ใจ", "เห็นด้วย", "เห็นด้วยอย่างยิ่ง"],
    },
    {
      id: "q34",
      type: "scale",
      title: "คิดว่าการใช้ AI ควรเป็นเครื่องมือช่วยในการเรียนรู้ ไม่ใช่การทำงานแทนตนเองทั้งหมด",
      required: true,
      section: "attitude",
      min: 1,
      max: 5,
      minLabel: "ไม่เห็นด้วยอย่างยิ่ง",
      maxLabel: "เห็นด้วยอย่างยิ่ง",
      labels: ["ไม่เห็นด้วยอย่างยิ่ง", "ไม่เห็นด้วย", "ไม่แน่ใจ", "เห็นด้วย", "เห็นด้วยอย่างยิ่ง"],
    },

    // ---- ตอนที่ 4 คำถามปลายเปิด ----
    {
      id: "q35",
      type: "long-text",
      title: "คุณคิดว่าการใช้ AI มีประโยชน์ต่อการเรียนของคุณอย่างไร?",
      required: true,
      section: "open",
    },
    {
      id: "q36",
      type: "long-text",
      title: "คุณคิดว่าการใช้ AI ส่งผลเสียต่อการเรียนของคุณอย่างไร?",
      required: true,
      section: "open",
    },
    {
      id: "q37",
      type: "long-text",
      title: "คุณคิดว่าตนเองใช้ AI มากเกินไปหรือไม่ เพราะเหตุใด?",
      required: true,
      section: "open",
    },
    {
      id: "q38",
      type: "long-text",
      title: "หากมีโอกาสปรับเปลี่ยนพฤติกรรมการใช้ AI คุณอยากปรับเปลี่ยนอย่างไร เพื่อให้เกิดการเรียนรู้ด้วยตนเองมากขึ้น?",
      required: true,
      section: "open",
    },
    {
      id: "q39",
      type: "long-text",
      title: "ความรู้สึกที่อยากจะบอกกับนักศึกษาสังเกตการสอน",
      description: "มีอะไรอยากจะบอกผมไหมครับ",
      required: false,
      section: "feelings",
    },
  ],
};

export const questions = survey.questions;
export const sections = survey.sections;

// Helper: group question ids by dimension (for admin charts)
export function dimensions(): string[] {
  const set = new Set<string>();
  for (const q of survey.questions) {
    if (q.type === "scale" && q.dimension) set.add(q.dimension);
  }
  return [...set];
}

export function questionsByDimension(dim: string): ScaleQuestion[] {
  return survey.questions.filter(
    (q): q is ScaleQuestion => q.type === "scale" && q.dimension === dim,
  );
}

// Build pages: one dimension per page for behavior section; other sections as one page each
export interface SurveyPage {
  id: string;
  title: string;
  subtitle?: string;
  questions: Question[];
}

export function buildPages(): SurveyPage[] {
  const pages: SurveyPage[] = [];

  // ตอนที่ 1 ข้อมูลทั่วไป
  const generalQs = survey.questions.filter((q) => q.section === "general");
  pages.push({
    id: "general",
    title: "ตอนที่ 1 ข้อมูลทั่วไป",
    questions: generalQs,
  });

  // ตอนที่ 2: one page per dimension
  const dims = dimensions();
  for (const dim of dims) {
    pages.push({
      id: dim,
      title: dim,
      subtitle:
        "คำชี้แจง: โปรดทำเครื่องหมาย ✓ ลงในช่องที่ตรงกับพฤติกรรมของตนเองมากที่สุด",
      questions: questionsByDimension(dim),
    });
  }

  // ตอนที่ 3 ทัศนคติ
  const attitudeQs = survey.questions.filter((q) => q.section === "attitude");
  pages.push({
    id: "attitude",
    title: "ตอนที่ 3 ทัศนคติและความคิดเห็นเกี่ยวกับการใช้ AI",
    subtitle: "โปรดเลือกระดับความคิดเห็นที่ตรงกับตนเองมากที่สุด",
    questions: attitudeQs,
  });

  // ตอนที่ 4 คำถามปลายเปิด
  const openQs = survey.questions.filter((q) => q.section === "open");
  pages.push({
    id: "open",
    title: "ตอนที่ 4 คำถามปลายเปิด",
    subtitle: "โปรดแสดงความคิดเห็นตามความเป็นจริง",
    questions: openQs,
  });

  // หน้าแสดงความรู้สึก (ไม่บังคับ)
  const feelingsQs = survey.questions.filter((q) => q.section === "feelings");
  pages.push({
    id: "feelings",
    title: "ความรู้สึกต่อการสอนของนักศึกษาฝึกสอน",
    subtitle: "ไม่บังคับ — คุณสามารถข้ามได้",
    questions: feelingsQs,
  });

  return pages;
}
