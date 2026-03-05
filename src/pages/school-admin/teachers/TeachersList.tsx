// src/pages/admin/teachers/TeachersList.tsx
import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Search, UserCircle2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import { useTeachers } from '@/hooks/useTeachers';
import type { Teacher } from '@/types/teacher';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import TeacherModal from './components/TeacherModal';
import TeacherRowActions from './components/TeacherRowActions';

const columnHelper = createColumnHelper<Teacher>();

const columns = [
  columnHelper.accessor('user', {
    header: 'Teacher Name',
    cell: (info) => (
      <div className="flex items-center">
        <UserCircle2 className="h-8 w-8 text-gray-400 mr-3" />
        <div>
          <div className="font-medium text-gray-900">
            {info.getValue().first_name} {info.getValue().last_name}
          </div>
          <div className="text-gray-500 text-xs">{info.getValue().email}</div>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor('employee_number', {
    header: 'Emp No.',
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
  }),

  columnHelper.accessor('assigned_subjects', {
    header: 'Current Load',
    cell: (info) => {
      const subjects = info.getValue() || [];
      return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {subjects.length > 0 ? (
            subjects.map((sub) => (
              <span 
                key={sub.id} 
                className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-700 ring-1 ring-inset ring-primary-700/10 uppercase"
                title={sub.name}
              >
                {sub.code}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-[11px] italic">No subjects assigned</span>
          )}
        </div>
      );
    },
  }),
  
  columnHelper.accessor('qualification', {
    header: 'Qualification',
    cell: (info) => info.getValue() || <span className="text-gray-400 italic">Not set</span>,
  }),
  columnHelper.accessor('specialization', {
    header: 'Specialization',
    cell: (info) => info.getValue() || <span className="text-gray-400 italic">Not set</span>,
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: (info) => <TeacherRowActions teacher={info.row.original} />,
  }),
];

export default function TeachersList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination & Search State
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  
  // Debounce the search input so we don't spam the API on every keystroke
  const [debouncedSearch] = useDebounce(searchInput, 500);
  const limit = 10;

  const { data, isLoading } = useTeachers({ 
    skip: page * limit, 
    limit, 
    search: debouncedSearch 
  });

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Staff Directory
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage all teachers, credentials, and subjects assignments.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Toolbar: Search */}
      <div className="flex justify-between items-center bg-white p-4 rounded-t-lg border-b border-gray-200 shadow-sm">
        <div className="relative rounded-md shadow-sm max-w-sm w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
            placeholder="Search name or emp no..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(0); // Reset to page 0 when searching
            }}
          />
        </div>
      </div>

      {/* Table Area */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={data?.items || []} />
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 shadow-sm rounded-b-lg">
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page * limit) + 1}</span> to <span className="font-medium">{Math.min((page + 1) * limit, data?.total || 0)}</span> of{' '}
              <span className="font-medium">{data?.total || 0}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data || (page + 1) * limit >= data.total}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>

      <TeacherModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}