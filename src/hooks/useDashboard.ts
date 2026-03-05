import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

interface PopulationSummary {
  total_students: number;
  total_teachers: number;
  total_parents: number;
}

interface FinancialSummary {
  total_billed: number;
  total_collected: number;
  outstanding_balance: number;
}

interface AdminDashboardResponse {
  population: PopulationSummary;
  financials: FinancialSummary;
}

export function useSchoolDashboard(year: number, term: number) {
  return useQuery({
    queryKey: ['adminDashboard', year, term],
    queryFn: async () => {
      const { data } = await api.get<AdminDashboardResponse>(`/reports/dashboard?year=${year}&term=${term}`);
      return data;
    },
  });
}