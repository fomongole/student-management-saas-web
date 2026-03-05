// src/schemas/school.schema.ts
import { z } from 'zod';

const academicLevelEnum = z.enum(['NURSERY', 'PRIMARY', 'O_LEVEL', 'A_LEVEL']);

export const createSchoolSchema = z.object({
  name: z.string().min(2, 'School name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  academic_levels: z
    .array(academicLevelEnum)
    .min(1, 'Select at least one academic level'),
});

export type CreateSchoolFormValues = z.infer<typeof createSchoolSchema>;

export const updateSchoolSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateSchoolFormValues = z.infer<typeof updateSchoolSchema>;

/**
 * Full-replacement of a school's academic levels.
 * Mirrors the backend's SchoolLevelUpdate schema.
 */
export const updateSchoolLevelsSchema = z.object({
  academic_levels: z
    .array(academicLevelEnum)
    .min(1, 'At least one academic level must be selected'),
});

export type UpdateSchoolLevelsFormValues = z.infer<typeof updateSchoolLevelsSchema>;