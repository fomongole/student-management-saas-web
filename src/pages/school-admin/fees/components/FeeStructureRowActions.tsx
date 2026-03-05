import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit } from 'lucide-react';
import type { FeeStructure } from '@/types/fee';
import EditFeeStructureModal from './EditFeeStructureModal';

export default function FeeStructureRowActions({ feeStructure }: { feeStructure: FeeStructure }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full">
          <MoreVertical className="h-5 w-5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-8 z-10 w-32 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <button onClick={() => { setIsOpen(false); setIsEditModalOpen(true); }} className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Edit className="mr-3 h-4 w-4 text-gray-400" /> Edit
              </button>
            </div>
          </div>
        )}
      </div>

      <EditFeeStructureModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} feeStructure={feeStructure} />
    </>
  );
}