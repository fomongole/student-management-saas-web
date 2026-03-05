import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';

import { updateFeeStructureSchema, type UpdateFeeStructureFormValues } from '@/schemas/fee.schema';
import { useUpdateFeeStructure } from '@/hooks/useFees';
import { useClasses } from '@/hooks/useClasses';
import type { FeeStructure } from '@/types/fee';

interface EditFeeStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeStructure: FeeStructure | null;
}

export default function EditFeeStructureModal({ isOpen, onClose, feeStructure }: EditFeeStructureModalProps) {
  const { mutate: updateStructure, isPending } = useUpdateFeeStructure();
  const { data: classes, isLoading: isLoadingClasses } = useClasses();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateFeeStructureFormValues>({
    resolver: zodResolver(updateFeeStructureSchema),
  });

  useEffect(() => {
    if (feeStructure) {
      reset({
        name: feeStructure.name,
        amount: feeStructure.amount,
        year: feeStructure.year,
        term: feeStructure.term,
        class_id: feeStructure.class_id || '',
      });
    }
  }, [feeStructure, reset]);

  if (!isOpen || !feeStructure) return null;

  const onSubmit = (data: UpdateFeeStructureFormValues) => {
    updateStructure({ id: feeStructure.id, data }, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex justify-between border-b p-4">
          <h3 className="text-xl font-semibold">Edit Fee Item</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-200"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Fee Name</label>
              <input {...register('name')} className="block w-full rounded-md border-gray-300 p-2 border sm:text-sm" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Amount (UGX)</label>
              <input type="number" {...register('amount')} className="block w-full rounded-md border-gray-300 p-2 border sm:text-sm" />
              {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Year</label>
                <input type="number" {...register('year')} className="block w-full rounded-md border-gray-300 p-2 border sm:text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Term</label>
                <select {...register('term')} className="block w-full rounded-md border-gray-300 p-2 border sm:text-sm">
                  <option value={1}>Term 1</option>
                  <option value={2}>Term 2</option>
                  <option value={3}>Term 3</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Apply to Class</label>
              <select {...register('class_id')} disabled={isLoadingClasses} className="block w-full rounded-md border-gray-300 p-2 border sm:text-sm">
                <option value="">-- Apply to ALL Students --</option>
                {classes?.map(cls => <option key={cls.id} value={cls.id}>{cls.name} {cls.stream || ''}</option>)}
              </select>
            </div>

            <div className="flex justify-end space-x-3 border-t pt-4 mt-6">
              <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={isPending} className="flex rounded-md bg-primary-600 px-4 py-2 text-sm text-white">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}