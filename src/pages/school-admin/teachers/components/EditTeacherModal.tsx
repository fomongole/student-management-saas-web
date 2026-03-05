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
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-gray-50/50 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Edit Teacher Profile</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">Update details for {teacher.user.first_name} {teacher.user.last_name}.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">First Name</label>
                <input 
                  {...register('first_name')} 
                  aria-invalid={!!errors.first_name}
                  className={`block w-full rounded-xl border ${errors.first_name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} bg-gray-50 p-3 text-sm font-medium text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all`} 
                />
                {errors.first_name && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Last Name</label>
                <input 
                  {...register('last_name')} 
                  aria-invalid={!!errors.last_name}
                  className={`block w-full rounded-xl border ${errors.last_name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} bg-gray-50 p-3 text-sm font-medium text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all`} 
                />
                {errors.last_name && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-400">Employee Number</label>
                <input 
                  disabled 
                  value={teacher.employee_number} 
                  className="block w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-sm font-mono font-bold text-gray-500 cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Qualification</label>
                <input 
                  {...register('qualification')} 
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-medium text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">Specialization</label>
              <input 
                {...register('specialization')} 
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-medium text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              />
            </div>

            <div className="flex items-center justify-end space-x-3 rounded-b border-t border-gray-100 pt-6 mt-8">
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="flex items-center justify-center min-w-[140px] rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-200 hover:bg-primary-700 disabled:opacity-50 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}