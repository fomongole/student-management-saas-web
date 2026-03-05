import { useState } from 'react';
import { Award, BookOpen, Download, ChevronDown } from 'lucide-react';
import { useMyStudentProfile } from '@/hooks/useStudents';
import { useReportCard } from '@/hooks/useGrades';
import { Skeleton } from '@/components/ui/Skeleton';
import { generateReportCardPDF } from '@/services/pdfService';
import type { ExamSessionReport } from '@/types/grade';

/** Grade badge colour based on the symbol's first character. */
function gradeColour(grade: string) {
  const g = grade.charAt(0).toUpperCase();
  if (g === 'D') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (g === 'C') return 'bg-blue-100 text-blue-800 border-blue-200';
  if (g === 'B') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (g === 'P') return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-red-100 text-red-700 border-red-200'; // F / U
}

function SessionTable({ session, defaultOpen }: { session: ExamSessionReport; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden mb-5 shadow-sm">
      {/* Session header — click to collapse */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <span className="block text-base font-black text-gray-900">{session.session_name}</span>
            <span className="block text-xs font-semibold text-gray-500 mt-0.5">
              {session.results.length} subject{session.results.length !== 1 ? 's' : ''} recorded
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Mini summary visible even when collapsed */}
          <div className="hidden sm:flex items-center gap-5 text-sm">
            <div className="text-right">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average</span>
              <span className="block text-lg font-black text-gray-900 leading-none">{session.session_average}%</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Points</span>
              <span className="block text-lg font-black text-gray-900 leading-none">{session.session_total_points}</span>
            </div>
          </div>
          {/* Smooth chevron rotation */}
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Collapsible results table */}
      {open && (
        <div className="overflow-x-auto border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Subject</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Score</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Grade</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Points</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">Teacher's Remark</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {session.results.map((res, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900 block">{res.subject_name}</span>
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider block mt-0.5">{res.subject_code}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-base font-black text-gray-900">{res.score}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-black border ${gradeColour(res.grade)}`}>
                      {res.grade}
                    </span>
                    <span className="block mt-1.5 text-[9px] uppercase font-black text-gray-400 tracking-widest">{res.label}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-bold text-gray-700">{res.points}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 italic max-w-xs truncate font-medium">
                    {res.comment ? `"${res.comment}"` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Per-session subtotal row */}
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">Session Total</td>
                <td className="px-6 py-4 text-center text-base font-black text-gray-900 whitespace-nowrap">{session.session_average}%</td>
                <td className="px-6 py-4" />
                <td className="px-6 py-4 text-center text-base font-black text-gray-900 whitespace-nowrap">{session.session_total_points} pts</td>
                <td className="px-6 py-4" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

export default function StudentGrades() {
  const [selectedTerm, setSelectedTerm] = useState(1);
  const currentYear = new Date().getFullYear();

  const { data: myProfile, isLoading: loadingProfile } = useMyStudentProfile();

  const { data: reportCard, isLoading: loadingReport } = useReportCard(
    myProfile?.id || '',
    currentYear,
    selectedTerm,
  );

  const handleDownloadPDF = () => {
    if (reportCard && myProfile) {
      generateReportCardPDF(reportCard, myProfile);
    }
  };

  const hasSessions = reportCard && reportCard.sessions.length > 0;

  if (loadingProfile || loadingReport) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Grades</h2>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Academic performance grouped by exam session.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(Number(e.target.value))}
            className="rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-bold text-gray-700 py-2.5"
          >
            <option value={1}>Term 1</option>
            <option value={2}>Term 2</option>
            <option value={3}>Term 3</option>
          </select>
          <button
            onClick={handleDownloadPDF}
            disabled={!hasSessions}
            className="flex items-center justify-center px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50 transition-colors active:scale-[0.98]"
          >
            <Download className="w-4 h-4 mr-2 text-gray-400" /> Download PDF
          </button>
        </div>
      </div>

      {/* Overall summary card */}
      {hasSessions && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black text-primary-600 uppercase tracking-wider">
              {myProfile?.class_name} • Term {selectedTerm}, {currentYear}
            </p>
            <p className="text-sm font-medium text-gray-500 mt-1">
              {reportCard.sessions.length} exam session{reportCard.sessions.length !== 1 ? 's' : ''} completed.
            </p>
          </div>
          <div className="flex gap-8 bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
            <div className="text-center">
              <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Overall Avg</span>
              <span className="block text-3xl font-black text-primary-600 tracking-tight mt-1">{reportCard.overall_average}%</span>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="text-center">
              <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Pts</span>
              <span className="block text-3xl font-black text-gray-900 tracking-tight mt-1">{reportCard.overall_total_points}</span>
            </div>
          </div>
        </div>
      )}

      {/* Session tables */}
      {hasSessions ? (
        <div>
          {reportCard.sessions.map((session, idx) => (
            <SessionTable
              key={session.session_name}
              session={session}
              defaultOpen={idx === 0}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center flex flex-col items-center">
          <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">No Grades Yet</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm font-medium">
            Your teachers have not published any marks for Term {selectedTerm} yet. Check back later!
          </p>
        </div>
      )}
    </div>
  );
}