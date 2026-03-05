import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, UserPlus, Power, PowerOff, GraduationCap } from 'lucide-react';
import type { School } from '@/types/school';
import { useUpdateSchool } from '@/hooks/useSchools';
import SchoolAdminModal from './SchoolAdminModal';
import SchoolLevelsModal from './SchoolLevelsModal';

export default function SchoolRowActions({ school }: { school: School }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLevelsModalOpen, setIsLevelsModalOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { mutate: updateSchool } = useUpdateSchool();

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // w-52 = 208px
      setMenuCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 208, 
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

  const handleToggleStatus = () => {
    updateSchool({ id: school.id, data: { is_active: !school.is_active } });
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex justify-end">
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className="p-1 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {isOpen && createPortal(
          <div 
            ref={menuRef}
            style={{ top: menuCoords.top, left: menuCoords.left }}
            className="absolute z-[9999] w-52 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
          >
            <div className="py-1">

              {/* Assign Admin */}
              <button
                onClick={() => { setIsOpen(false); setIsAdminModalOpen(true); }}
                className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <UserPlus className="mr-3 h-4 w-4 text-gray-400 group-hover:text-primary-500" />
                Assign Admin
              </button>

              {/* Update Academic Levels */}
              <button
                onClick={() => { setIsOpen(false); setIsLevelsModalOpen(true); }}
                className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <GraduationCap className="mr-3 h-4 w-4 text-gray-400 group-hover:text-primary-500" />
                Update Levels
              </button>

              {/* Suspend / Activate */}
              <button
                onClick={handleToggleStatus}
                className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                {school.is_active ? (
                  <>
                    <PowerOff className="mr-3 h-4 w-4 text-gray-400 group-hover:text-red-500" />
                    Suspend School
                  </>
                ) : (
                  <>
                    <Power className="mr-3 h-4 w-4 text-gray-400 group-hover:text-green-500" />
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
    </>
  );
}