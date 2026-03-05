// src/pages/admin/schools/components/SchoolAdminModal.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';

import { createSchoolAdminSchema } from '@/schemas/schoolAdmin.schema';
import type { CreateSchoolAdminFormValues } from '@/schemas/schoolAdmin.schema';
import { useCreateSchoolAdmin } from '@/hooks/useSchools';
import type { School } from '@/types/school';

interface SchoolAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
}

export default function SchoolAdminModal({ isOpen, onClose, school }: SchoolAdminModalProps) {
  const { mutate: createAdmin, isPending } = useCreateSchoolAdmin();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateSchoolAdminFormValues>({
    resolver: zodResolver(createSchoolAdminSchema),
  });

  if (!isOpen || !school) return null;

  const onSubmit = (data: CreateSchoolAdminFormValues) => {
    // We manually inject the school_id before sending to the hook
    const payload = { ...data, school_id: school.id };
    
    createAdmin(payload, {
      onSuccess: () => {
        reset(); 
        onClose(); 
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between rounded-t border-b p-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Assign Administrator</h3>
            <p className="text-sm text-gray-500 mt-1">For {school.name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">First Name <span className="text-red-500">*</span></label>
                <input {...register('first_name')} className={`block w-full rounded-lg border ${errors.first_name ? 'border-red-500' : 'border-gray-300'} bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500`} />
                {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">Last Name <span className="text-red-500">*</span></label>
                <input {...register('last_name')} className={`block w-full rounded-lg border ${errors.last_name ? 'border-red-500' : 'border-gray-300'} bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500`} />
                {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Login Email <span className="text-red-500">*</span></label>
              <input {...register('email')} type="email" className={`block w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500`} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Temporary Password <span className="text-red-500">*</span></label>
              <input {...register('password')} type="password" className={`block w-full rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500`} />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 rounded-b border-t pt-4 mt-6">
              <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}