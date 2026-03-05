// src/types/teacher.ts
import type { Subject } from './subject';

export interface UserBrief {
  first_name: string;
  last_name: string;
  email: string;
}

export interface Teacher {
  id: string;
  employee_number: string;
  qualification: string | null;
  specialization: string | null;
  school_id: string;
  user: UserBrief; 
  assigned_subjects: Subject[]; 
}

export interface PaginatedTeachers {
  total: number;
  items: Teacher[];
}