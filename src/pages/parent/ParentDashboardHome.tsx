import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, ArrowRight } from 'lucide-react';
import { useMyChildren } from '@/hooks/useParents';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ParentDashboardHome() {
  const { data: children, isLoading } = useMyChildren();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Parent Portal</h2>
        <p className="mt-1 text-sm text-gray-500">Welcome! Select a child to view their academic and financial details.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : children?.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
          <Users className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No children linked</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Your account hasn't been linked to any students yet. Please contact the school administration.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children?.map((child) => (
            <div 
              key={child.student_id} 
              onClick={() => navigate(`/dashboard/children/${child.student_id}`)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                    {child.admission_number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {child.first_name} {child.last_name}
                </h3>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">View Profile</span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}