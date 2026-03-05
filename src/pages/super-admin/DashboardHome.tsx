import { Users, Building2, Activity } from 'lucide-react';
import { usePlatformMetrics } from '@/hooks/useSchools';
import useAuthStore from '@/store/authStore';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardHome() {
  const { user } = useAuthStore();
  const { data: metrics, isLoading } = usePlatformMetrics();

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 text-center animate-in fade-in">
        <h2 className="text-xl font-bold text-gray-900">Welcome to your Dashboard</h2>
        <p className="text-gray-500 mt-2 font-medium">Select an option from the sidebar to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Platform Overview
        </h2>
        <p className="mt-1 text-sm text-gray-500 font-medium">Global metrics for all registered institutions.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Metric Card 1 */}
        <div className="overflow-hidden rounded-2xl bg-white px-4 py-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-50 rounded-xl p-3 border border-primary-100">
              <Building2 className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-xs font-bold uppercase tracking-wider text-gray-400">Total Schools</dt>
              <dd className="mt-1 flex items-baseline text-3xl font-black text-gray-900">
                {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.total_schools || 0}
              </dd>
            </div>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="overflow-hidden rounded-2xl bg-white px-4 py-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <Activity className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-xs font-bold uppercase tracking-wider text-gray-400">Active Schools</dt>
              <dd className="mt-1 flex items-baseline text-3xl font-black text-gray-900">
                {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.active_schools || 0}
              </dd>
            </div>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="overflow-hidden rounded-2xl bg-white px-4 py-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 rounded-xl p-3 border border-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-xs font-bold uppercase tracking-wider text-gray-400">Global Users</dt>
              <dd className="mt-1 flex items-baseline text-3xl font-black text-gray-900">
                {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.total_users || 0}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}