import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import type { PaginatedTeachers, Teacher } from '@/types/teacher';
import type { CreateTeacherFormValues, UpdateTeacherFormValues } from '@/schemas/teacher.schema';

const getErrorMessage = (error: any) => {
  return error.response?.data?.error?.message 
    || error.response?.data?.detail 
    || 'An unexpected error occurred';
};

interface FetchTeachersParams {
  skip?: number;
  limit?: number;
  search?: string;
}

export function useTeachers({ skip = 0, limit = 50, search = '' }: FetchTeachersParams) {
  return useQuery({
    queryKey: ['teachers', skip, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);

      const { data } = await api.get<PaginatedTeachers>(`/teachers/?${params.toString()}`);
      return data;
    },
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTeacherFormValues) => {
      const response = await api.post<Teacher>('/teachers/', data);
      return response.data;
    },
    onSuccess: (newTeacher) => {
      toast.success(`Teacher added! ID: ${newTeacher.employee_number}`);
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] }); 
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTeacherFormValues }) => {
      const response = await api.patch<Teacher>(`/teachers/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Teacher profile updated!');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/teachers/${id}`);
    },
    onSuccess: () => {
      toast.success('Teacher removed from the directory.');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] }); 
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useMyTeacherProfile() {
  return useQuery({
    queryKey: ['teacher-me'],
    queryFn: async () => {
      const { data } = await api.get<Teacher>('/teachers/me');
      return data;
    },
    retry: 1, 
  });
}