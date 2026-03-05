import * as z from 'zod';

export const createSchoolAdminSchema = z.object({
  first_name: z.string().min(2, { message: 'First name is required' }),
  last_name: z.string().min(2, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  
  // ✅ FIX: Added .optional() so the form validation doesn't block submission!
  // We manually append the school_id in the component before sending it to the API.
  school_id: z.string().uuid().optional(), 
});

export type CreateSchoolAdminFormValues = z.infer<typeof createSchoolAdminSchema>;