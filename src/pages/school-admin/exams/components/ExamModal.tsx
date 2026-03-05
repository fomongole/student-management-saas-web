import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';

import { 
  createExamSchema, 
  type CreateExamFormValues, 
  type CreateExamFormInput
} from '@/schemas/academic.schema';
import { useCreateExam } from '@/hooks/useExams';
import { useSubjects } from '@/hooks/useSubjects';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExamModal({ isOpen, onClose }: ExamModalProps) {
  const { mutate: createExam, isPending } = useCreateExam();
  const { data: subjects, isLoading: isLoadingSubjects } = useSubjects();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<
    CreateExamFormInput, 
    any, 
    CreateExamFormValues
  >({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      name: '',
      year: new Date().getFullYear(),
      term: 1,
      subject_id: '',
    }
  });

  if (!isOpen) return null;

  const onSubmit = (data: CreateExamFormValues) => {
    createExam(data, {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex justify-between border-b p-4">
          <h3 className="text-xl font-semibold">Create Exam Session</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Exam Name</label>
              <input {...register('name')} placeholder="e.g. End of Term 1 Finals" className="block w-full rounded-md border-gray-300 p-2 border sm:text-sm" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Academic Year</label>
                <input type="number" {...register('year')} className="block w-full rounded-md border-gray-300 p-2 border sm:text-sm" />
                {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Term</label>
                <select {...register('term')} className="block w-full rounded-md border-gray-300 p-2 border sm:text-sm">
                  <option value={1}>Term 1</option>
                  <option value={2}>Term 2</option>
                  <option value={3}>Term 3</option>
                </select>
                {errors.term && <p className="mt-1 text-xs text-red-500">{errors.term.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Subject</label>
              <select {...register('subject_id')} disabled={isLoadingSubjects} className="block w-full rounded-md border-gray-300 p-2 border sm:text-sm">
                <option value="">-- Select Subject --</option>
                {subjects?.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                ))}
              </select>
              {errors.subject_id && <p className="mt-1 text-xs text-red-500">{errors.subject_id.message}</p>}
            </div>

            <div className="flex justify-end space-x-3 border-t pt-4 mt-6">
              <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={isPending} className="flex rounded-md bg-primary-600 px-4 py-2 text-sm text-white transition-colors hover:bg-primary-700">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Exam
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}