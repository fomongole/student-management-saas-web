// src/hooks/useClasses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import type { Class } from '@/types/class';
import type { CreateClassFormValues, UpdateClassFormValues } from '@/schemas/class.schema';

const getErrorMessage = (error: any) => {
  return (
    error.response?.data?.error?.message ||
    error.response?.data?.detail ||
    'An unexpected error occurred'
  );
};

// 1. Fetch all classes
export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await api.get<Class[]>('/classes/');
      return data;
    },
  });
}

// 2. Create a Class
export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClassFormValues) => {
      // Clean up empty/falsy values to null for the backend
      const payload = {
        ...data,
        capacity: data.capacity === '' ? null : Number(data.capacity),
        form_teacher_id: data.form_teacher_id === '' ? null : data.form_teacher_id,
        stream: data.stream === '' ? null : data.stream,
        // category is already null for non-A_LEVEL via schema; pass through directly
        category: data.category ?? null,
      };
      const response = await api.post<Class>('/classes/', payload);
      return response.data;
    },
    onSuccess: (newClass) => {
      // Build a human-readable class label for the toast
      let className = newClass.name;
      if (newClass.stream) className += ` ${newClass.stream}`;
      if (newClass.category) className += ` (${newClass.category})`;

      toast.success(`${className} created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// 3. Update a Class
export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateClassFormValues }) => {
      const payload = {
        ...data,
        capacity: data.capacity === '' ? null : data.capacity ? Number(data.capacity) : undefined,
        form_teacher_id: data.form_teacher_id === '' ? null : data.form_teacher_id,
        stream: data.stream === '' ? null : data.stream,
        category: data.category ?? null,
      };
      const response = await api.patch<Class>(`/classes/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Class updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// 4. Delete a Class
export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/classes/${id}`);
    },
    onSuccess: () => {
      toast.success('Class deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}