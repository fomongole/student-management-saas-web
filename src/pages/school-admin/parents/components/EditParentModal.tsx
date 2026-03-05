import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';

import { updateParentSchema } from '@/schemas/parent.schema';
import type { UpdateParentFormValues } from '@/schemas/parent.schema';
import { useUpdateParent } from '@/hooks/useParents';
import type { Parent } from '@/types/parent';

interface EditParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parent: Parent | null;
}

export default function EditParentModal({ isOpen, onClose, parent }: EditParentModalProps) {
  const { mutate: updateParent, isPending } = useUpdateParent();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateParentFormValues>({
    resolver: zodResolver(updateParentSchema),
  });

  useEffect(() => {
    if (parent) {
      reset({
        first_name: parent.first_name,
        last_name: parent.last_name,
        email: parent.email,
        is_active: parent.is_active,
      });
    }
  }, [parent, reset]);

  if (!isOpen || !parent) return null;

  const onSubmit = (data: UpdateParentFormValues) => {
    updateParent({ id: parent.id, data }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h3 className="text-lg font-bold text-gray-900">Edit Parent Profile</h3>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" {...register('email')} className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="flex items-center mt-2 rounded-lg border border-gray-200 p-3 bg-gray-50">
              <input type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              <label className="ml-3 block text-sm font-medium text-gray-700">Active Account (Allow Login)</label>
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