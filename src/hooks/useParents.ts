import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import type { Parent, ParentStudentLink } from '@/types/parent';
import type { OnboardParentFormValues, LinkStudentsFormValues, UpdateParentFormValues } from '@/schemas/parent.schema';
import type { LinkedChild } from '@/types/parent';

const getErrorMessage = (error: any) => {
  return error.response?.data?.error?.message 
    || error.response?.data?.detail 
    || 'An unexpected error occurred';
};

export function useParents() {
  return useQuery({
    queryKey: ['parents'],
    queryFn: async () => {
      const { data } = await api.get<Parent[]>('/parents/');
      return data;
    },
  });
}

export function useMyChildren() {
  return useQuery({
    queryKey: ['my-children'],
    queryFn: async () => {
      const { data } = await api.get<LinkedChild[]>('/parents/my-children');
      return data;
    },
  });
}

export function useOnboardParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OnboardParentFormValues) => {
      const response = await api.post<ParentStudentLink[]>('/parents/onboard', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Parent account created and linked successfully!');
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] }); 
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useLinkStudents(parentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LinkStudentsFormValues) => {
      const response = await api.post<ParentStudentLink[]>(`/parents/${parentId}/link`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Students linked successfully!');
      queryClient.invalidateQueries({ queryKey: ['parents'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUnlinkStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parentId, studentId }: { parentId: string; studentId: string }) => {
      await api.delete(`/parents/${parentId}/link/${studentId}`);
    },
    onSuccess: () => {
      toast.success('Student unlinked from parent account.');
      queryClient.invalidateQueries({ queryKey: ['parents'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateParentFormValues }) => {
      const response = await api.patch<Parent>(`/parents/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Parent profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['parents'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/parents/${id}`);
    },
    onSuccess: () => {
      toast.success('Parent account permanently deleted.');
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] }); 
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}