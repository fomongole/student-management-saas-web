import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';

import { updateTeacherSchema } from '@/schemas/teacher.schema';
import type { UpdateTeacherFormValues } from '@/schemas/teacher.schema';
import { useUpdateTeacher } from '@/hooks/useTeachers';
import type { Teacher } from '@/types/teacher';

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
}

export default function EditTeacherModal({ isOpen, onClose, teacher }: EditTeacherModalProps) {
  const { mutate: updateTeacher, isPending } = useUpdateTeacher();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateTeacherFormValues>({
    resolver: zodResolver(updateTeacherSchema),
  });

  useEffect(() => {
    if (teacher) {
      reset({
        first_name: teacher.user.first_name,
        last_name: teacher.user.last_name,
        qualification: teacher.qualification || undefined,
        specialization: teacher.specialization || undefined,
      });
    }
  }, [teacher, reset]);

  if (!isOpen || !teacher) return null;

  const onSubmit = (data: UpdateTeacherFormValues) => {
    updateTeacher({ id: teacher.id, data }, {
      onSuccess: () => {
        onClose(); 
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-xl font-semibold text-gray-900">Edit Teacher Profile</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">First Name</label>
                <input {...register('first_name')} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm" />
                {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Last Name</label>
                <input {...register('last_name')} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm" />
                {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-400">Employee Number</label>
                <input disabled value={teacher.employee_number} className="block w-full rounded-lg border border-gray-200 bg-gray-100 p-2.5 text-sm uppercase text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Qualification</label>
                <input {...register('qualification')} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Specialization</label>
              <input {...register('specialization')} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm" />
            </div>

            <div className="flex justify-end space-x-3 border-t pt-4 mt-6">
              <button type="button" onClick={onClose} className="rounded-lg border bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100">Cancel</button>
              <button type="submit" disabled={isPending} className="flex rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}