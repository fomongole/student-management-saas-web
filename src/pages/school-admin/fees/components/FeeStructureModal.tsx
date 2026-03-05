import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';

import { 
  createFeeStructureSchema, 
  type CreateFeeStructureFormValues, 
  type CreateFeeStructureFormInput 
} from '@/schemas/fee.schema';

import { useCreateFeeStructure } from '@/hooks/useFees';
import { useClasses } from '@/hooks/useClasses';

interface FeeStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeeStructureModal({ isOpen, onClose }: FeeStructureModalProps) {
  const { mutate: createStructure, isPending } = useCreateFeeStructure();
  const { data: classes, isLoading: isLoadingClasses } = useClasses();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<
    CreateFeeStructureFormInput, 
    any, 
    CreateFeeStructureFormValues
  >({
    resolver: zodResolver(createFeeStructureSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      term: 1,
      class_id: '',
    }
  });

  if (!isOpen) return null;

  const onSubmit = (data: CreateFeeStructureFormValues) => {
    createStructure(data, { onSuccess: () => { reset(); onClose(); } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex justify-between border-b p-4">
          <h3 className="text-xl font-semibold">New Fee Item</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-200"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Fee Name <span className="text-red-500">*</span></label>
              <input {...register('name')} placeholder="e.g. Term 1 Tuition" className="block w-full rounded-md border-gray-300 p-2 border sm:text-sm" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Amount (UGX) <span className="text-red-500">*</span></label>
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
              <label className="mb-1 block text-sm font-medium">Apply to Class (Optional)</label>
              <select {...register('class_id')} disabled={isLoadingClasses} className="block w-full rounded-md border-gray-300 p-2 border sm:text-sm">
                <option value="">-- Apply to ALL Students --</option>
                {classes?.map(cls => <option key={cls.id} value={cls.id}>{cls.name} {cls.stream || ''}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">If left empty, this fee will be billed to every student.</p>
            </div>

            <div className="flex justify-end space-x-3 border-t pt-4 mt-6">
              <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={isPending} className="flex rounded-md bg-primary-600 px-4 py-2 text-sm text-white">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Fee Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}