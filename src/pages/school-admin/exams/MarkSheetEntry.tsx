import { useState, useEffect } from 'react';
import { Loader2, Save, ArrowRight } from 'lucide-react';
import { useExams, useMarkSheet, useSubmitMarks } from '@/hooks/useExams';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';

export default function MarkSheetEntry() {
  // Cascading Selection State
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  
  const [marksData, setMarksData] = useState<Record<string, { score: string; comment: string }>>({});

  const { data: subjects } = useSubjects();
  const { data: classes } = useClasses();
  
  // ✅ Fetch exams ONLY for the selected subject!
  const { data: filteredExams } = useExams(undefined, undefined, selectedSubjectId || undefined);
  
  const { data: markSheet, isLoading: isLoadingSheet, isFetching } = useMarkSheet(selectedExamId, selectedClassId);
  const { mutate: submitMarks, isPending: isSaving } = useSubmitMarks();

  // Reset trailing dropdowns when parent changes
  useEffect(() => {
    setSelectedExamId('');
  }, [selectedSubjectId]);

  useEffect(() => {
    if (markSheet) {
      const initialData: Record<string, { score: string; comment: string }> = {};
      markSheet.forEach(student => {
        initialData[student.student_id] = {
          score: student.score !== null ? student.score.toString() : '',
          comment: student.teacher_comment || '',
        };
      });
      setMarksData(initialData);
    }
  }, [markSheet]);

  const handleScoreChange = (studentId: string, val: string) => {
    setMarksData(prev => ({ ...prev, [studentId]: { ...prev[studentId], score: val } }));
  };

  const handleCommentChange = (studentId: string, val: string) => {
    setMarksData(prev => ({ ...prev, [studentId]: { ...prev[studentId], comment: val } }));
  };

  const handleSave = () => {
    const payloadResults = Object.entries(marksData)
      .filter(([_, data]) => data.score !== '')
      .map(([studentId, data]) => ({
        student_id: studentId,
        score: parseFloat(data.score),
        teacher_comment: data.comment || null
      }));

    if (payloadResults.length === 0) return alert("Please enter at least one score before saving.");

    submitMarks({ exam_id: selectedExamId, class_id: selectedClassId, results: payloadResults });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mark Sheet Entry</h2>
        <p className="mt-1 text-sm text-gray-500">Follow the steps below to securely enter student scores.</p>
      </div>

      {/* Logical Stepper Selectors */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          
          {/* Step 1 */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">1. Select Subject</label>
            <select 
              value={selectedSubjectId} 
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2.5"
            >
              <option value="">-- Choose Subject --</option>
              {subjects?.map(sub => <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>)}
            </select>
            <ArrowRight className="hidden md:block absolute -right-4 top-10 h-5 w-5 text-gray-300" />
          </div>

          {/* Step 2 */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">2. Select Exam Session</label>
            <select 
              value={selectedExamId} 
              onChange={(e) => setSelectedExamId(e.target.value)}
              disabled={!selectedSubjectId}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2.5 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">-- Choose Exam --</option>
              {filteredExams?.map(ex => <option key={ex.id} value={ex.id}>{ex.name} (Term {ex.term} - {ex.year})</option>)}
            </select>
            <ArrowRight className="hidden md:block absolute -right-4 top-10 h-5 w-5 text-gray-300" />
          </div>

          {/* Step 3 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">3. Select Class</label>
            <select 
              value={selectedClassId} 
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={!selectedExamId}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2.5 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">-- Choose Class --</option>
              {classes?.map(cls => <option key={cls.id} value={cls.id}>{cls.name} {cls.stream || ''}</option>)}
            </select>
          </div>

        </div>
      </div>

      {/* The Grid */}
      {selectedExamId && selectedClassId && (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden relative">
          {isFetching && !isLoadingSheet && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          )}

          <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Student Roster</h3>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary-700 disabled:opacity-50 shadow-sm shadow-primary-200 transition-all"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Mark Sheet
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Adm No.</th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Score (100%)</th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoadingSheet ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></td></tr>
                ) : markSheet?.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No students found in this class.</td></tr>
                ) : (
                  markSheet?.map((student) => (
                    <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-mono text-gray-500">
                        {student.admission_number}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm font-bold text-gray-900">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <input
                          type="number" min="0" max="100" step="0.1"
                          value={marksData[student.student_id]?.score || ''}
                          onChange={(e) => handleScoreChange(student.student_id, e.target.value)}
                          className="block w-full rounded-lg border-gray-300 py-2 px-3 text-sm focus:border-primary-500 focus:ring-primary-500 shadow-sm"
                          placeholder="0-100"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={marksData[student.student_id]?.comment || ''}
                          onChange={(e) => handleCommentChange(student.student_id, e.target.value)}
                          className="block w-full rounded-lg border-gray-300 py-2 px-3 text-sm focus:border-primary-500 focus:ring-primary-500 shadow-sm"
                          placeholder="e.g. Excellent work"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}