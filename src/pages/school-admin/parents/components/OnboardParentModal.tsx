import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X, Search, UserPlus } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import { onboardParentSchema } from '@/schemas/parent.schema';
import type { OnboardParentFormValues } from '@/schemas/parent.schema';
import { useOnboardParent } from '@/hooks/useParents';
import { useStudents } from '@/hooks/useStudents';
import type { Student } from '@/types/student';

interface OnboardParentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardParentModal({ isOpen, onClose }: OnboardParentModalProps) {
  const { mutate: onboardParent, isPending } = useOnboardParent();
  
  // Combobox State
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebounce(searchInput, 400);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Fetch students based on search input
  const { data: studentsData, isLoading: isSearching } = useStudents({
    skip: 0,
    limit: 5, // Just show top 5 results for the dropdown
    search: debouncedSearch,
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue, trigger } = useForm<OnboardParentFormValues>({
    resolver: zodResolver(onboardParentSchema),
    defaultValues: { student_ids: [] }
  });

  // Keep the hidden form field synced with our visual selected students list
  useEffect(() => {
    setValue('student_ids', selectedStudents.map(s => s.id));
    if (selectedStudents.length > 0) trigger('student_ids'); // Clear validation error if fixed
  }, [selectedStudents, setValue, trigger]);

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    setSelectedStudents([]);
    setSearchInput('');
    onClose();
  };

  const onSubmit = (data: OnboardParentFormValues) => {
    onboardParent(data, { onSuccess: handleClose });
  };

  const addStudent = (student: Student) => {
    if (!selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents([...selectedStudents, student]);
    }
    setSearchInput('');
    setIsSearchOpen(false);
  };

  const removeStudent = (studentId: string) => {
    setSelectedStudents(selectedStudents.filter(s => s.id !== studentId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl my-8">
        
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-xl font-semibold text-gray-900">Onboard Parent / Guardian</h3>
          <button onClick={handleClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Parent Details */}
            <div>
              <h4 className="mb-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Parent Account Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">First Name <span className="text-red-500">*</span></label>
                  <input {...register('first_name')} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm" />
                  {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Last Name <span className="text-red-500">*</span></label>
                  <input {...register('last_name')} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm" />
                  {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name.message}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" {...register('email')} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm" />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Temporary Password <span className="text-red-500">*</span></label>
                  <input type="password" {...register('password')} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm" />
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Step 2: Student Linking (The Combobox) */}
            <div>
              <h4 className="mb-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Link to Students</h4>
              
              {/* Selected Students Visuals */}
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedStudents.map(student => (
                  <div key={student.id} className="flex items-center rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-sm text-blue-700">
                    <span className="font-medium mr-2">{student.first_name} {student.last_name}</span>
                    <span className="text-xs text-blue-500 mr-2">({student.admission_number})</span>
                    <button type="button" onClick={() => removeStudent(student.id)} className="text-blue-400 hover:text-blue-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Combobox Input */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    placeholder="Search by student name or admission number..."
                    className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />}
                </div>

                {/* Combobox Dropdown */}
                {isSearchOpen && searchInput && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    {studentsData?.items.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">No students found.</div>
                    ) : (
                      studentsData?.items.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => addStudent(student)}
                          className="flex w-full flex-col items-start px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                        >
                          <span className="font-medium text-gray-900">{student.first_name} {student.last_name}</span>
                          <span className="text-xs text-gray-500">Class: {student.class_name} • Adm: {student.admission_number}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              {/* Hidden array validation feedback */}
              {errors.student_ids && <p className="mt-2 text-xs text-red-500 font-medium">{errors.student_ids.message}</p>}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 border-t pt-4">
              <button type="button" onClick={handleClose} className="rounded-lg border bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="flex rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Create & Link Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}