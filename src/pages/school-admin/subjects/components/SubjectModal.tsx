import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X, Info } from 'lucide-react';

import { 
  createSubjectSchema, 
  type CreateSubjectFormValues,
  type CreateSubjectFormInput
} from '@/schemas/subject.schema';

import { useCreateSubject } from '@/hooks/useSubjects';
import { useTeachers } from '@/hooks/useTeachers';
import { useMySchoolLevels } from '@/hooks/useSchools';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Human-readable labels for each level value
const LEVEL_LABELS: Record<string, string> = {
  NURSERY: 'Nursery / Pre-Primary',
  PRIMARY:  'Primary',
  O_LEVEL:  'O-Level (S1 – S4)',
  A_LEVEL:  'A-Level (S5 – S6)',
};

export default function SubjectModal({ isOpen, onClose }: SubjectModalProps) {
  const { mutate: createSubject, isPending } = useCreateSubject();

  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers({ skip: 0, limit: 100 });

  // Fetch only the levels this school operates
  const { data: schoolLevels, isLoading: isLoadingLevels } = useMySchoolLevels();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<
    CreateSubjectFormInput, 
    any, 
    CreateSubjectFormValues
  >({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      is_core: true,
      teacher_id: '',
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: CreateSubjectFormValues) => {
    createSubject(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">

        <div className="flex justify-between border-b p-4">
          <h3 className="text-xl font-semibold">Add Subject</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* UX PRO TIP BANNER ADDED */}
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>NOTE:</strong> O-Level and A-Level versions of the same subject (e.g., Mathematics) have different UNEB codes and grading scales. Create them as two separate subjects. A teacher can be assigned to both!
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="e.g. Mathematics"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Subject Code <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('code')}
                  placeholder="e.g. MTC"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm uppercase"
                />
                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Academic Level <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('level')}
                  disabled={isLoadingLevels}
                  className={`block w-full rounded-lg border ${errors.level ? 'border-red-500' : 'border-gray-300'} bg-gray-50 p-2.5 text-sm disabled:opacity-60`}
                >
                  <option value="">-- Select Level --</option>
                  {(schoolLevels ?? []).map(({ level }) => (
                    <option key={level} value={level}>
                      {LEVEL_LABELS[level] ?? level.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                {errors.level && <p className="mt-1 text-xs text-red-500">{errors.level.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Assign Teacher (Optional)</label>
              <select
                {...register('teacher_id')}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm"
                disabled={isLoadingTeachers}
              >
                <option value="">-- Unassigned --</option>
                {teachersData?.items.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.user.first_name} {teacher.user.last_name} ({teacher.employee_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                {...register('is_core')}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label className="ml-2 block text-sm text-gray-900">
                This is a core / compulsory subject
              </label>
            </div>

            <div className="flex justify-end space-x-3 border-t pt-4 mt-6">
              <button type="button" onClick={onClose} className="rounded-lg border px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Subject
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}