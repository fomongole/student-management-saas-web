import { useNavigate } from 'react-router-dom';
import { CalendarCheck, FileSpreadsheet, Clock, BookOpen } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useMyTeacherProfile } from '@/hooks/useTeachers';
import { Skeleton } from '@/components/ui/Skeleton';

export default function TeacherDashboardHome() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: myProfile, isLoading } = useMyTeacherProfile();
  
  const mySubjects = myProfile?.assigned_subjects || [];

  // Get current date formatted nicely
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-primary-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.first_name}! 👋</h2>
          <p className="text-primary-100 text-lg max-w-xl">
            Have a great day teaching. All your academic tools and class registers are ready for you.
          </p>
          <div className="mt-6 inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium border border-white/20">
            <Clock className="w-4 h-4 mr-2" />
            Today is {today}
          </div>
        </div>
        {/* Decorative background circle */}
        <div className="absolute -right-10 -top-24 w-96 h-96 bg-primary-500 rounded-full opacity-50 blur-3xl"></div>
      </div>

      {/* Quick Actions Grid */}
      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Action 1: Roll Call */}
        <div 
          onClick={() => navigate('/dashboard/attendance')}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group p-6 flex items-start"
        >
          <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mr-5 flex-shrink-0">
            <CalendarCheck className="h-7 w-7 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Take Roll Call</h4>
            <p className="text-sm text-gray-500 mt-1">
              Mark student attendance for your assigned classes. Parents are notified instantly if a student is absent.
            </p>
          </div>
        </div>

        {/* Action 2: Mark Sheets */}
        <div 
          onClick={() => navigate('/dashboard/mark-sheets')}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group p-6 flex items-start"
        >
          <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center mr-5 flex-shrink-0">
            <FileSpreadsheet className="h-7 w-7 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Enter Marks</h4>
            <p className="text-sm text-gray-500 mt-1">
              Access your class mark sheets to input student exam scores and qualitative feedback.
            </p>
          </div>
        </div>

        {/* Dynamic Curriculum Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:col-span-2">
          <div className="flex items-center mb-5 border-b border-gray-100 pb-4">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
              <BookOpen className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">My Curriculum Load</h4>
              <p className="text-sm text-gray-500">Subjects you are officially assigned to teach.</p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
          ) : mySubjects.length === 0 ? (
            <div className="bg-orange-50 text-orange-700 p-4 rounded-lg text-sm border border-orange-100">
              You haven't been assigned any subjects yet. Please contact the School Administrator to set up your curriculum.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {mySubjects.map((sub) => (
                <div 
                  key={sub.code} 
                  className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm"
                >
                  <span className="font-semibold text-gray-900 mr-3">{sub.name}</span>
                  <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-1 rounded uppercase tracking-wider">
                    {sub.code}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}