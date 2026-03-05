// src/pages/super-admin/schools/components/SchoolLevelsModal.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X, Info } from 'lucide-react';

import { updateSchoolLevelsSchema } from '@/schemas/school.schema';
import type { UpdateSchoolLevelsFormValues } from '@/schemas/school.schema';
import { useUpdateSchoolLevels } from '@/hooks/useSchools';
import type { School } from '@/types/school';
import type { AcademicLevel } from '@/types/class';

interface SchoolLevelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
}

const ALL_LEVELS: { value: AcademicLevel; label: string; description: string }[] = [
  { value: 'NURSERY', label: 'Nursery / Pre-Primary', description: 'Up to 3 classes' },
  { value: 'PRIMARY', label: 'Primary (P1 – P7)',     description: 'Up to 7 classes' },
  { value: 'O_LEVEL', label: 'O-Level (S1 – S4)',     description: 'Up to 4 classes' },
  { value: 'A_LEVEL', label: 'A-Level (S5 – S6)',     description: 'Up to 2 classes, Sciences & Arts' },
];

export default function SchoolLevelsModal({ isOpen, onClose, school }: SchoolLevelsModalProps) {
  const { mutate: updateLevels, isPending } = useUpdateSchoolLevels();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateSchoolLevelsFormValues>({
    resolver: zodResolver(updateSchoolLevelsSchema),
    defaultValues: { academic_levels: [] },
  });

  /**
   * Re-populate the form every time the school prop changes.
   *
   * Why useEffect + reset() instead of just defaultValues?
   * useForm reads defaultValues exactly once on mount. Since SchoolRowActions
   * keeps a single mounted <SchoolLevelsModal> and only swaps the `school`
   * prop, the form would never update without an explicit reset().
   * useEffect fires whenever `school` changes and syncs the checkboxes
   * to match that school's current levels.
   */
  useEffect(() => {
    if (school) {
      reset({
        academic_levels: school.academic_levels.map((l) => l.level),
      });
    }
  }, [school, reset]);

  if (!isOpen || !school) return null;

  const onSubmit = (data: UpdateSchoolLevelsFormValues) => {
    updateLevels({ id: school.id, data }, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between rounded-t border-b p-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Update Academic Levels</h3>
            <p className="text-sm text-gray-500 mt-0.5">{school.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-transparent p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* Warning banner */}
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Full replacement:</strong> the levels you submit become the new complete set.
              You cannot remove a level that still has active classes — delete those classes first.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {ALL_LEVELS.map((lvl) => (
              <label
                key={lvl.value}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50"
              >
                <input
                  type="checkbox"
                  value={lvl.value}
                  {...register('academic_levels')}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{lvl.label}</p>
                  <p className="text-xs text-gray-500">{lvl.description}</p>
                </div>
              </label>
            ))}

            {errors.academic_levels && (
              <p className="text-xs text-red-500">{errors.academic_levels.message}</p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 border-t pt-4 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Levels
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}