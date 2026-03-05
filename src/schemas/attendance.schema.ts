// src/schemas/attendance.schema.ts
import * as z from 'zod';

export const studentAttendanceRecordSchema = z.object({
  student_id: z.string().uuid(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  remarks: z.string().optional().nullable(),
});

export const bulkAttendanceSubmitSchema = z.object({
  class_id: z.string().uuid('Please select a class'),
  subject_id: z.string().uuid().optional().nullable(),
  attendance_date: z.string().min(10, 'Please select a date'), // Expecting YYYY-MM-DD
  records: z.array(studentAttendanceRecordSchema).min(1, 'No students to mark'),
});

export type BulkAttendanceFormValues = z.infer<typeof bulkAttendanceSubmitSchema>;