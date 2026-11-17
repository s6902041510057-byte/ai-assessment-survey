export type QuestionType =
  | "short-text"
  | "dropdown"
  | "grade-room"
  | "single-choice"
  | "multiple-choice"
  | "scale"
  | "long-text";

interface CommonQuestion {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  section: string;
}

export interface ShortTextQuestion extends CommonQuestion {
  type: "short-text";
}

export interface DropdownQuestion extends CommonQuestion {
  type: "dropdown";
  options: { value: string; label: string }[];
}

export interface GradeRoomQuestion extends CommonQuestion {
  type: "grade-room";
  options: { value: string; label: string }[];
}

export interface SingleChoiceQuestion extends CommonQuestion {
  type: "single-choice";
  options: { value: string; label: string }[];
}

export interface MultipleChoiceQuestion extends CommonQuestion {
  type: "multiple-choice";
  options: { value: string; label: string }[];
}

export interface ScaleQuestion extends CommonQuestion {
  type: "scale";
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  // คำอธิบายคะแนน 1..5 (index 0 = คะแนน 1)
  labels: string[];
  dimension?: string;
}

export interface LongTextQuestion extends CommonQuestion {
  type: "long-text";
}

export type Question =
  | ShortTextQuestion
  | DropdownQuestion
  | GradeRoomQuestion
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | ScaleQuestion
  | LongTextQuestion;

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
}

export interface Survey {
  id: string;
  title: string;
  intro: string;
  sections: SurveySection[];
  questions: Question[];
}

export type Answers = Record<string, string | string[] | number>;

export interface ResponseRecord {
  id?: string;
  submitted_at?: string;
  grade_level: string;
  room?: string;
  used_ai: string;
  ai_tools: string[];
  answers: Answers;
}
