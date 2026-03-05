import * as z from 'zod';

export const onboardParentSchema = z.object({
  first_name: z.string().min(2, { message: 'First name is required' }),
  last_name: z.string().min(2, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  student_ids: z.array(z.string().uuid()).min(1, { message: 'Please select at least one student' }),
});

export type OnboardParentFormValues = z.infer<typeof onboardParentSchema>;

export const updateParentSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateParentFormValues = z.infer<typeof updateParentSchema>;

export const linkStudentsSchema = z.object({
  student_ids: z.array(z.string().uuid()).min(1, { message: 'Please select at least one student' }),
});

export type LinkStudentsFormValues = z.infer<typeof linkStudentsSchema>;