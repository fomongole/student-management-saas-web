import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import type { Exam, StudentMarkSheetDetail } from '@/types/exam';
import type { CreateExamFormValues, UpdateExamFormValues } from '@/schemas/academic.schema';

// Robust error message extractor
const getErrorMessage = (error: any) => {
  // 1. Check for custom domain exceptions (e.g., ConflictException)
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  // 2. Check for standard FastAPI validation/auth errors
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  // 3. Fallback
  return 'An unexpected error occurred';
};

export function useExams(year?: number, term?: number, subjectId?: string) {
  return useQuery({
    queryKey: ['exams', year, term, subjectId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      if (term) params.append('term', term.toString());
      if (subjectId) params.append('subject_id', subjectId);
      return (await api.get<Exam[]>(`/exams/?${params.toString()}`)).data;
    },
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateExamFormValues) => (await api.post<Exam>('/exams/', data)).data,
    onSuccess: () => {
      toast.success('Exam session created!');
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
}

export function useMarkSheet(examId: string, classId: string) {
  return useQuery({
    queryKey: ['mark-sheet', examId, classId],
    queryFn: async () => (await api.get<StudentMarkSheetDetail[]>(`/exams/${examId}/class/${classId}`)).data,
    enabled: !!examId && !!classId,
  });
}

export function useSubmitMarks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { exam_id: string; class_id: string; results: any[] }) => {
      return (await api.post('/exams/submit-results', payload)).data;
    },
    onSuccess: (_, variables) => {
      toast.success('Marks saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['mark-sheet', variables.exam_id, variables.class_id] });
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateExamFormValues }) => {
      const response = await api.patch<Exam>(`/exams/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Exam session updated!');
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/exams/${id}`);
    },
    onSuccess: () => {
      toast.success('Exam session deleted permanently.');
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
}