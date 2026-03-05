import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Users } from 'lucide-react';

import { useParents } from '@/hooks/useParents';
import type { Parent } from '@/types/parent';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import OnboardParentModal from './components/OnboardParentModal';
import ParentRowActions from './components/ParentRowActions';

const columnHelper = createColumnHelper<Parent>();

const columns = [
  columnHelper.accessor('first_name', {
    header: 'Parent/Guardian Name',
    cell: (info) => (
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
          <Users className="h-4 w-4 text-purple-600" />
        </div>
        <div className="font-medium text-gray-900">
          {info.row.original.first_name} {info.row.original.last_name}
        </div>
      </div>
    ),
  }),
  columnHelper.accessor('email', {
    header: 'Email Address',
    cell: (info) => <span className="text-gray-500 text-sm">{info.getValue()}</span>,
  }),
  // ✅ NEW: Displaying Children
  columnHelper.accessor('children', {
    header: 'Linked Students',
    cell: (info) => {
      const children = info.getValue() || [];
      if (children.length === 0) return <span className="text-gray-400 italic text-xs">No students linked</span>;
      return (
        <div className="flex flex-wrap gap-1 max-w-[250px]">
          {children.map(child => (
            <span key={child.student_id} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10 whitespace-nowrap">
              {child.first_name} {child.last_name} ({child.class_name})
            </span>
          ))}
        </div>
      );
    }
  }),
  columnHelper.accessor('is_active', {
    header: 'Status',
    cell: (info) => (
      info.getValue() ? (
        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700 ring-1 ring-inset ring-green-600/20 uppercase">
          Active
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700 ring-1 ring-inset ring-red-600/10 uppercase">
          Suspended
        </span>
      )
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: (info) => <ParentRowActions parent={info.row.original} />,
  }),
];

export default function ParentsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: parents, isLoading } = useParents();

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Parent Directory
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage guardian portal accounts and student linkages.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Onboard Parent
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={parents || []} />
      )}

      <OnboardParentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}