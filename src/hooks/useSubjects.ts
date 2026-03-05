import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import type { Subject, TeacherSubjectDetail } from '@/types/subject';
import type { CreateSubjectFormValues, UpdateSubjectFormValues, AssignSubjectsFormValues } from '@/schemas/subject.schema';
import type { AcademicLevel } from '@/types/class';

const getErrorMessage = (error: any) => {
  return error.response?.data?.error?.message 
    || error.response?.data?.detail 
    || 'An unexpected error occurred';
};

// 1. Fetch All Subjects (with optional level filter)
export function useSubjects(level?: AcademicLevel | '') {
  return useQuery({
    queryKey: ['subjects', level],
    queryFn: async () => {
      const url = level ? `/subjects/?level=${level}` : '/subjects/';
      const { data } = await api.get<Subject[]>(url);
      return data;
    },
  });
}

// 2. Fetch Subjects Assigned to a Specific Teacher
export function useTeacherSubjects(teacherId: string) {
  return useQuery({
    queryKey: ['teacher-subjects', teacherId],
    queryFn: async () => {
      const { data } = await api.get<TeacherSubjectDetail[]>(`/subjects/teachers/${teacherId}`);
      return data;
    },
    enabled: !!teacherId, // Only run if we actually have a teacher ID
  });
}

// 3. Create a Subject
export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSubjectFormValues) => {
      // Clean up empty strings before sending to backend
      const payload = {
        ...data,
        teacher_id: data.teacher_id === '' ? null : data.teacher_id,
      };
      const response = await api.post<Subject>('/subjects/', payload);
      return response.data;
    },
    onSuccess: (newSubject) => {
      toast.success(`${newSubject.name} added to curriculum!`);
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// 4. Update a Subject
export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSubjectFormValues }) => {
      const response = await api.patch<Subject>(`/subjects/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Subject updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// 5. Delete a Subject
export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/subjects/${id}`);
    },
    onSuccess: () => {
      toast.success('Subject removed from curriculum.');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// 6. Assign Subjects to a Teacher
export function useAssignSubjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignSubjectsFormValues) => {
      const response = await api.post('/subjects/assign', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success('Curriculum assigned successfully!');
      // Refresh the specific teacher's subject list
      queryClient.invalidateQueries({ queryKey: ['teacher-subjects', variables.teacher_id] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}