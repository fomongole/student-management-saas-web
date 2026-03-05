import * as z from 'zod';

export const createStudentSchema = z.object({
  first_name: z.string().min(2, { message: 'First name is required' }),
  last_name: z.string().min(2, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  class_id: z.string().uuid({ message: 'Please select a class' }),
  date_of_birth: z.string().optional().or(z.literal('')), 
});

export type CreateStudentFormValues = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  class_id: z.string().uuid().optional(),
  date_of_birth: z.string().optional().or(z.literal('')),
  enrollment_status: z.enum(['ACTIVE', 'GRADUATED', 'TRANSFERRED', 'EXPELLED', 'DROPPED_OUT']).optional(),
});

export type UpdateStudentFormValues = z.infer<typeof updateStudentSchema>;