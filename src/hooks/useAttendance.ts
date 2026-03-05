import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import type { ClassDailyAttendance, StudentAttendanceDetail } from '@/types/attendance';
import type { BulkAttendanceFormValues } from '@/schemas/attendance.schema';

const getErrorMessage = (error: any) => error.response?.data?.detail || 'An error occurred';

// 1. Fetch the Roll Call list for a specific class and date
export function useClassRollCall(classId: string, date: string, subjectId?: string) {
  return useQuery({
    queryKey: ['roll-call', classId, date, subjectId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('target_date', date);
      if (subjectId) params.append('subject_id', subjectId);
      
      const { data } = await api.get<ClassDailyAttendance[]>(`/attendance/class/${classId}?${params.toString()}`);
      return data;
    },
    enabled: !!classId && !!date, // Only run if we have a class and date selected
  });
}

// 2. Fetch a specific student's attendance history
export function useStudentAttendanceHistory(studentId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['student-attendance', studentId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const { data } = await api.get<StudentAttendanceDetail[]>(`/attendance/student/${studentId}?${params.toString()}`);
      return data;
    },
    enabled: !!studentId,
  });
}

// 3. Submit Bulk Attendance (Upsert)
export function useSubmitAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkAttendanceFormValues) => {
      const response = await api.post('/attendance/', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success('Attendance recorded successfully!');
      // Invalidate the specific roll call query so it refetches and updates the UI
      queryClient.invalidateQueries({ 
        queryKey: ['roll-call', variables.class_id, variables.attendance_date] 
      });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });
}