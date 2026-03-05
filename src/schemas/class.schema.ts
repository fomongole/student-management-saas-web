// src/schemas/class.schema.ts
import { z } from 'zod';

/**
 * Exported as a const tuple so other schemas (e.g. subject.schema.ts)
 * can reference it with z.enum(ACADEMIC_LEVELS) without duplicating the list.
 */
export const ACADEMIC_LEVELS = ['NURSERY', 'PRIMARY', 'O_LEVEL', 'A_LEVEL'] as const;
export const A_LEVEL_CATEGORIES = ['SCIENCES', 'ARTS'] as const;

const academicLevelEnum = z.enum(ACADEMIC_LEVELS);
const aLevelCategoryEnum = z.enum(A_LEVEL_CATEGORIES);

/**
 * Create schema mirrors the backend's model_validator:
 * - A_LEVEL → category is REQUIRED
 * - All other levels → category must be absent / null
 */
export const createClassSchema = z
  .object({
    name: z.string().min(1, 'Class name is required'),
    stream: z.string().optional(),
    level: academicLevelEnum,
    category: aLevelCategoryEnum.nullable().optional(),
    capacity: z.union([z.number().int().positive(), z.literal('')]).optional(),
    form_teacher_id: z.string().optional(),
  })
  .refine(
    (data) => {
      // A_LEVEL must have a category
      if (data.level === 'A_LEVEL') return !!data.category;
      return true;
    },
    {
      message: 'Sciences or Arts category is required for A-Level classes.',
      path: ['category'],
    }
  )
  .refine(
    (data) => {
      // Non-A_LEVEL must NOT have a category
      if (data.level !== 'A_LEVEL' && data.category) return false;
      return true;
    },
    {
      message: 'Category is only applicable to A-Level classes.',
      path: ['category'],
    }
  );

export type CreateClassFormValues = z.infer<typeof createClassSchema>;

/**
 * Update schema: same category rules apply to the final resolved state.
 * The service layer handles partial-patch resolution, but we mirror
 * the constraint here for immediate user feedback.
 */
export const updateClassSchema = z
  .object({
    name: z.string().min(1).optional(),
    stream: z.string().nullable().optional(),
    level: academicLevelEnum.optional(),
    category: aLevelCategoryEnum.nullable().optional(),
    capacity: z.union([z.number().int().positive(), z.literal('')]).optional(),
    form_teacher_id: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // Only validate when both fields are being changed together
      if (data.level === 'A_LEVEL' && data.category === undefined) return false;
      return true;
    },
    {
      message: 'Sciences or Arts category is required for A-Level classes.',
      path: ['category'],
    }
  )
  .refine(
    (data) => {
      if (data.level && data.level !== 'A_LEVEL' && data.category) return false;
      return true;
    },
    {
      message: 'Category is only applicable to A-Level classes.',
      path: ['category'],
    }
  );

export type UpdateClassFormValues = z.infer<typeof updateClassSchema>;