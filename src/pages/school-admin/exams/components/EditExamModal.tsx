import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';

import { 
  updateExamSchema, 
  type UpdateExamFormValues, 
  type UpdateExamFormInput
} from '@/schemas/academic.schema';
import { useUpdateExam } from '@/hooks/useExams';
import { useSubjects } from '@/hooks/useSubjects';
import type { Exam } from '@/types/exam';

interface EditExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
}

export default function EditExamModal({ isOpen, onClose, exam }: EditExamModalProps) {
  const { mutate: updateExam, isPending } = useUpdateExam();
  const { data: subjects, isLoading: isLoadingSubjects } = useSubjects();

// Pass both Input and Output types to useForm
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateExamFormInput, any, UpdateExamFormValues>({
    resolver: zodResolver(updateExamSchema),
  });

  useEffect(() => {
    if (exam) {
      reset({
        name: exam.name,
        year: exam.year,
        term: exam.term,
        subject_id: exam.subject_id,
      });
    }
  }, [exam, reset]);

  if (!isOpen || !exam) return null;

  const onSubmit = (data: UpdateExamFormValues) => {
    updateExam({ id: exam.id, data }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h3 className="text-lg font-bold text-gray-900">Edit Exam Session</h3>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Exam Name</label>
              <input {...register('name')} className="block w-full rounded-lg border-gray-300 bg-white p-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Academic Year</label>
                <input type="number" {...register('year')} className="block w-full rounded-lg border-gray-300 bg-white p-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Term</label>
                <select {...register('term')} className="block w-full rounded-lg border-gray-300 bg-white p-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option value={1}>Term 1</option>
                  <option value={2}>Term 2</option>
                  <option value={3}>Term 3</option>
                </select>
                {errors.term && <p className="mt-1 text-xs text-red-500">{errors.term.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Subject</label>
              <select {...register('subject_id')} disabled={isLoadingSubjects} className="block w-full rounded-lg border-gray-300 bg-white p-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500">
                <option value="">-- Select Subject --</option>
                {subjects?.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                ))}
              </select>
              {errors.subject_id && <p className="mt-1 text-xs text-red-500">{errors.subject_id.message}</p>}
            </div>

            <div className="flex justify-end space-x-3 border-t border-gray-100 pt-5 mt-6">
              <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancel</button>
              <button type="submit" disabled={isPending} className="flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50 shadow-sm shadow-primary-200 transition-colors">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}