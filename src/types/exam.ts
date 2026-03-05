// src/types/exam.ts
export interface Exam {
  id: string;
  name: string;
  year: number;
  term: number;
  subject_id: string;
  school_id: string;
}

export interface StudentMarkSheetDetail {
  student_id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  score: number | null;
  teacher_comment: string | null;
}