// src/types/attendance.ts
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface StudentAttendanceDetail {
  id: string;
  attendance_date: string; // ISO Date String
  status: AttendanceStatus;
  subject_id: string | null;
  remarks: string | null;
}

export interface ClassDailyAttendance {
  student_id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  status: AttendanceStatus | null; // null means not marked yet today
  remarks: string | null;
}