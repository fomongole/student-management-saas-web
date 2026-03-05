// src/schemas/subject.schema.ts
import * as z from 'zod';
import { ACADEMIC_LEVELS } from './class.schema';

export const createSubjectSchema = z.object({
  name: z.string().min(2, { message: 'Subject name is required' }),
  code: z.string().min(2, { message: 'Subject code is required (e.g., MTC)' }),
  level: z.enum(ACADEMIC_LEVELS).refine(val => val !== undefined, {
    message: 'Please select an academic level',
  }),
  is_core: z.boolean().default(true),
  
  // Allow assigning a teacher immediately during creation
  teacher_id: z.string().uuid().optional().or(z.literal('')), 
});

export type CreateSubjectFormValues = z.infer<typeof createSubjectSchema>;

export const updateSubjectSchema = createSubjectSchema.partial();
export type UpdateSubjectFormValues = z.infer<typeof updateSubjectSchema>;

export const assignSubjectsSchema = z.object({
  teacher_id: z.string().uuid(),
  
  // Force single checkboxes into an array so Zod doesn't silently crash!
  subject_ids: z.preprocess(
    (val) => (Array.isArray(val) ? val : typeof val === 'string' ? [val] : []),
    z.array(z.string().uuid()).min(1, 'Select at least one subject')
  ),
});

export type AssignSubjectsFormValues = z.infer<typeof assignSubjectsSchema>;