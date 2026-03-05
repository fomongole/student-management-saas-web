import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import type { School, PlatformMetrics, SchoolLevel } from '@/types/school';
import type {
  CreateSchoolFormValues,
  UpdateSchoolFormValues,
  UpdateSchoolLevelsFormValues,
} from '@/schemas/school.schema';
import type { CreateSchoolAdminFormValues } from '@/schemas/schoolAdmin.schema';

// Helper to extract your backend's custom error messages
const getErrorMessage = (error: any) => {
  return (
    error.response?.data?.error?.message ||
    error.response?.data?.detail ||
    'An unexpected error occurred'
  );
};

// 1. Fetch Dashboard Metrics
export function usePlatformMetrics() {
  return useQuery({
    queryKey: ['platformMetrics'],
    queryFn: async () => {
      const { data } = await api.get<{ platform_metrics: PlatformMetrics }>('/schools/dashboard');
      return data.platform_metrics;
    },
  });
}

// 2. Fetch All Schools (For the Data Table)
export function useSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data } = await api.get<School[]>('/schools/');
      return data;
    },
  });
}

/**
 * 3. Fetch the academic levels for the currently authenticated user's school.
 *
 * Used by school-scoped dropdowns (subject creation, class creation, etc.)
 * so they only show levels the school actually operates — not all four possible
 * levels regardless of what the school offers.
 *
 * Only usable by SCHOOL_ADMIN / TEACHER roles. SUPER_ADMINs have no school_id
 * and should not call this hook.
 */
export function useMySchoolLevels() {
  return useQuery({
    queryKey: ['mySchoolLevels'],
    queryFn: async () => {
      const { data } = await api.get<SchoolLevel[]>('/schools/me/levels');
      return data;
    },
    // Levels change very infrequently — cache for 10 minutes
    staleTime: 10 * 60 * 1000,
  });
}

// 4. Create a New School
export function useCreateSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSchoolFormValues) => {
      const response = await api.post<School>('/schools/', data);
      return response.data;
    },
    onSuccess: (newSchool) => {
      toast.success(`${newSchool.name} registered successfully!`);
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['platformMetrics'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// 5. Update / Suspend a School
export function useUpdateSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSchoolFormValues }) => {
      const response = await api.patch<School>(`/schools/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('School updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// 6. Update a School's Academic Levels (Super Admin only)
// Full replacement — the submitted list becomes the new complete set.
// Backend blocks removal of a level that still has active classes.
export function useUpdateSchoolLevels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSchoolLevelsFormValues }) => {
      const response = await api.patch<School>(`/schools/${id}/levels`, data);
      return response.data;
    },
    onSuccess: (updatedSchool) => {
      toast.success(`${updatedSchool.name}'s academic levels updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      // Bust the school-admin level cache so dropdowns refresh on next open
      queryClient.invalidateQueries({ queryKey: ['mySchoolLevels'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// 7. Create a School Admin
export function useCreateSchoolAdmin() {
  return useMutation({
    mutationFn: async (data: CreateSchoolAdminFormValues) => {
      // Hitting the /auth router here, as per the backend design
      const response = await api.post('/auth/school-admin', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('School Admin assigned successfully!');
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}