import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, BookOpen, Trash2 } from 'lucide-react';
import type { Teacher } from '@/types/teacher';
import { useDeleteTeacher } from '@/hooks/useTeachers';
import EditTeacherModal from './EditTeacherModal';
import AssignSubjectsModal from './AssignSubjectsModal';

export default function TeacherRowActions({ teacher }: { teacher: Teacher }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { mutate: deleteTeacher } = useDeleteTeacher();

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
    if (window.confirm(`Are you sure you want to permanently remove ${teacher.user.first_name} ${teacher.user.last_name}? Their access will be revoked immediately.`)) {
      deleteTeacher(teacher.id);
    }
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative flex justify-end" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-10 z-50 w-56 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
            <div className="py-1">
              <button
                onClick={() => { setIsOpen(false); setIsAssignModalOpen(true); }}
                className="group flex w-full items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <BookOpen className="mr-3 h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                Assign Subjects
              </button>

              <button
                onClick={() => { setIsOpen(false); setIsEditModalOpen(true); }}
                className="group flex w-full items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="mr-3 h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                Edit Profile
              </button>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                onClick={handleDelete}
                className="group flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors"
              >
                <Trash2 className="mr-3 h-4 w-4 text-red-500" />
                Remove Staff
              </button>
            </div>
          </div>
        )}
      </div>

      <EditTeacherModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        teacher={teacher} 
      />

      <AssignSubjectsModal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        teacher={teacher} 
      />
    </>
  );
}