// src/schemas/teacher.schema.ts
import * as z from 'zod';

export const createTeacherSchema = z.object({
  first_name: z.string().min(2, { message: 'First name is required' }),
  last_name: z.string().min(2, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  
  qualification: z.string().optional(),
  specialization: z.string().optional(),
});

export type CreateTeacherFormValues = z.infer<typeof createTeacherSchema>;

export const updateTeacherSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
});

export type UpdateTeacherFormValues = z.infer<typeof updateTeacherSchema>;