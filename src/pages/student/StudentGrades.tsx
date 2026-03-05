// src/pages/student/StudentGrades.tsx
import { useState } from 'react';
import { Award, BookOpen, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { useMyStudentProfile } from '@/hooks/useStudents';
import { useReportCard } from '@/hooks/useGrades';
import { Skeleton } from '@/components/ui/Skeleton';
import { generateReportCardPDF } from '@/services/pdfService';
import type { ExamSessionReport } from '@/types/grade';

/** Grade badge colour based on the symbol's first character. */
function gradeColour(grade: string) {
  const g = grade.charAt(0).toUpperCase();
  if (g === 'D') return 'bg-green-100 text-green-800';
  if (g === 'C') return 'bg-blue-100 text-blue-800';
  if (g === 'B') return 'bg-yellow-100 text-yellow-800';
  if (g === 'P') return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-700'; // F / U
}

function SessionTable({ session, defaultOpen }: { session: ExamSessionReport; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
      {/* Session header — click to collapse */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Award className="h-5 w-5 text-purple-600 flex-shrink-0" />
          <div>
            <span className="text-base font-bold text-gray-900">{session.session_name}</span>
            <span className="ml-3 text-xs text-gray-500">
              {session.results.length} subject{session.results.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Mini summary visible even when collapsed */}
          <div className="hidden sm:flex items-center gap-5 text-sm">
            <div className="text-right">
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Average</span>
              <span className="block font-black text-gray-900">{session.session_average}%</span>
            </div>
            <div className="text-right">
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Points</span>
              <span className="block font-black text-gray-900">{session.session_total_points}</span>
            </div>
          </div>
          {open ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Collapsible results table */}
      {open && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Points</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Teacher's Remark</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {session.results.map((res, idx) => (
                <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">{res.subject_name}</span>
                    <span className="block mt-0.5 text-[10px] text-gray-400 font-mono tracking-wider">{res.subject_code}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-black text-gray-900">{res.score}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold ${gradeColour(res.grade)}`}>
                      {res.grade}
                    </span>
                    <span className="block mt-1 text-[10px] uppercase font-bold text-gray-400">{res.label}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-gray-700">{res.points}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 italic max-w-xs truncate">
                    {res.comment ? `"${res.comment}"` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Per-session subtotal row */}
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td className="px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Session Total</td>
                <td className="px-6 py-3 text-center text-sm font-black text-gray-900">{session.session_average}%</td>
                <td className="px-6 py-3" />
                <td className="px-6 py-3 text-center text-sm font-black text-gray-900">{session.session_total_points} pts</td>
                <td className="px-6 py-3" />
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
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Grades</h2>
          <p className="mt-1 text-sm text-gray-500">
            Academic performance grouped by exam session.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-medium"
          >
            <option value={1}>Term 1</option>
            <option value={2}>Term 2</option>
            <option value={3}>Term 3</option>
          </select>
          <button
            onClick={handleDownloadPDF}
            disabled={!hasSessions}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2 text-gray-400" /> Download PDF
          </button>
        </div>
      </div>

      {/* Overall summary card */}
      {hasSessions && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {myProfile?.class_name} • Term {selectedTerm}, {currentYear}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {reportCard.sessions.length} exam session{reportCard.sessions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Overall Avg</span>
                <span className="block text-2xl font-black text-primary-700">{reportCard.overall_average}%</span>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="text-center">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pts</span>
                <span className="block text-2xl font-black text-gray-900">{reportCard.overall_total_points}</span>
              </div>
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
              defaultOpen={idx === 0} // first session open by default
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center flex flex-col items-center">
          <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Grades Yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            Your teachers have not published any marks for Term {selectedTerm} yet. Check back later!
          </p>
        </div>
      )}
    </div>
  );
}