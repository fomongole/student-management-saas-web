import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import type { Subject } from '@/types/subject';
import { useDeleteSubject } from '@/hooks/useSubjects';
import EditSubjectModal from './EditSubjectModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function SubjectRowActions({ subject }: { subject: Subject }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { mutate: deleteSubject, isPending } = useDeleteSubject();

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // w-40 = 160px
      setMenuCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 160, 
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      if (isOpen) setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleScrollOrResize);
      window.addEventListener('scroll', handleScrollOrResize, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  const handleDeleteClick = () => {
    setIsOpen(false);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteSubject(subject.id, {
      onSettled: () => setIsConfirmOpen(false)
    });
  };

  return (
    <>
      <div className="flex justify-end">
        <button 
          ref={buttonRef}
          onClick={toggleMenu} 
          aria-haspopup="true"
          aria-expanded={isOpen}
          className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        
        {isOpen && createPortal(
          <div 
            ref={menuRef}
            style={{ top: menuCoords.top, left: menuCoords.left }}
            className="absolute z-[9999] w-40 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
          >
            <div className="py-1">
              <button 
                onClick={() => { setIsOpen(false); setIsEditModalOpen(true); }} 
                className="group flex w-full items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="mr-3 h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" /> 
                Edit Info
              </button>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button 
                onClick={handleDeleteClick} 
                className="group flex w-full items-center px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="mr-3 h-4 w-4 text-red-500" /> 
                Delete
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>

      <EditSubjectModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} subjectData={subject} />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Subject"
        message={<span>Are you sure you want to delete the subject <strong>{subject.name} ({subject.code})</strong>? This will remove it from all assigned teachers and classes.</span>}
        confirmText="Yes, Delete Subject"
        cancelText="Cancel"
        type="danger"
        isLoading={isPending}
      />
    </>
  );
}