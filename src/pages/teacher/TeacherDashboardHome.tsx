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
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-primary-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">Welcome back, {user?.first_name}! 👋</h2>
          <p className="text-primary-100 text-lg max-w-xl font-medium leading-relaxed">
            Have a great day teaching. All your academic tools and class registers are ready for you.
          </p>
          <div className="mt-8 inline-flex items-center bg-black/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold border border-white/10 shadow-inner">
            <Clock className="w-4 h-4 mr-2 opacity-80" />
            Today is {today}
          </div>
        </div>
        {/* Decorative background circles */}
        <div className="absolute -right-10 -top-24 w-[500px] h-[500px] bg-primary-500 rounded-full opacity-40 blur-3xl pointer-events-none"></div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-lg font-black text-gray-900 mb-5 tracking-tight">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Action 1: Roll Call (Converted to a semantic button for accessibility) */}
          <button 
            type="button"
            onClick={() => navigate('/dashboard/attendance')}
            className="w-full text-left bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:ring-2 hover:ring-blue-50 transition-all cursor-pointer group p-6 flex items-start focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mr-5 flex-shrink-0 border border-blue-100">
              <CalendarCheck className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">Take Roll Call</h4>
              <p className="text-sm text-gray-500 mt-1.5 font-medium leading-relaxed">
                Mark student attendance for your assigned classes. Parents are notified instantly if a student is absent.
              </p>
            </div>
          </button>

          {/* Action 2: Mark Sheets (Converted to a semantic button for accessibility) */}
          <button 
            type="button"
            onClick={() => navigate('/dashboard/mark-sheets')}
            className="w-full text-left bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 hover:ring-2 hover:ring-purple-50 transition-all cursor-pointer group p-6 flex items-start focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <div className="h-16 w-16 rounded-2xl bg-purple-50 flex items-center justify-center mr-5 flex-shrink-0 border border-purple-100">
              <FileSpreadsheet className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors tracking-tight">Enter Marks</h4>
              <p className="text-sm text-gray-500 mt-1.5 font-medium leading-relaxed">
                Access your class mark sheets to input student exam scores and qualitative feedback.
              </p>
            </div>
          </button>

          {/* Dynamic Curriculum Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:col-span-2">
            <div className="flex items-center mb-6 border-b border-gray-100 pb-5">
              <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mr-4">
                <BookOpen className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900 tracking-tight">My Curriculum Load</h4>
                <p className="text-sm text-gray-500 font-medium mt-0.5">Subjects you are officially assigned to teach.</p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-40 rounded-lg" />
              </div>
            ) : mySubjects.length === 0 ? (
              <div className="bg-orange-50 text-orange-800 p-5 rounded-xl text-sm font-medium border border-orange-200 flex items-start">
                <Clock className="h-5 w-5 mr-3 text-orange-500 flex-shrink-0 mt-0.5" />
                You haven't been assigned any subjects yet. Please contact the School Administrator to set up your curriculum load.
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {mySubjects.map((sub) => (
                  <div 
                    key={sub.code} 
                    className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm hover:border-gray-300 transition-colors"
                  >
                    <span className="font-bold text-gray-900 mr-3 text-sm">{sub.name}</span>
                    <span className="text-[10px] font-black text-primary-700 bg-primary-50 border border-primary-100 px-2 py-1 rounded-md uppercase tracking-widest">
                      {sub.code}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}