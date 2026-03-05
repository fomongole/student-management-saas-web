import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import type { FeeStructure, StudentBalance, FeePaymentDetail } from '@/types/fee';
import type { CreateFeeStructureFormValues, RecordPaymentFormValues, UpdateFeeStructureFormValues } from '@/schemas/fee.schema';

const getErrorMessage = (error: any): string => {
  return (
    error.response?.data?.error?.message 
    || error.response?.data?.detail       
    || 'An unexpected error occurred'
  );
};

// ─── 1. Fee Structures ────────────────────────────────────────────────────────

export function useFeeStructures(year?: number, term?: number) {
  return useQuery({
    queryKey: ['fee-structures', year, term],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      if (term) params.append('term', term.toString());
      return (await api.get<FeeStructure[]>(`/fees/structure?${params.toString()}`)).data;
    },
    // ✅ REMOVED the "enabled" restriction so the main list page can fetch ALL records
  });
}

export function useCreateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFeeStructureFormValues) => {
      const payload = {
        ...data,
        class_id: data.class_id === '' ? null : data.class_id,
      };
      return (await api.post<FeeStructure>('/fees/structure', payload)).data;
    },
    onSuccess: () => {
      toast.success('Fee structure created!');
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] }); // Updates dashboard financials
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
}

// 2. Payments & Balances
export function useStudentBalance(studentId: string, year: number, term: number) {
  return useQuery({
    queryKey: ['student-balance', studentId, year, term],
    queryFn: async () => {
      return (await api.get<StudentBalance>(`/fees/balance/${studentId}?year=${year}&term=${term}`)).data;
    },
    enabled: !!studentId && !!year && !!term,
  });
}

export function useStudentPaymentHistory(studentId: string) {
  return useQuery({
    queryKey: ['student-payments', studentId],
    queryFn: async () => {
      return (await api.get<FeePaymentDetail[]>(`/fees/payment/student/${studentId}`)).data;
    },
    enabled: !!studentId,
  });
}

export function useRecordPayment(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RecordPaymentFormValues) => {
      const payload = { ...data, student_id: studentId };
      return (await api.post('/fees/payment', payload)).data;
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['student-balance', studentId] });
      queryClient.invalidateQueries({ queryKey: ['student-payments', studentId] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFeeStructureFormValues }) => {
      const payload = {
        ...data,
        class_id: data.class_id === '' ? null : data.class_id,
      };
      return (await api.patch<FeeStructure>(`/fees/structure/${id}`, payload)).data;
    },
    onSuccess: () => {
      toast.success('Fee structure updated!');
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] }); 
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
}