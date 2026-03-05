export interface ParentBrief {
  first_name: string;
  last_name: string;
  email: string;
}

export type EnrollmentStatus = 'ACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'EXPELLED' | 'DROPPED_OUT';

export interface Student {
  id: string;
  user_id: string;
  class_id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  email: string;
  class_name: string;
  enrollment_status: EnrollmentStatus;
  parents: ParentBrief[];
}

export interface PaginatedStudents {
  total: number;
  items: Student[];
}