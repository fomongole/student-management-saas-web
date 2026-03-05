// src/types/school.ts
import type { AcademicLevel } from './class';

export interface SchoolLevel {
  level: AcademicLevel;
}

export interface School {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  academic_levels: SchoolLevel[];
  student_count?: number;
}

export interface PlatformMetrics {
  total_schools: number;
  active_schools: number;
  total_users: number;
}