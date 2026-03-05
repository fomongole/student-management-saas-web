import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, UserPlus, Power, PowerOff, GraduationCap } from 'lucide-react';
import type { School } from '@/types/school';
import { useUpdateSchool } from '@/hooks/useSchools';
import SchoolAdminModal from './SchoolAdminModal';
import SchoolLevelsModal from './SchoolLevelsModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function SchoolRowActions({ school }: { school: School }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLevelsModalOpen, setIsLevelsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Extract isPending so we can pass it to the ConfirmDialog's loading state
  const { mutate: updateSchool, isPending } = useUpdateSchool();

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // w-56 = 224px (Polished to match the other dropdowns)
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

  const handleStatusClick = () => {
    setIsOpen(false);
    setIsConfirmOpen(true);
  };

  const handleConfirmStatusChange = () => {
    updateSchool(
      { id: school.id, data: { is_active: !school.is_active } },
      { onSettled: () => setIsConfirmOpen(false) }
    );
  };

  return (
    <>
      <div className="flex justify-end">
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          aria-haspopup="true"
          aria-expanded={isOpen}
          className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {isOpen && createPortal(
          <div 
            ref={menuRef}
            style={{ top: menuCoords.top, left: menuCoords.left }}
            className="absolute z-[9999] w-56 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
          >
            <div className="py-1">

              {/* Assign Admin */}
              <button
                onClick={() => { setIsOpen(false); setIsAdminModalOpen(true); }}
                className="group flex w-full items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserPlus className="mr-3 h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                Assign Admin
              </button>

              {/* Update Academic Levels */}
              <button
                onClick={() => { setIsOpen(false); setIsLevelsModalOpen(true); }}
                className="group flex w-full items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <GraduationCap className="mr-3 h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                Update Levels
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              {/* Suspend / Activate */}
              <button
                onClick={handleStatusClick}
                className={`group flex w-full items-center px-4 py-2.5 text-sm font-bold transition-colors ${
                  school.is_active 
                    ? 'text-red-600 hover:bg-red-50' 
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {school.is_active ? (
                  <>
                    <PowerOff className="mr-3 h-4 w-4 text-red-500" />
                    Suspend School
                  </>
                ) : (
                  <>
                    <Power className="mr-3 h-4 w-4 text-emerald-500" />
                    Activate School
                  </>
                )}
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>

      <SchoolAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        school={school}
      />

      <SchoolLevelsModal
        isOpen={isLevelsModalOpen}
        onClose={() => setIsLevelsModalOpen(false)}
        school={school}
      />

      {/* Dynamic Confirmation Dialog for Suspend/Activate */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmStatusChange}
        title={school.is_active ? "Suspend School Account" : "Activate School Account"}
        message={
          <span>
            Are you sure you want to {school.is_active ? 'suspend' : 'activate'} <strong>{school.name}</strong>? 
            {school.is_active 
              ? " All users associated with this school will lose platform access immediately." 
              : " Users will regain full access to the platform."}
          </span>
        }
        confirmText={school.is_active ? "Yes, Suspend" : "Yes, Activate"}
        cancelText="Cancel"
        type={school.is_active ? "danger" : "info"}
        isLoading={isPending}
      />
    </>
  );
}