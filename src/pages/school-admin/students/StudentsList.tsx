import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Search, User, Filter, Users } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import type { Student } from '@/types/student';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import StudentModal from './components/StudentModal';
import StudentRowActions from './components/StudentRowActions';

const columnHelper = createColumnHelper<Student>();

const columns = [
  columnHelper.accessor('first_name', {
    header: 'Student Name',
    cell: (info) => (
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
          <User className="h-4 w-4 text-gray-500" />
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {info.row.original.first_name} {info.row.original.last_name}
          </div>
          <div className="text-gray-500 text-xs">{info.row.original.email}</div>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor('admission_number', {
    header: 'Adm No.',
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
  }),
  columnHelper.accessor('class_name', {
    header: 'Class',
    cell: (info) => (
      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('enrollment_status', {
    header: 'Status',
    cell: (info) => {
      const status = info.getValue();
      const styles = {
        ACTIVE: 'bg-green-50 text-green-700 ring-green-600/20',
        GRADUATED: 'bg-blue-50 text-blue-700 ring-blue-600/20',
        TRANSFERRED: 'bg-orange-50 text-orange-700 ring-orange-600/20',
        EXPELLED: 'bg-red-50 text-red-700 ring-red-600/20',
        DROPPED_OUT: 'bg-gray-50 text-gray-700 ring-gray-600/20',
      };
      return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${styles[status]}`}>
          {status.replace('_', ' ')}
        </span>
      );
    },
  }),
  columnHelper.accessor('parents', {
    header: 'Linked Parents / Guardians',
    cell: (info) => {
      const parents = info.getValue();
      if (!parents || parents.length === 0) {
        return (
          <span className="inline-flex items-center text-xs text-gray-400 italic">
            <Users className="w-3 h-3 mr-1" /> Unlinked
          </span>
        );
      }
      return (
        <div className="space-y-1">
          {parents.map((p, idx) => (
            <div key={idx} className="text-sm text-gray-900">
              <span className="font-medium">{p.first_name} {p.last_name}</span>
              <span className="block text-xs text-gray-500">{p.email}</span>
            </div>
          ))}
        </div>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: (info) => <StudentRowActions student={info.row.original} />,
  }),
];

export default function StudentsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for Filters and Pagination
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  
  const [debouncedSearch] = useDebounce(searchInput, 500);
  const limit = 10;

  // Fetch classes for the filter dropdown
  const { data: classesData } = useClasses();

  // Fetch students based on filters
  const { data, isLoading } = useStudents({ 
    skip: page * limit, 
    limit, 
    search: debouncedSearch,
    class_id: selectedClassId
  });

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Student Roster
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage student admissions and classroom assignments.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Admit Student
          </button>
        </div>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-t-lg border-b border-gray-200 shadow-sm gap-4">
        
        {/* Search */}
        <div className="relative rounded-md shadow-sm w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
            placeholder="Search students..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(0); // Reset to page 0 when searching
            }}
          />
        </div>

        {/* Filter by Class */}
        <div className="relative w-full sm:max-w-xs flex items-center">
          <Filter className="h-4 w-4 text-gray-400 absolute left-3" />
          <select
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border bg-white"
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setPage(0); // Reset to page 0 when filtering
            }}
          >
            <option value="">All Classes</option>
            {classesData?.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} {cls.stream || ''}
              </option>
            ))}
          </select>
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

      <StudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}