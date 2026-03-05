// src/pages/parent/ChildDetail.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, CalendarCheck, Clock, Award, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useStudentBalance, useStudentPaymentHistory } from '@/hooks/useFees';
import { useStudentAttendanceHistory } from '@/hooks/useAttendance';
import { useMyChildren } from '@/hooks/useParents';
import { useReportCard } from '@/hooks/useGrades';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ExamSessionReport } from '@/types/grade';

/** Collapsible table for one exam session — same component pattern as StudentGrades. */
function SessionTable({ session, defaultOpen }: { session: ExamSessionReport; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Award className="h-4 w-4 text-purple-500 flex-shrink-0" />
          <span className="text-sm font-bold text-gray-900">{session.session_name}</span>
          <span className="text-xs text-gray-400">{session.results.length} subject{session.results.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <div className="text-right">
              <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Avg</span>
              <span className="block font-black text-gray-900">{session.session_average}%</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pts</span>
              <span className="block font-black text-gray-900">{session.session_total_points}</span>
            </div>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher Comment</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {session.results.map((res, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{res.subject_name}</span>
                  <span className="ml-2 text-xs text-gray-400 font-mono">({res.subject_code})</span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-center">
                  <span className="text-sm font-semibold text-gray-900">{res.score}%</span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-center">
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-800">
                    {res.grade}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">{res.label}</span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-500 italic">{res.comment || '—'}</td>
              </tr>
            ))}
          </tbody>
          {/* Per-session subtotal */}
          <tfoot>
            <tr className="bg-purple-50 border-t border-purple-100">
              <td className="px-6 py-2 text-xs font-bold text-purple-700 uppercase tracking-wider">Session Total</td>
              <td className="px-6 py-2 text-center text-sm font-black text-purple-900">{session.session_average}%</td>
              <td className="px-6 py-2" />
              <td className="px-6 py-2 text-sm font-bold text-purple-700">{session.session_total_points} pts</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}

export default function ChildDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const currentTerm = 1;

  // Fetch data
  const { data: children, isLoading: loadingChildren } = useMyChildren();
  const child = children?.find((c) => c.student_id === id);

  const { data: balance, isLoading: loadingBalance } = useStudentBalance(id || '', currentYear, currentTerm);
  const { data: payments, isLoading: loadingPayments } = useStudentPaymentHistory(id || '');
  const { data: attendance, isLoading: loadingAttendance } = useStudentAttendanceHistory(id || '');
  const { data: reportCard, isLoading: loadingReport } = useReportCard(id || '', currentYear, currentTerm);

  const isLoading = loadingChildren || loadingBalance || loadingPayments || loadingAttendance || loadingReport;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-700">Student Not Found</h2>
        <p className="text-gray-500 mt-2">You do not have access to this student's records.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-primary-600 hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const totalAbsences = attendance?.filter((a) => a.status === 'ABSENT').length || 0;
  const isCleared = balance && balance.outstanding_balance <= 0;

  // New session-based report card fields
  const hasSessions = reportCard && reportCard.sessions.length > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard/children')}
          className="p-2 bg-white rounded-lg border shadow-sm hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{child.first_name} {child.last_name}</h2>
          <p className="text-sm text-gray-500">
            Adm No: {child.admission_number} • {child.class_name} • Term {currentTerm}, {currentYear}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Financial Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center text-gray-900">
              <Banknote className="h-5 w-5 mr-2 text-green-600" />
              Financial Status
            </h3>
            {isCleared ? (
              <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-1 rounded-full">Cleared</span>
            ) : (
              <span className="bg-red-100 text-red-700 text-[10px] uppercase font-bold px-2 py-1 rounded-full">Balance Due</span>
            )}
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex justify-between text-sm border-b pb-2">
              <span className="text-gray-500">Total Billed:</span>
              <span className="font-medium">UGX {balance?.total_billed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-b pb-2">
              <span className="text-gray-500">Total Paid:</span>
              <span className="font-medium text-green-600">UGX {balance?.total_paid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-bold text-gray-900">Outstanding:</span>
              <span className={`font-black text-lg ${isCleared ? 'text-green-500' : 'text-red-500'}`}>
                UGX {balance?.outstanding_balance.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-6 border-t pt-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Payments</h4>
            <div className="space-y-2 max-h-28 overflow-y-auto">
              {payments?.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No payments recorded yet.</p>
              ) : (
                payments?.slice(0, 2).map((p) => (
                  <div key={p.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-md">
                    <div>
                      <p className="text-xs font-medium text-gray-900">{p.fee_structure_name}</p>
                      <p className="text-[10px] text-gray-500">{new Date(p.payment_date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm font-bold text-green-600">+ {p.amount_paid.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center text-gray-900">
              <CalendarCheck className="h-5 w-5 mr-2 text-blue-600" />
              Attendance Record
            </h3>
            {totalAbsences > 3 && (
              <span className="bg-orange-100 text-orange-700 text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center">
                <Clock className="w-3 h-3 mr-1" /> High Absence
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <span className="block text-3xl font-black text-blue-600">
                {attendance?.filter((a) => a.status === 'PRESENT').length || 0}
              </span>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mt-1 block">Days Present</span>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <span className="block text-3xl font-black text-red-600">{totalAbsences}</span>
              <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider mt-1 block">Days Absent</span>
            </div>
          </div>

          <div className="flex-1 border-t pt-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Absences</h4>
            <div className="space-y-2 max-h-28 overflow-y-auto">
              {totalAbsences === 0 ? (
                <p className="text-sm text-gray-500 italic">Perfect attendance!</p>
              ) : (
                attendance
                  ?.filter((a) => a.status === 'ABSENT')
                  .slice(0, 2)
                  .map((a) => (
                    <div key={a.id} className="flex items-center bg-red-50 p-2.5 rounded-md">
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-3 flex-shrink-0" />
                      <span className="text-sm font-medium text-red-800 w-24">
                        {new Date(a.attendance_date).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-red-600 truncate">{a.remarks || 'No reason provided'}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Academic Performance — session-based report card */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Card header with overall summary */}
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center text-gray-900">
                <Award className="h-5 w-5 mr-2 text-purple-600" />
                Academic Performance
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Official Report Card • Term {currentTerm}
                {hasSessions && (
                  <span className="ml-2 text-gray-400">
                    — {reportCard.sessions.length} exam session{reportCard.sessions.length !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>

            {hasSessions && (
              <div className="flex gap-4 bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
                <div className="text-center">
                  <span className="block text-xs font-medium text-purple-600 uppercase tracking-wider">Overall Avg</span>
                  <span className="block text-lg font-black text-purple-900">{reportCard.overall_average}%</span>
                </div>
                <div className="w-px bg-purple-200" />
                <div className="text-center">
                  <span className="block text-xs font-medium text-purple-600 uppercase tracking-wider">Total Pts</span>
                  <span className="block text-lg font-black text-purple-900">{reportCard.overall_total_points}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sessions or empty state */}
          {!hasSessions ? (
            <div className="p-10 text-center flex flex-col items-center">
              <BookOpen className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No exam results published for this term yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {reportCard.sessions.map((session, idx) => (
                <SessionTable
                  key={session.session_name}
                  session={session}
                  defaultOpen={idx === 0}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}