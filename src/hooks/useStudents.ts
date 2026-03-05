import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import type { PaginatedStudents, Student } from '@/types/student';
import type { CreateStudentFormValues, UpdateStudentFormValues } from '@/schemas/student.schema';

const getErrorMessage = (error: any) => {
  return error.response?.data?.error?.message 
    || error.response?.data?.detail 
    || 'An unexpected error occurred';
};

interface FetchStudentsParams {
  skip?: number;
  limit?: number;
  search?: string;
  class_id?: string;
}

export function useStudents({ skip = 0, limit = 50, search = '', class_id = '' }: FetchStudentsParams) {
  return useQuery({
    queryKey: ['students', skip, limit, search, class_id],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (class_id) params.append('class_id', class_id);

      const { data } = await api.get<PaginatedStudents>(`/students/?${params.toString()}`);
      return data;
    },
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStudentFormValues) => {
      const payload = {
        ...data,
        date_of_birth: data.date_of_birth === '' ? null : data.date_of_birth,
      };
      
      const response = await api.post<Student>('/students/', payload);
      return response.data;
    },
    onSuccess: (newStudent) => {
      toast.success(`Student admitted! Adm No: ${newStudent.admission_number}`);
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] }); 
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateStudentFormValues }) => {
      const response = await api.patch<Student>(`/students/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Student profile updated!');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useMyStudentProfile() {
  return useQuery({
    queryKey: ['student-me'],
    queryFn: async () => {
      const { data } = await api.get<Student>('/students/me');
      return data;
    },
    retry: 1, 
  });
}