// src/pages/super-admin/schools/components/SchoolModal.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';

import { createSchoolSchema } from '@/schemas/school.schema';
import type { CreateSchoolFormValues } from '@/schemas/school.schema';
import { useCreateSchool } from '@/hooks/useSchools';
import type { AcademicLevel } from '@/types/class';

interface SchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_LEVELS: { value: AcademicLevel; label: string }[] = [
  { value: 'NURSERY', label: 'Nursery / Pre-Primary' },
  { value: 'PRIMARY', label: 'Primary (P1 – P7)' },
  { value: 'O_LEVEL', label: 'O-Level (S1 – S4)' },
  { value: 'A_LEVEL', label: 'A-Level (S5 – S6)' },
];

export default function SchoolModal({ isOpen, onClose }: SchoolModalProps) {
  const { mutate: createSchool, isPending } = useCreateSchool();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateSchoolFormValues>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: { academic_levels: [] },
  });

  if (!isOpen) return null;

  const onSubmit = (data: CreateSchoolFormValues) => {
    createSchool(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between rounded-t border-b p-4">
          <h3 className="text-xl font-semibold text-gray-900">Register New School</h3>
          <button onClick={onClose} className="rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                className={`block w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500`}
                placeholder="Greenhill Academy"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Official Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                className={`block w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500`}
                placeholder="admin@greenhill.edu"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Phone Number</label>
              <input
                {...register('phone')}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500"
                placeholder="+256 700 000000"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">Physical Address</label>
              <textarea
                {...register('address')}
                rows={2}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Kampala, Uganda"
              />
            </div>

            {/*
              Academic Levels: required at creation, immutable afterwards.
              Use SchoolLevelsModal (via SchoolRowActions) to change post-creation.
            */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Academic Levels <span className="text-red-500">*</span>
              </label>
              <p className="mb-2 text-xs text-gray-500">
                Select all levels this school will operate. This can be updated later by a Super Admin.
              </p>
              <div className="space-y-2">
                {ALL_LEVELS.map((lvl) => (
                  <label key={lvl.value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50 transition-colors">
                    <input
                      type="checkbox"
                      value={lvl.value}
                      {...register('academic_levels')}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-900">{lvl.label}</span>
                  </label>
                ))}
              </div>
              {errors.academic_levels && (
                <p className="mt-1 text-xs text-red-500">{errors.academic_levels.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 rounded-b border-t pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Onboard School
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}