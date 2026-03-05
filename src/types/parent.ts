export interface LinkedChild {
  student_id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_name: string;
}

export interface Parent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  children: LinkedChild[];
}

export interface ParentStudentLink {
  id: string;
  parent_id: string;
  student_id: string;
  school_id: string;
}