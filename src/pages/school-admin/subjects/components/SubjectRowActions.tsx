import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import type { Subject } from '@/types/subject';
import { useDeleteSubject } from '@/hooks/useSubjects';
import EditSubjectModal from './EditSubjectModal';

export default function SubjectRowActions({ subject }: { subject: Subject }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mutate: deleteSubject } = useDeleteSubject();

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

  return (
    <>
      <div className="flex justify-end">
        <button 
          ref={buttonRef}
          onClick={toggleMenu} 
          className="p-1 text-gray-400 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        
        {isOpen && createPortal(
          <div 
            ref={menuRef}
            style={{ top: menuCoords.top, left: menuCoords.left }}
            className="absolute z-[9999] w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
          >
            <div className="py-1">
              <button onClick={() => { setIsOpen(false); setIsEditModalOpen(true); }} className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Edit className="mr-3 h-4 w-4 text-gray-400 group-hover:text-primary-500" /> Edit
              </button>
              <button 
                onClick={() => { setIsOpen(false); window.confirm('Delete subject?') && deleteSubject(subject.id); }} 
                className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-3 h-4 w-4 text-red-500" /> Delete
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>
      <EditSubjectModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} subjectData={subject} />
    </>
  );
}