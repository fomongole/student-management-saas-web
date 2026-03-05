import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X, AlertCircle } from 'lucide-react';
import * as z from 'zod';

import { useUpdateStudent } from '@/hooks/useStudents';
import type { Student } from '@/types/student';

const statusSchema = z.object({
  enrollment_status: z.enum(['ACTIVE', 'GRADUATED', 'TRANSFERRED', 'EXPELLED', 'DROPPED_OUT']),
});

type StatusFormValues = z.infer<typeof statusSchema>;

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export default function ChangeStatusModal({ isOpen, onClose, student }: ChangeStatusModalProps) {
  const { mutate: updateStudent, isPending } = useUpdateStudent();

  const { register, handleSubmit, reset } = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
  });

  useEffect(() => {
    if (student) {
      reset({ enrollment_status: student.enrollment_status });
    }
  }, [student, reset]);

  if (!isOpen || !student) return null;

  const onSubmit = (data: StatusFormValues) => {
    updateStudent({ id: student.id, data }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-gray-50/50 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Change Status</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">Modify enrollment state.</p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          
          {/* Refined Alert Banner - FIXED TEXT OVERFLOW */}
          <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" aria-hidden="true" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <h3 className="text-sm font-bold text-amber-800">Important Note</h3>
                <div className="mt-1 text-sm text-amber-700 font-medium">
                  <p className="whitespace-normal break-words leading-relaxed">
                    Changing status to anything other than <strong className="font-black text-amber-900">ACTIVE</strong> will automatically revoke portal access. Historical grades, fees, and attendance will be safely preserved.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">Select New Status</label>
              <select 
                {...register('enrollment_status')} 
                className="block w-full rounded-xl border border-gray-200 bg-white py-3 px-3 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 font-bold text-gray-900 shadow-sm outline-none transition-all"
              >
                <option value="ACTIVE">Active Enrollment</option>
                <option value="GRADUATED">Graduated</option>
                <option value="TRANSFERRED">Transferred to another school</option>
                <option value="EXPELLED">Expelled</option>
                <option value="DROPPED_OUT">Dropped Out</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-8">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isPending} 
                className="flex items-center justify-center min-w-[150px] rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-50 transition-all shadow-lg shadow-amber-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}