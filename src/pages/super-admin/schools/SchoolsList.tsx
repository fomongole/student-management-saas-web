// src/pages/super-admin/schools/SchoolsList.tsx
import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Building2 } from 'lucide-react';

import { useSchools } from '@/hooks/useSchools';
import type { School } from '@/types/school';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import SchoolModal from './components/SchoolModal';
import SchoolRowActions from './components/SchoolRowActions';

const columnHelper = createColumnHelper<School>();

// Human-readable labels and badge colours per level
const LEVEL_META: Record<string, { label: string; className: string }> = {
  NURSERY: { label: 'Nursery', className: 'bg-pink-50 text-pink-700 ring-pink-600/20' },
  PRIMARY: { label: 'Primary', className: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  O_LEVEL: { label: 'O-Level', className: 'bg-purple-50 text-purple-700 ring-purple-600/20' },
  A_LEVEL: { label: 'A-Level', className: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
};

const columns = [
  columnHelper.accessor('name', {
    header: 'School Name',
    cell: (info) => (
      <div className="flex items-center">
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center">
          <Building2 className="h-4 w-4 text-primary-600" />
        </div>
        <div className="ml-4 font-medium text-gray-900">{info.getValue()}</div>
      </div>
    ),
  }),
  columnHelper.accessor('email', {
    header: 'Contact Email',
    cell: (info) => info.getValue(),
  }),
  // Academic levels column: renders one badge per level
  columnHelper.accessor('academic_levels', {
    header: 'Levels',
    cell: (info) => {
      const levels = info.getValue();
      if (!levels || levels.length === 0) {
        return <span className="text-xs text-gray-400 italic">None set</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {levels.map(({ level }) => {
            const meta = LEVEL_META[level] ?? { label: level, className: 'bg-gray-50 text-gray-700 ring-gray-500/10' };
            return (
              <span
                key={level}
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.className}`}
              >
                {meta.label}
              </span>
            );
          })}
        </div>
      );
    },
  }),
  columnHelper.accessor('student_count', {
    header: 'Students',
    cell: (info) => (
      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
        {info.getValue() || 0} enrolled
      </span>
    ),
  }),
  columnHelper.accessor('is_active', {
    header: 'Status',
    cell: (info) => (
      <span
        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
          info.getValue()
            ? 'bg-green-50 text-green-700 ring-green-600/20'
            : 'bg-red-50 text-red-700 ring-red-600/10'
        }`}
      >
        {info.getValue() ? 'Active' : 'Suspended'}
      </span>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: (info) => <SchoolRowActions school={info.row.original} />,
  }),
];

export default function SchoolsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: schools, isLoading } = useSchools();

  return (
    <div className="space-y-6">

      {/* Page Header & Actions */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Schools Directory
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage all registered schools, tenants, and their active status on the platform.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Onboard School
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={schools || []} />
      )}

      {/* Registration Modal */}
      <SchoolModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}