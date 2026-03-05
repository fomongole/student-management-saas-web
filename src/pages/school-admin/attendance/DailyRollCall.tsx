import { useState, useEffect } from 'react';
import { Loader2, Save, CalendarDays, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useClasses } from '@/hooks/useClasses';
import { useClassRollCall, useSubmitAttendance } from '@/hooks/useAttendance';
import type { AttendanceStatus } from '@/types/attendance';

export default function DailyRollCall() {
  // Filters
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today: YYYY-MM-DD
  
  // Local state to hold the attendance marks before saving
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});

  const { data: classes } = useClasses();
  
  // Fetch the students and their existing attendance when class and date are selected
  const { data: rollCallList, isLoading: isLoadingRollCall, isFetching } = useClassRollCall(selectedClassId, selectedDate);
  const { mutate: submitAttendance, isPending: isSaving } = useSubmitAttendance();

  // Populate local state when the backend data changes
  useEffect(() => {
    if (rollCallList) {
      const initialData: Record<string, { status: AttendanceStatus; remarks: string }> = {};
      rollCallList.forEach(student => {
        // If a student doesn't have a status yet, default them to 'PRESENT' for faster data entry
        initialData[student.student_id] = {
          status: student.status || 'PRESENT',
          remarks: student.remarks || '',
        };
      });
      setAttendanceData(initialData);
    }
  }, [rollCallList]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: { ...prev[studentId], remarks } }));
  };

  const handleSave = () => {
    const payloadRecords = Object.entries(attendanceData).map(([studentId, data]) => ({
      student_id: studentId,
      status: data.status,
      remarks: data.remarks || null
    }));

    if (payloadRecords.length === 0) return alert("No students in this class to mark.");

    submitAttendance({
      class_id: selectedClassId,
      attendance_date: selectedDate,
      subject_id: null, // For daily attendance, subject is null
      records: payloadRecords
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Daily Roll Call</h2>
        <p className="mt-1 text-sm text-gray-500">Record daily attendance for a class. Alerts will be sent for absent/late students.</p>
      </div>

      {/* Selectors */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
          <select 
            value={selectedClassId} 
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
          >
            <option value="">-- Choose Class --</option>
            {classes?.map(cls => <option key={cls.id} value={cls.id}>{cls.name} {cls.stream || ''}</option>)}
          </select>
        </div>
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
            />
          </div>
        </div>
      </div>

      {/* The Roll Call Grid */}
      {selectedClassId && selectedDate && (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden relative">
          
          {isFetching && !isLoadingRollCall && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          )}

          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">Class List</h3>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Attendance
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-white">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-3 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Present</th>
                  <th className="px-3 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Absent</th>
                  <th className="px-3 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Late</th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks (Reason)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoadingRollCall ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></td></tr>
                ) : rollCallList?.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No students found in this class.</td></tr>
                ) : (
                  rollCallList?.map((student) => {
                    const currentStatus = attendanceData[student.student_id]?.status || 'PRESENT';
                    
                    return (
                      <tr key={student.student_id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                          <span className="block font-normal text-xs text-gray-500">{student.admission_number}</span>
                        </td>
                        
                        {/* Radio Buttons for Status */}
                        <td className="whitespace-nowrap px-3 py-3 text-center">
                          <button 
                            onClick={() => handleStatusChange(student.student_id, 'PRESENT')}
                            className={`p-1.5 rounded-full transition-colors ${currentStatus === 'PRESENT' ? 'bg-green-100 text-green-600' : 'text-gray-300 hover:bg-gray-100'}`}
                          >
                            <CheckCircle2 className="w-6 h-6" />
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-center">
                          <button 
                            onClick={() => handleStatusChange(student.student_id, 'ABSENT')}
                            className={`p-1.5 rounded-full transition-colors ${currentStatus === 'ABSENT' ? 'bg-red-100 text-red-600' : 'text-gray-300 hover:bg-gray-100'}`}
                          >
                            <XCircle className="w-6 h-6" />
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-center">
                          <button 
                            onClick={() => handleStatusChange(student.student_id, 'LATE')}
                            className={`p-1.5 rounded-full transition-colors ${currentStatus === 'LATE' ? 'bg-orange-100 text-orange-600' : 'text-gray-300 hover:bg-gray-100'}`}
                          >
                            <Clock className="w-6 h-6" />
                          </button>
                        </td>

                        <td className="px-3 py-2 w-64">
                          <input
                            type="text"
                            value={attendanceData[student.student_id]?.remarks || ''}
                            onChange={(e) => handleRemarksChange(student.student_id, e.target.value)}
                            className="block w-full rounded-md border-gray-300 py-1.5 px-2 text-sm focus:border-primary-500 focus:ring-primary-500 border"
                            placeholder="Optional reason..."
                            disabled={currentStatus === 'PRESENT'} // Usually don't need remarks if present
                          />
                        </td>
                      </tr>
                    );
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