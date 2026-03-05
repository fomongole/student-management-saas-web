import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, BookOpen } from 'lucide-react';

import { useSubjects } from '@/hooks/useSubjects';
import { useMySchoolLevels } from '@/hooks/useSchools';
import type { Subject } from '@/types/subject';
import type { AcademicLevel } from '@/types/class';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import SubjectModal from './components/SubjectModal';
import SubjectRowActions from './components/SubjectRowActions';

const columnHelper = createColumnHelper<Subject>();

// Human-readable labels for each level value — kept in sync with the modals.
const LEVEL_LABELS: Record<string, string> = {
  NURSERY: 'Nursery',
  PRIMARY:  'Primary',
  O_LEVEL:  'O-Level',
  A_LEVEL:  'A-Level',
};

const columns = [
  columnHelper.accessor('name', {
    header: 'Subject',
    cell: (info) => (
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center mr-3">
          <BookOpen className="h-4 w-4 text-blue-600" />
        </div>
        <div className="font-medium text-gray-900">{info.getValue()}</div>
      </div>
    ),
  }),
  columnHelper.accessor('code', {
    header: 'Code',
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
  }),
  columnHelper.accessor('level', {
    header: 'Level',
    cell: (info) => (
      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 uppercase">
        {info.getValue().replace('_', ' ')}
      </span>
    ),
  }),
  columnHelper.accessor('assigned_teachers', {
    header: 'Assigned Faculty',
    cell: (info) => {
      const teachers = info.getValue() || [];
      return (
        <div className="text-sm text-gray-600">
          {teachers.length > 0 ? (
            // t.id used as a unique key
            teachers.map((t, idx) => (
              <span key={t.id}>
                {t.first_name} {t.last_name}{idx < teachers.length - 1 ? ', ' : ''}
              </span>
            ))
          ) : (
            <span className="text-gray-400 italic text-xs">Unassigned</span>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor('is_core', {
    header: 'Type',
    cell: (info) => info.getValue() ? (
      <span className="text-green-600 text-xs font-medium">Core</span>
    ) : (
      <span className="text-gray-500 text-xs italic">Elective</span>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: (info) => <SubjectRowActions subject={info.row.original} />,
  }),
];

export default function SubjectsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  /*
   * LEVEL FILTER TABS
   * ─────────────────────────────────────────────────────────────────────────
   * `activeLevel` drives two things simultaneously:
   *   1. Which tab is highlighted in the UI.
   *   2. The `level` query param sent to `useSubjects`, which hits
   *      GET /subjects/?level=O_LEVEL on the backend.
   *
   * This is the correct SaaS pattern for the "same subject at different
   * levels" use case: Mathematics (MTC/O_LEVEL) and Mathematics (MTC/A_LEVEL)
   * are intentionally separate Subject rows — different curricula, different
   * exam papers, different grading contexts. The unique constraint
   * (school_id, code, level) enforces this on the DB side. A teacher CAN
   * be assigned to both via the many-to-many TeacherSubject bridge; use the
   * "Assign Subjects" flow to set that up. The tabs simply let the admin
   * view each level's curriculum in isolation.
   * ─────────────────────────────────────────────────────────────────────────
   */
  const [activeLevel, setActiveLevel] = useState<AcademicLevel | ''>('');

  // Fetch only the levels this school actually operates.
  const { data: schoolLevels, isLoading: isLoadingLevels } = useMySchoolLevels();

  // Pass the active level filter to the query — '' means "all levels".
  const { data: subjects, isLoading: isLoadingSubjects } = useSubjects(activeLevel);

  const isLoading = isLoadingLevels || isLoadingSubjects;

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">School Curriculum</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage subjects and faculty assignments.
            {/* Hint for admins: same subject name at different levels = separate rows. */}
            {' '}Use the tabs to view each level's curriculum independently.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
        >
          <Plus className="-ml-0.5 mr-1.5 h-5 w-5" /> Add Subject
        </button>
      </div>

      {/* ── Level Filter Tabs ─────────────────────────────────────────── */}
      {/*
        Only rendered once the school's levels have loaded.
        The "All Levels" tab is always present; the rest are dynamically
        built from the school's own level configuration — same pattern used
        in SubjectModal and EditSubjectModal.
      */}
      {!isLoadingLevels && schoolLevels && schoolLevels.length > 0 && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Curriculum level tabs">
            {/* "All" tab */}
            <button
              onClick={() => setActiveLevel('')}
              className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeLevel === ''
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              All Levels
            </button>

            {schoolLevels.map(({ level }) => (
              <button
                key={level}
                onClick={() => setActiveLevel(level as AcademicLevel)}
                className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                  activeLevel === level
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {LEVEL_LABELS[level] ?? level.replace('_', ' ')}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* ── Subjects Table ────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={subjects || []} />
      )}

      {/* ── Add Subject Modal ─────────────────────────────────────────── */}
      <SubjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}