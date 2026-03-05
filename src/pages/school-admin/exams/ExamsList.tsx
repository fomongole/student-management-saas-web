import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, FileText } from 'lucide-react';

import { useExams } from '@/hooks/useExams';
import { useSubjects } from '@/hooks/useSubjects';
import type { Exam } from '@/types/exam';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import ExamModal from './components/ExamModal';
import ExamRowActions from './components/ExamRowActions';

const columnHelper = createColumnHelper<Exam>();

export default function ExamsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: exams, isLoading: loadingExams } = useExams();
  const { data: subjects, isLoading: loadingSubjects } = useSubjects();

  const getSubjectName = (id: string) => {
    return subjects?.find(s => s.id === id)?.name || 'Unknown Subject';
  };

  const columns = [
    columnHelper.accessor('name', {
      header: 'Exam Session',
      cell: (info) => (
        <div className="flex items-center font-bold text-gray-900">
          <FileText className="h-4 w-4 mr-2 text-primary-500" /> {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('subject_id', {
      header: 'Subject',
      cell: (info) => (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
          {getSubjectName(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor('term', {
      header: 'Term',
      cell: (info) => `Term ${info.getValue()}`,
    }),
    columnHelper.accessor('year', {
      header: 'Year',
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => <ExamRowActions exam={info.row.original} />,
    }),
  ];

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exam Sessions</h2>
          <p className="mt-1 text-sm text-gray-500">Manage school-wide examinations and assessments.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary-200 hover:bg-primary-700 transition-colors">
          <Plus className="-ml-0.5 mr-1.5 h-5 w-5" /> New Exam
        </button>
      </div>

      {loadingExams || loadingSubjects ? (
        <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
      ) : (
        <DataTable columns={columns} data={exams || []} />
      )}

      <ExamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}