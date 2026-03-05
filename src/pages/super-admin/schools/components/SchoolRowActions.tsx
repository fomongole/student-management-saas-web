// src/pages/super-admin/schools/components/SchoolRowActions.tsx
import { useState, useRef, useEffect } from 'react';
import { MoreVertical, UserPlus, Power, PowerOff, GraduationCap } from 'lucide-react';
import type { School } from '@/types/school';
import { useUpdateSchool } from '@/hooks/useSchools';
import SchoolAdminModal from './SchoolAdminModal';
import SchoolLevelsModal from './SchoolLevelsModal';

export default function SchoolRowActions({ school }: { school: School }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLevelsModalOpen, setIsLevelsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { mutate: updateSchool } = useUpdateSchool();

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleStatus = () => {
    updateSchool({ id: school.id, data: { is_active: !school.is_active } });
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative flex justify-end" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100 focus:outline-none"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-8 z-10 w-52 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
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
          </div>
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