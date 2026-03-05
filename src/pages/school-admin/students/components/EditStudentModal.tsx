import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';

import { updateStudentSchema } from '@/schemas/student.schema';
import type { UpdateStudentFormValues } from '@/schemas/student.schema';
import { useUpdateStudent } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import type { Student } from '@/types/student';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export default function EditStudentModal({ isOpen, onClose, student }: EditStudentModalProps) {
  const { mutate: updateStudent, isPending } = useUpdateStudent();
  const { data: classesData, isLoading: isLoadingClasses } = useClasses();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateStudentFormValues>({
    resolver: zodResolver(updateStudentSchema),
  });

  useEffect(() => {
    if (student) {
      reset({
        first_name: student.first_name,
        last_name: student.last_name,
        class_id: student.class_id,
      });
    }
  }, [student, reset]);

  if (!isOpen || !student) return null;

  const onSubmit = (data: UpdateStudentFormValues) => {
    updateStudent({ id: student.id, data }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl my-8">
        
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h3 className="text-lg font-bold text-gray-900">Edit Student Info</h3>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">First Name</label>
                <input {...register('first_name')} className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Last Name</label>
                <input {...register('last_name')} className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-500">Admission Number</label>
                <input disabled value={student.admission_number} className="block w-full rounded-lg border-gray-200 bg-gray-100 p-2.5 text-sm uppercase text-gray-500 cursor-not-allowed font-mono" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Change Class</label>
                <select {...register('class_id')} className="block w-full rounded-lg border-gray-300 bg-white p-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" disabled={isLoadingClasses}>
                  {classesData?.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.stream || ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 border-t border-gray-100 pt-5 mt-6">
              <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancel</button>
              <button type="submit" disabled={isPending} className="flex rounded-lg bg-primary-600 px-5 py-2 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50 shadow-sm shadow-primary-200 transition-colors">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}