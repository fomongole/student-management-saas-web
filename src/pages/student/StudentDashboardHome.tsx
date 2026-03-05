// src/pages/student/StudentDashboardHome.tsx
import { Banknote, CalendarCheck, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useMyStudentProfile } from '@/hooks/useStudents';
import { useStudentBalance } from '@/hooks/useFees';
import { useStudentAttendanceHistory } from '@/hooks/useAttendance';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSchoolConfig } from '@/hooks/useSettings';

export default function StudentDashboardHome() {
  const { user } = useAuthStore();

  const { data: config } = useSchoolConfig();
  const year = config?.current_academic_year || 2026;
  const term = config?.current_term || 1;

  const { data: myProfile, isLoading: loadingProfile } = useMyStudentProfile();

  const studentId = myProfile?.id || '';
  const { data: balance, isLoading: loadingBalance } = useStudentBalance(studentId, year, term);
  const { data: attendance, isLoading: loadingAttendance } = useStudentAttendanceHistory(studentId);

  const isLoading = loadingProfile || loadingBalance || loadingAttendance;

  const totalAbsences = attendance?.filter((a) => a.status === 'ABSENT').length || 0;
  const isCleared = balance && balance.outstanding_balance <= 0;

  const parents = myProfile?.parents ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Hello, {user?.first_name}! 🎓</h2>
          <p className="text-primary-100 text-lg">
            {myProfile?.class_name} • Admission No: {myProfile?.admission_number}
          </p>
        </div>
        <div className="absolute -right-10 -top-24 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Exam Clearance / Financial Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Banknote className="h-5 w-5 mr-2 text-primary-600" />
            Exam Clearance Status
          </h3>

          <div className="flex items-center justify-center p-6 border rounded-lg mb-4 bg-gray-50">
            {isCleared ? (
              <div className="text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h4 className="text-lg font-bold text-green-700">Fully Cleared</h4>
                <p className="text-sm text-gray-500">You are cleared to sit for all exams this term.</p>
              </div>
            ) : (
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <h4 className="text-lg font-bold text-red-700">Balance Pending</h4>
                <p className="text-sm text-gray-500">
                  UGX {balance?.outstanding_balance.toLocaleString()} outstanding.
                </p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 text-center">
            * Remind your parents/guardians to clear any balances before examination week.
          </p>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <CalendarCheck className="h-5 w-5 mr-2 text-primary-600" />
            My Attendance
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
              <span className="block text-3xl font-black text-blue-600">
                {attendance?.filter((a) => a.status === 'PRESENT').length || 0}
              </span>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mt-1 block">Days Present</span>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center border border-red-100">
              <span className="block text-3xl font-black text-red-600">{totalAbsences}</span>
              <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider mt-1 block">Days Absent</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Status</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {attendance?.slice(0, 3).map((a) => (
                <div key={a.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-md">
                  <span className="text-gray-600 font-medium">
                    {new Date(a.attendance_date).toLocaleDateString()}
                  </span>
                  <span
                    className={`font-bold text-xs px-2 py-1 rounded ${
                      a.status === 'PRESENT'
                        ? 'bg-green-100 text-green-700'
                        : a.status === 'LATE'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
              {(!attendance || attendance.length === 0) && (
                <p className="text-xs text-gray-400 text-center py-2">No attendance records yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* My Parents / Guardians */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-primary-600" />
          My Parents / Guardians
        </h3>

        {parents.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-400 italic">
            No parent or guardian has been linked to your account yet.
            Contact your school administrator.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {parents.map((parent, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                {/* Avatar initials */}
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                  {parent.first_name.charAt(0)}{parent.last_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {parent.first_name} {parent.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{parent.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}