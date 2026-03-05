// src/hooks/useGrades.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import type { GradingScale, StudentReportCard } from '@/types/grade';
import type { GradingScaleFormValues } from '@/schemas/academic.schema';

const getErrorMessage = (error: any) => error.response?.data?.detail || 'An error occurred';

export function useGradingScales() {
  return useQuery({
    queryKey: ['grading-scales'],
    queryFn: async () => (await api.get<GradingScale[]>('/grades/')).data,
  });
}

export function useCreateGradingScale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GradingScaleFormValues) => (await api.post<GradingScale>('/grades/', data)).data,
    onSuccess: () => {
      toast.success('Grading tier saved!');
      queryClient.invalidateQueries({ queryKey: ['grading-scales'] });
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteGradingScale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => await api.delete(`/grades/${id}`),
    onSuccess: () => {
      toast.success('Grading tier removed.');
      queryClient.invalidateQueries({ queryKey: ['grading-scales'] });
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
}

export function useReportCard(studentId: string, year: number, term: number) {
  return useQuery({
    queryKey: ['report-card', studentId, year, term],
    queryFn: async () => (await api.get<StudentReportCard>(`/grades/report-card/${studentId}?year=${year}&term=${term}`)).data,
    enabled: !!studentId && !!year && !!term,
  });
}