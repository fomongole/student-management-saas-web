// src/pages/school-admin/subjects/components/EditSubjectModal.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';

import { updateSubjectSchema } from '@/schemas/subject.schema';
import type { UpdateSubjectFormValues } from '@/schemas/subject.schema';
import { useUpdateSubject } from '@/hooks/useSubjects';
import { useMySchoolLevels } from '@/hooks/useSchools';
import type { Subject } from '@/types/subject';

interface EditSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectData: Subject | null;
}

// Human-readable labels for each level value
const LEVEL_LABELS: Record<string, string> = {
  NURSERY: 'Nursery / Pre-Primary',
  PRIMARY:  'Primary',
  O_LEVEL:  'O-Level (S1 – S4)',
  A_LEVEL:  'A-Level (S5 – S6)',
};

export default function EditSubjectModal({ isOpen, onClose, subjectData }: EditSubjectModalProps) {
  const { mutate: updateSubject, isPending } = useUpdateSubject();

  // Fetch only the levels this school operates
  const { data: schoolLevels, isLoading: isLoadingLevels } = useMySchoolLevels();

  const { register, handleSubmit, reset } = useForm<UpdateSubjectFormValues>({
    resolver: zodResolver(updateSubjectSchema),
  });

  useEffect(() => {
    if (subjectData) {
      reset({
        name: subjectData.name,
        code: subjectData.code,
        level: subjectData.level,
        is_core: subjectData.is_core,
      });
    }
  }, [subjectData, reset]);

  if (!isOpen || !subjectData) return null;

  const onSubmit = (data: UpdateSubjectFormValues) => {
    updateSubject({ id: subjectData.id, data }, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">

        <div className="flex justify-between border-b p-4">
          <h3 className="text-xl font-semibold">Edit Subject</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <label className="mb-2 block text-sm font-medium">Subject Name</label>
              <input
                {...register('name')}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Subject Code</label>
              <input
                {...register('code')}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm uppercase"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Academic Level</label>
              <select
                {...register('level')}
                disabled={isLoadingLevels}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm disabled:opacity-60"
              >
                {/*
                  Only render options for levels the school operates.
                  The current subject's level is always included — even if the
                  school's level set changes, we don't want to silently break
                  the existing value shown in the edit form.
                */}
                {(schoolLevels ?? []).map(({ level }) => (
                  <option key={level} value={level}>
                    {LEVEL_LABELS[level] ?? level.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('is_core')}
                className="h-4 w-4 rounded border-gray-300 text-primary-600"
              />
              <label className="ml-2 block text-sm text-gray-900">Core Subject</label>
            </div>

            <div className="flex justify-end space-x-3 border-t pt-4 mt-6">
              <button type="button" onClick={onClose} className="rounded-lg border px-5 py-2.5 text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex rounded-lg bg-primary-600 px-5 py-2.5 text-sm text-white disabled:opacity-50"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}