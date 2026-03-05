import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, ArrowRight } from 'lucide-react';
import { useMyChildren } from '@/hooks/useParents';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ParentDashboardHome() {
  const { data: children, isLoading } = useMyChildren();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Parent Portal</h2>
        <p className="mt-1 text-sm font-medium text-gray-500">Welcome! Select a child to view their academic and financial details.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : children?.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
          <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Users className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">No children linked</h3>
          <p className="text-sm font-medium text-gray-500 mt-2 max-w-sm mx-auto">
            Your account hasn't been linked to any students yet. Please contact the school administration to set this up.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children?.map((child) => (
            <button 
              key={child.student_id} 
              type="button"
              onClick={() => navigate(`/dashboard/children/${child.student_id}`)}
              className="w-full text-left bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 hover:ring-2 hover:ring-primary-50 transition-all cursor-pointer group overflow-hidden flex flex-col focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-5">
                  <div className="h-14 w-14 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <GraduationCap className="h-7 w-7 text-primary-600" />
                  </div>
                  <span className="text-xs font-black tracking-widest bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md uppercase">
                    {child.admission_number}
                  </span>
                </div>
                <h3 className="text-xl font-black text-gray-900 group-hover:text-primary-600 transition-colors tracking-tight">
                  {child.first_name} {child.last_name}
                </h3>
              </div>
              <div className="bg-gray-50/80 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500 group-hover:text-primary-600 transition-colors">View Profile</span>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}