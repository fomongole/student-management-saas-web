import { Users, Building2, Activity } from 'lucide-react';
import { usePlatformMetrics } from '@/hooks/useSchools';
import useAuthStore from '@/store/authStore';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardHome() {
  const { user } = useAuthStore();
  const { data: metrics, isLoading } = usePlatformMetrics();

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Welcome to your Dashboard</h2>
        <p className="text-gray-500 mt-1">Select an option from the sidebar to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Platform Overview
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Metric Card 1 */}
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <Building2 className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-sm font-medium text-gray-500">Total Schools</dt>
              <dd className="mt-1 flex items-baseline text-2xl font-semibold text-gray-900">
                {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.total_schools || 0}
              </dd>
            </div>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-sm font-medium text-gray-500">Active Schools</dt>
              <dd className="mt-1 flex items-baseline text-2xl font-semibold text-gray-900">
                {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.active_schools || 0}
              </dd>
            </div>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-sm font-medium text-gray-500">Global Users</dt>
              <dd className="mt-1 flex items-baseline text-2xl font-semibold text-gray-900">
                {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.total_users || 0}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}