import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';

import { createClassSchema, type CreateClassFormValues } from '@/schemas/class.schema';
import { useCreateClass } from '@/hooks/useClasses';
import { useTeachers } from '@/hooks/useTeachers';
import { useMySchoolLevels } from '@/hooks/useSchools';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Human-readable labels
const LEVEL_LABELS: Record<string, string> = {
  NURSERY: 'Nursery / Pre-Primary',
  PRIMARY: 'Primary',
  O_LEVEL: 'O-Level (S1 - S4)',
  A_LEVEL: 'A-Level (S5 - S6)',
};

export default function ClassModal({ isOpen, onClose }: ClassModalProps) {
  const { mutate: createClass, isPending } = useCreateClass();
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers({ skip: 0, limit: 100 });
  
  // ✅ FETCH DYNAMIC LEVELS
  const { data: schoolLevels, isLoading: isLoadingLevels } = useMySchoolLevels(); 

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<CreateClassFormValues>({
    resolver: zodResolver(createClassSchema),
    defaultValues: { stream: '', form_teacher_id: '', category: null }
  });

  const selectedLevel = watch('level');

  if (!isOpen) return null;

  const onSubmit = (data: CreateClassFormValues) => {
    createClass(data, { onSuccess: () => { reset(); onClose(); } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h3 className="text-lg font-bold text-gray-900">Create New Class</h3>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Base Name <span className="text-red-500">*</span></label>
                <input {...register('name')} placeholder="e.g. S1, P4" className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm uppercase shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Stream</label>
                <input {...register('stream')} placeholder="e.g. East, Red" className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm uppercase shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Academic Level <span className="text-red-500">*</span></label>
              {/* ✅ DYNAMIC DROPDOWN USING YOUR HOOK */}
              <select 
                {...register('level')} 
                disabled={isLoadingLevels} 
                className="block w-full rounded-lg border-gray-300 bg-white p-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:opacity-60"
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

            {/* A-Level Dynamic Category Field */}
            {selectedLevel === 'A_LEVEL' && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <label className="mb-1.5 block text-sm font-bold text-amber-900">A-Level Category <span className="text-red-500">*</span></label>
                <select {...register('category')} className="block w-full rounded-lg border-gray-300 bg-white p-2.5 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500">
                  <option value="">-- Select Category --</option>
                  <option value="SCIENCES">Sciences</option>
                  <option value="ARTS">Arts</option>
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Form Teacher</label>
              <select {...register('form_teacher_id')} className="block w-full rounded-lg border-gray-300 bg-white p-2.5 text-sm shadow-sm" disabled={isLoadingTeachers}>
                <option value="">-- Unassigned --</option>
                {teachersData?.items.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.user.first_name} {teacher.user.last_name} ({teacher.employee_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Max Capacity</label>
              <input type="number" {...register('capacity')} placeholder="e.g. 50" className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            </div>

            <div className="flex justify-end space-x-3 border-t border-gray-100 pt-5 mt-6">
              <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">Cancel</button>
              <button type="submit" disabled={isPending} className="flex rounded-lg bg-primary-600 px-5 py-2 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm shadow-primary-200">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Class
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}