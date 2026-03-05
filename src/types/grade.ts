// src/types/grade.ts

export interface GradingScale {
  id: string;
  grade_symbol: string;
  min_score: number;
  max_score: number;
  label: string;
  points: number;
}

export interface SubjectResultDetail {
  subject_name: string;
  subject_code: string;
  score: number;
  grade: string;   // e.g. "D1", "B3"
  label: string;   // e.g. "Distinction", "Credit"
  points: number;
  comment: string | null;
}

/**
 * One named exam session within a term.
 * e.g. "Beginning of Term Test" or "End of Term Exam".
 */
export interface ExamSessionReport {
  session_name: string;
  results: SubjectResultDetail[];
  session_average: number;
  session_total_points: number;
}

/**
 * Full report card for a student for a given term.
 * Results are grouped by exam session so the UI can render
 * each session as a distinct, labelled section.
 */
export interface StudentReportCard {
  student_name: string;
  class_name: string;
  term: number;
  year: number;
  sessions: ExamSessionReport[];
  overall_average: number;
  overall_total_points: number;
}