// src/types/subject.ts
import type { AcademicLevel } from './class';

export interface SubjectTeacherBrief {
  id: string;
  first_name: string;
  last_name: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  level: AcademicLevel;
  is_core: boolean;
  school_id: string;
  assigned_teachers: SubjectTeacherBrief[];
}

export interface TeacherSubjectDetail {
  id: string;
  teacher_id: string;
  subject: Subject;
}