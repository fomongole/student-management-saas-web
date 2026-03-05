import { useState, useEffect } from 'react';
import { Loader2, Save, BookOpen, FileText, Users, AlertCircle } from 'lucide-react';
import { useExams, useMarkSheet, useSubmitMarks } from '@/hooks/useExams';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';

export default function MarkSheetEntry() {
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  
  const [marksData, setMarksData] = useState<Record<string, { score: string; comment: string }>>({});

  const { data: subjects } = useSubjects();
  const { data: classes } = useClasses();
  
  const { data: filteredExams } = useExams(undefined, undefined, selectedSubjectId || undefined);
  const { data: markSheet, isLoading: isLoadingSheet, isFetching } = useMarkSheet(selectedExamId, selectedClassId);
  const { mutate: submitMarks, isPending: isSaving } = useSubmitMarks();

  useEffect(() => {
    setSelectedExamId('');
  }, [selectedSubjectId]);

  useEffect(() => {
    setSelectedClassId('');
  }, [selectedExamId]);

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

    // Optional: Basic front-end validation check
    const invalidScores = payloadResults.filter(r => r.score < 0 || r.score > 100);
    if(invalidScores.length > 0) return alert("Some scores are invalid (must be 0-100). Please correct them.");

    submitMarks({ exam_id: selectedExamId, class_id: selectedClassId, results: payloadResults });
  };

  // Helper to visually flag bad data entry
  const isScoreInvalid = (val: string) => {
    if (!val) return false;
    const num = parseFloat(val);
    return isNaN(num) || num < 0 || num > 100;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Mark Sheet Entry</h2>
        <p className="mt-1 text-sm text-gray-500">Select parameters to load the roster, then enter student scores.</p>
      </div>

      {/* Stepper Selectors */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
        {/* Decorative background line connecting steps */}
        <div className="hidden md:block absolute top-[4.5rem] left-[16%] right-[16%] h-0.5 bg-gray-100 z-0"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          
          {/* Step 1 */}
          <div className="relative bg-white">
            <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 mr-2 text-xs">1</span>
              Subject
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select 
                value={selectedSubjectId} 
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="block w-full rounded-lg border-gray-300 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2.5 transition-colors"
              >
                <option value="">-- Select Subject --</option>
                {subjects?.map(sub => <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>)}
              </select>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative bg-white">
            <label className={`flex items-center text-sm font-semibold mb-3 ${selectedSubjectId ? 'text-gray-800' : 'text-gray-400'}`}>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs transition-colors ${selectedSubjectId ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-400'}`}>2</span>
              Exam Session
            </label>
            <div className="relative">
              <FileText className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${selectedSubjectId ? 'text-gray-400' : 'text-gray-300'}`} />
              <select 
                value={selectedExamId} 
                onChange={(e) => setSelectedExamId(e.target.value)}
                disabled={!selectedSubjectId}
                className="block w-full rounded-lg border-gray-300 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2.5 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 transition-colors"
              >
                <option value="">-- Select Exam --</option>
                {filteredExams?.map(ex => <option key={ex.id} value={ex.id}>{ex.name} (Term {ex.term} - {ex.year})</option>)}
              </select>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative bg-white">
            <label className={`flex items-center text-sm font-semibold mb-3 ${selectedExamId ? 'text-gray-800' : 'text-gray-400'}`}>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs transition-colors ${selectedExamId ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-400'}`}>3</span>
              Class Group
            </label>
            <div className="relative">
              <Users className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${selectedExamId ? 'text-gray-400' : 'text-gray-300'}`} />
              <select 
                value={selectedClassId} 
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={!selectedExamId}
                className="block w-full rounded-lg border-gray-300 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2.5 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 transition-colors"
              >
                <option value="">-- Select Class --</option>
                {classes?.map(cls => <option key={cls.id} value={cls.id}>{cls.name} {cls.stream || ''}</option>)}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Roster Grid */}
      {selectedExamId && selectedClassId && (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden relative flex flex-col">
          {isFetching && !isLoadingSheet && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                <span className="text-sm font-medium text-gray-700">Syncing roster...</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50/80">
            <h3 className="font-semibold text-gray-800 flex items-center">
              Class Roster <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">{markSheet?.length || 0}</span>
            </h3>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary-700 disabled:opacity-50 shadow-sm shadow-primary-200 transition-all"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Mark Sheet
            </button>
          </div>

          <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white sticky top-0 z-20 shadow-sm">
                <tr>
                  <th className="py-3.5 pl-5 pr-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Adm No.</th>
                  <th className="px-3 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-3 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-40">Score (100%)</th>
                  <th className="px-3 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Teacher Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoadingSheet ? (
                  <tr><td colSpan={4} className="p-12 text-center text-gray-500"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" /></td></tr>
                ) : markSheet?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No students enrolled in this class.</p>
                    </td>
                  </tr>
                ) : (
                  markSheet?.map((student, idx) => {
                    const currentScore = marksData[student.student_id]?.score || '';
                    const hasError = isScoreInvalid(currentScore);

                    return (
                      <tr key={student.student_id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="whitespace-nowrap py-3 pl-5 pr-3 text-sm font-mono text-gray-500">
                          {student.admission_number}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm font-bold text-gray-900">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 relative">
                          <input
                            type="number" min="0" max="100" step="0.1"
                            tabIndex={idx + 1} // Optimizes tabbing vertically down the scores
                            value={currentScore}
                            onChange={(e) => handleScoreChange(student.student_id, e.target.value)}
                            className={`block w-full rounded-lg py-2 px-3 text-sm font-medium shadow-sm transition-colors focus:ring-2 focus:ring-offset-0 ${
                              hasError 
                                ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-200' 
                                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                            }`}
                            placeholder="0-100"
                          />
                          {hasError && <AlertCircle className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none" />}
                        </td>
                        <td className="px-3 py-2 pr-5">
                          <input
                            type="text"
                            tabIndex={1000 + idx} // Keeps comments separate from score tabbing flow
                            value={marksData[student.student_id]?.comment || ''}
                            onChange={(e) => handleCommentChange(student.student_id, e.target.value)}
                            className="block w-full rounded-lg border-gray-300 py-2 px-3 text-sm focus:border-primary-500 focus:ring-primary-200 focus:ring-2 shadow-sm transition-colors"
                            placeholder="e.g. Excellent work"
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}