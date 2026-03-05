// src/schemas/academic.schema.ts
import * as z from 'zod';

// --- GRADING SCHEMAS ---
export const gradingScaleSchema = z.object({
  grade_symbol: z.string().min(1, 'Symbol is required (e.g., A, D1)'),
  min_score: z.coerce.number().min(0, 'Minimum score is 0').max(100),
  max_score: z.coerce.number().min(0).max(100, 'Maximum score is 100'),
  label: z.string().min(2, 'Label is required (e.g., Distinction)'),
  points: z.coerce.number().min(0, 'Points must be 0 or greater'),
}).refine(data => data.min_score <= data.max_score, {
  message: "Min score cannot be greater than Max score",
  path: ["min_score"],
});

export type GradingScaleFormValues = z.infer<typeof gradingScaleSchema>;

// --- EXAM SCHEMAS ---
export const createExamSchema = z.object({
  name: z.string().min(2, 'Exam name is required (e.g., End of Term 1)'),
  year: z.coerce.number().min(2000).max(2100),
  term: z.coerce.number().min(1).max(3),
  subject_id: z.string().uuid('Please select a subject'),
});

export type CreateExamFormValues = z.infer<typeof createExamSchema>;  

export const updateExamSchema = createExamSchema.partial();
export type UpdateExamFormValues = z.infer<typeof updateExamSchema>;