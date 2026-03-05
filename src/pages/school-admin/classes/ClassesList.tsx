// src/pages/school-admin/classes/ClassesList.tsx
import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, BookOpen } from 'lucide-react';

import { useClasses } from '@/hooks/useClasses';
import type { Class } from '@/types/class';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import ClassModal from './components/ClassModal';
import ClassRowActions from './components/ClassRowActions';

const columnHelper = createColumnHelper<Class>();

const LEVEL_LABELS: Record<string, string> = {
  NURSERY: 'Nursery',
  PRIMARY: 'Primary',
  O_LEVEL: 'O-Level',
  A_LEVEL: 'A-Level',
};

const CATEGORY_STYLES: Record<string, string> = {
  SCIENCES: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  ARTS: 'bg-purple-50 text-purple-700 ring-purple-600/20',
};

const columns = [
  columnHelper.accessor('name', {
    header: 'Class / Stream',
    cell: (info) => (
      <div className="flex items-center">
        <div className="h-8 w-8 flex-shrink-0 rounded-md bg-purple-100 flex items-center justify-center mr-3">
          <BookOpen className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {info.getValue()} {info.row.original.stream || ''}
          </div>
          {/* Show category badge inline under the name for A-Level rows */}
          {info.row.original.category && (
            <span
              className={`mt-0.5 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${CATEGORY_STYLES[info.row.original.category]}`}
            >
              {info.row.original.category === 'SCIENCES' ? '🔬' : '🎨'}{' '}
              {info.row.original.category}
            </span>
          )}
        </div>
      </div>
    ),
  }),
  columnHelper.accessor('level', {
    header: 'Academic Level',
    cell: (info) => (
      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
        {LEVEL_LABELS[info.getValue()] ?? info.getValue().replace('_', ' ')}
      </span>
    ),
  }),
  columnHelper.accessor('capacity', {
    header: 'Capacity',
    cell: (info) => info.getValue() || <span className="text-gray-400 italic">No limit</span>,
  }),
  columnHelper.accessor('form_teacher_id', {
    header: 'Form Teacher',
    cell: (info) => {
      const teacherObj = info.row.original.form_teacher;
      return teacherObj ? (
        <span className="text-gray-900 font-medium text-sm">
          {teacherObj.user.first_name} {teacherObj.user.last_name}
        </span>
      ) : (
        <span className="text-gray-400 text-sm italic">Unassigned</span>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: (info) => <ClassRowActions classData={info.row.original} />,
  }),
];

export default function ClassesList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: classes, isLoading } = useClasses();

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Academics Setup
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage classes, streams, and assign form teachers.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Create Class
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={classes || []} />
      )}

      <ClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}