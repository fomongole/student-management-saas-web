import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Banknote, UserMinus } from 'lucide-react';
import type { Student } from '@/types/student';
import EditStudentModal from './EditStudentModal';
import StudentFinancialsModal from './StudentFinancialsModal';
import ChangeStatusModal from './ChangeStatusModal';

export default function StudentRowActions({ student }: { student: Student }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFinancialsOpen, setIsFinancialsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                onClick={() => { setIsOpen(false); setIsFinancialsOpen(true); }} 
                className="group flex w-full items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Banknote className="mr-3 h-4 w-4 text-emerald-600 group-hover:text-emerald-700 transition-colors" /> 
                Financials
              </button>

              <button 
                onClick={() => { setIsOpen(false); setIsEditModalOpen(true); }} 
                className="group flex w-full items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="mr-3 h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" /> 
                Edit Info
              </button>

              <div className="border-t border-gray-100 my-1"></div>
              
              <button 
                onClick={() => { setIsOpen(false); setIsStatusOpen(true); }} 
                className="group flex w-full items-center px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 font-bold transition-colors"
              >
                <UserMinus className="mr-3 h-4 w-4 text-orange-500" /> 
                Change Status
              </button>

            </div>
          </div>
        )}
      </div>

      <EditStudentModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} student={student} />
      <StudentFinancialsModal isOpen={isFinancialsOpen} onClose={() => setIsFinancialsOpen(false)} student={student} />
      <ChangeStatusModal isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} student={student} />
    </>
  );
}