import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import type { Subject } from '@/types/subject';
import { useDeleteSubject } from '@/hooks/useSubjects';
import EditSubjectModal from './EditSubjectModal';

export default function SubjectRowActions({ subject }: { subject: Subject }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { mutate: deleteSubject } = useDeleteSubject();

  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(ev.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative flex justify-end" ref={dropdownRef}>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full">
          <MoreVertical className="h-5 w-5" />
        </button>
        {isOpen && (
          <div className="absolute right-0 top-8 z-10 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <button onClick={() => { setIsOpen(false); setIsEditModalOpen(true); }} className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Edit className="mr-3 h-4 w-4 text-gray-400" /> Edit
              </button>
              <button 
                onClick={() => window.confirm('Delete subject?') && deleteSubject(subject.id)} 
                className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-3 h-4 w-4 text-red-500" /> Delete
              </button>
            </div>
          </div>
        )}
      </div>
      <EditSubjectModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} subjectData={subject} />
    </>
  );
}