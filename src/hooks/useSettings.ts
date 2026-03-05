import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

export interface SchoolConfig {
  current_academic_year: number;
  current_term: number;
  currency_symbol: string;
}

export function useSchoolConfig() {
  return useQuery({
    queryKey: ['school-config'],
    queryFn: async () => {
      const { data } = await api.get<SchoolConfig>('/schools/settings');
      return data;
    },
    staleTime: Infinity, // Settings rarely change, keep them cached
  });
}

export function useUpdateSchoolConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<SchoolConfig>) => {
      const response = await api.patch('/schools/settings', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('System settings updated successfully!');
      // Refresh the config globally
      queryClient.invalidateQueries({ queryKey: ['school-config'] });
      // Clear all dashboards so they refetch with the new term
      queryClient.invalidateQueries({ queryKey: ['school-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['student-balance'] });
      queryClient.invalidateQueries({ queryKey: ['report-card'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update settings');
    },
  });
}