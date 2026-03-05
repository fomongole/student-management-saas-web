import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit, BookOpen, Trash2 } from 'lucide-react';
import type { Teacher } from '@/types/teacher';
import { useDeleteTeacher } from '@/hooks/useTeachers';
import EditTeacherModal from './EditTeacherModal';
import AssignSubjectsModal from './AssignSubjectsModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function TeacherRowActions({ teacher }: { teacher: Teacher }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // State to hold the exact coordinates for our Portal menu
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { mutate: deleteTeacher, isPending } = useDeleteTeacher();

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Calculate coordinates: Just below the button, aligning the right edge of the 224px (w-56) menu to the right edge of the button
      setMenuCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 224, 
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

    // If the user scrolls or resizes while the menu is open, close it so it doesn't float away
    function handleScrollOrResize() {
      if (isOpen) setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleScrollOrResize);
      // Capture true ensures we catch scroll events on any scrollable parent container
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
    deleteTeacher(teacher.id, {
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

        {/* The Portal teleports this menu to the end of the document body! */}
        {isOpen && createPortal(
          <div 
            ref={menuRef}
            style={{ top: menuCoords.top, left: menuCoords.left }}
            className="absolute z-[9999] w-56 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
          >
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
                onClick={handleDeleteClick}
                className="group flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors"
              >
                <Trash2 className="mr-3 h-4 w-4 text-red-500" />
                Remove Staff
              </button>
            </div>
          </div>,
          document.body // Append to the body
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

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Staff Member"
        message={<span>Are you sure you want to permanently remove <strong>{teacher.user.first_name} {teacher.user.last_name}</strong>? Their portal access will be revoked immediately and they will be unassigned from all subjects.</span>}
        confirmText="Yes, Remove Staff"
        cancelText="Cancel"
        type="danger"
        isLoading={isPending}
      />
    </>
  );
}