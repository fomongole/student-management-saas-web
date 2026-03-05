import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X, BookOpen, Search, CheckCircle2 } from 'lucide-react';
import { 
  assignSubjectsSchema, 
  type AssignSubjectsFormValues,
  type AssignSubjectsFormInput
} from '@/schemas/subject.schema';
import { useSubjects, useAssignSubjects } from '@/hooks/useSubjects';
import type { Teacher } from '@/types/teacher';

interface AssignSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
}

export default function AssignSubjectsModal({ isOpen, onClose, teacher }: AssignSubjectsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { mutate: assignSubjects, isPending } = useAssignSubjects();
  const { data: allSubjects, isLoading: isLoadingSubjects } = useSubjects();
  
  const {
    control,
    handleSubmit,
    reset,
    register,
  } = useForm<AssignSubjectsFormInput, any, AssignSubjectsFormValues>({
    resolver: zodResolver(assignSubjectsSchema),
    defaultValues: {
      teacher_id: '',
      subject_ids: [],
    },
  });

  useEffect(() => {
    if (isOpen && teacher) {
      const currentIds = teacher.assigned_subjects
        ?.map((s) => s.id)
        ?.filter(Boolean) || [];
      
      reset({
        teacher_id: teacher.id,
        subject_ids: currentIds,
      });
      setSearchTerm('');
    }
  }, [teacher, isOpen, reset]);

  const filteredSubjects = useMemo(() => {
    if (!allSubjects) return [];
    return allSubjects.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allSubjects, searchTerm]);

  if (!isOpen || !teacher) return null;

  const onSubmit = (data: AssignSubjectsFormValues) => {
    assignSubjects(data, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Assign Curriculum</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Managing subjects for <span className="font-semibold text-primary-700">{teacher.user.first_name} {teacher.user.last_name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register('teacher_id')} />
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by subject name or code..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative min-h-[300px]">
              {isLoadingSubjects ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  <p className="text-sm text-gray-500 font-medium">Loading school curriculum...</p>
                </div>
              ) : (
                <Controller
                  name="subject_ids"
                  control={control}
                  render={({ field }) => {
                    // 3. Explicitly cast field.value as string[] to resolve the "Property includes/filter does not exist" error
                    const selectedSubjectIds = (field.value as string[]) || [];
                    
                    return (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {filteredSubjects.length > 0 ? (
                            filteredSubjects.map((subject) => {
                              const isSelected = selectedSubjectIds.includes(subject.id);
                              
                              return (
                                <label
                                  key={subject.id}
                                  className={`relative flex items-center space-x-3 rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                                    isSelected ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        field.onChange([...selectedSubjectIds, subject.id]);
                                      } else {
                                        field.onChange(selectedSubjectIds.filter((id) => id !== subject.id));
                                      }
                                    }}
                                    className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-colors"
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <span className={`text-sm font-bold truncate ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                                      {subject.name}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-[10px] font-mono text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded">{subject.code}</span>
                                      <span className="text-[10px] text-gray-400 uppercase tracking-tight">{subject.level.replace('_', ' ')}</span>
                                    </div>
                                  </div>
                                  {isSelected && <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary-600" />}
                                </label>
                              );
                            })
                          ) : (
                            <div className="col-span-full py-20 text-center">
                              <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                              <p className="text-gray-500 text-sm">No subjects found matching "{searchTerm}"</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-4">
                          <div className="text-sm text-gray-500">
                            <span className="font-semibold text-gray-900">{selectedSubjectIds.length}</span> subjects selected
                          </div>
                          <div className="flex space-x-3">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isPending || isLoadingSubjects}
                              className="flex items-center justify-center min-w-[160px] rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-200 hover:bg-primary-700 disabled:opacity-50 transition-all"
                            >
                              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
                              Save Assignments
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  }}
                />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}