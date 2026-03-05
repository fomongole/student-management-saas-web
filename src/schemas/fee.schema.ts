import * as z from 'zod';

// --- FEE STRUCTURE SCHEMAS ---

export const createFeeStructureSchema = z.object({
  name: z.string().min(2, 'Fee name is required (e.g. Term 1 Tuition)'),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  year: z.coerce.number().min(2000).max(2100),
  term: z.coerce.number().min(1).max(3),
  // Optional: If empty, it applies to all students in the school
  class_id: z.string().uuid().optional().or(z.literal('')), 
});

/** Use in useForm<CreateFeeStructureFormInput, any, CreateFeeStructureFormValues> */
export type CreateFeeStructureFormInput = z.input<typeof createFeeStructureSchema>;
/** Used for onSubmit(data: CreateFeeStructureFormValues) */
export type CreateFeeStructureFormValues = z.infer<typeof createFeeStructureSchema>;


// --- UPDATE SCHEMAS ---

export const updateFeeStructureSchema = createFeeStructureSchema.partial();

/**For the Edit Modals */
export type UpdateFeeStructureFormInput = z.input<typeof updateFeeStructureSchema>;
/** For onSubmit(data: UpdateFeeStructureFormValues) */
export type UpdateFeeStructureFormValues = z.infer<typeof updateFeeStructureSchema>;


// --- PAYMENT SCHEMAS ---

export const recordPaymentSchema = z.object({
  fee_structure_id: z.string().uuid('Please select what this payment is for'),
  amount_paid: z.coerce.number().min(1, 'Amount must be greater than 0'),
  payment_method: z.string().min(2, 'Payment method required'),
  reference_number: z.string().min(3, 'Receipt/Reference number required'),
});

export type RecordPaymentFormInput = z.input<typeof recordPaymentSchema>;
export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;