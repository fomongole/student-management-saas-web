import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import type { Exam } from '@/types/exam';
import { useDeleteExam } from '@/hooks/useExams';
import EditExamModal from './EditExamModal';

export default function ExamRowActions({ exam }: { exam: Exam }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { mutate: deleteExam } = useDeleteExam();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${exam.name}"? If any student marks exist for this session, the deletion will be safely blocked.`)) {
      deleteExam(exam.id);
    }
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative flex justify-end" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-8 z-10 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <button
                onClick={() => { setIsOpen(false); setIsEditModalOpen(true); }}
                className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="mr-3 h-4 w-4 text-gray-400 group-hover:text-primary-500" />
                Edit Session
              </button>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                onClick={handleDelete}
                className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
              >
                <Trash2 className="mr-3 h-4 w-4 text-red-500" />
                Delete Session
              </button>
            </div>
          </div>
        )}
      </div>

      <EditExamModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} exam={exam} />
    </>
  );
}