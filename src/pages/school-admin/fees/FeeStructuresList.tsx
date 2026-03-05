import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Banknote, Globe2 } from 'lucide-react';

import { useFeeStructures } from '@/hooks/useFees';
import { useClasses } from '@/hooks/useClasses';
import type { FeeStructure } from '@/types/fee';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import FeeStructureModal from './components/FeeStructureModal';
import FeeStructureRowActions from './components/FeeStructureRowActions';

const columnHelper = createColumnHelper<FeeStructure>();

export default function FeeStructuresList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: fees, isLoading } = useFeeStructures();
  const { data: classes } = useClasses();

  // Helper to get class name if it's not a global fee
  const getClassName = (classId: string | null) => {
    if (!classId) return <span className="flex items-center text-blue-600 font-medium text-xs"><Globe2 className="w-3 h-3 mr-1"/> Global (All Students)</span>;
    const cls = classes?.find(c => c.id === classId);
    return cls ? <span className="text-gray-700 text-xs font-medium">{cls.name} {cls.stream || ''}</span> : 'Unknown Class';
  };

  const columns = [
    columnHelper.accessor('name', {
      header: 'Fee Item',
      cell: (info) => (
        <div className="flex items-center font-medium text-gray-900">
          <div className="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center mr-3">
            <Banknote className="h-4 w-4 text-green-600" />
          </div>
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('amount', {
      header: 'Amount (UGX)',
      cell: (info) => <span className="font-mono text-sm font-semibold">{info.getValue().toLocaleString()}</span>,
    }),
    columnHelper.accessor('class_id', {
      header: 'Applies To',
      cell: (info) => getClassName(info.getValue()),
    }),
    columnHelper.display({
      id: 'term_year',
      header: 'Term / Year',
      cell: (info) => <span className="text-gray-500 text-sm">Term {info.row.original.term}, {info.row.original.year}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => <FeeStructureRowActions feeStructure={info.row.original} />,
    }),
  ];

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fee Structures</h2>
          <p className="mt-1 text-sm text-gray-500">Define the billable items for your school's terms.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
          <Plus className="-ml-0.5 mr-1.5 h-5 w-5" /> New Fee Item
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
      ) : (
        <DataTable columns={columns} data={fees || []} />
      )}

      <FeeStructureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}