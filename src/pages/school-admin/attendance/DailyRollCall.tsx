import { useState, useEffect, useMemo } from 'react';
import { Loader2, Save, CalendarDays, CheckCircle2, XCircle, Clock, Users, CheckSquare } from 'lucide-react';
import { useClasses } from '@/hooks/useClasses';
import { useClassRollCall, useSubmitAttendance } from '@/hooks/useAttendance';
import type { AttendanceStatus } from '@/types/attendance';

export default function DailyRollCall() {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});

  const { data: classes } = useClasses();
  const { data: rollCallList, isLoading: isLoadingRollCall, isFetching } = useClassRollCall(selectedClassId, selectedDate);
  const { mutate: submitAttendance, isPending: isSaving } = useSubmitAttendance();

  useEffect(() => {
    if (rollCallList) {
      const initialData: Record<string, { status: AttendanceStatus; remarks: string }> = {};
      rollCallList.forEach(student => {
        initialData[student.student_id] = {
          status: student.status || 'PRESENT',
          remarks: student.remarks || '',
        };
      });
      setAttendanceData(initialData);
    }
  }, [rollCallList]);

  // Derived Stats for UX
  const stats = useMemo(() => {
    const total = rollCallList?.length || 0;
    const present = Object.values(attendanceData).filter(d => d.status === 'PRESENT').length;
    const absent = Object.values(attendanceData).filter(d => d.status === 'ABSENT').length;
    const late = Object.values(attendanceData).filter(d => d.status === 'LATE').length;
    return { total, present, absent, late };
  }, [attendanceData, rollCallList]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: { ...prev[studentId], remarks } }));
  };

  const markAllPresent = () => {
    if (!rollCallList) return;
    const updatedData = { ...attendanceData };
    rollCallList.forEach(student => {
      updatedData[student.student_id].status = 'PRESENT';
    });
    setAttendanceData(updatedData);
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
      subject_id: null,
      records: payloadRecords
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Daily Roll Call</h2>
          <p className="mt-1 text-sm text-gray-500">Record daily attendance. Alerts are automatically sent for absent or late students.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-5 items-end">
        <div className="w-full sm:w-1/2 md:w-1/3">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Class</label>
          <select 
            value={selectedClassId} 
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2.5 transition-colors"
          >
            <option value="">-- Choose Class --</option>
            {classes?.map(cls => <option key={cls.id} value={cls.id}>{cls.name} {cls.stream || ''}</option>)}
          </select>
        </div>
        <div className="w-full sm:w-1/2 md:w-1/3">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full rounded-lg border-gray-300 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2.5 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Roster & Stats */}
      {selectedClassId && selectedDate && (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden relative flex flex-col">
          
          {isFetching && !isLoadingRollCall && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          )}

          {/* Header Actions & Stats */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-gray-200 bg-gray-50/50 gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 font-medium text-gray-700">
                <Users className="w-4 h-4 text-gray-400" /> {stats.total} Students
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex gap-3">
                <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-md">{stats.present} Present</span>
                <span className="text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-md">{stats.absent} Absent</span>
                <span className="text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-md">{stats.late} Late</span>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={markAllPresent}
                className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors w-full md:w-auto"
              >
                <CheckSquare className="mr-2 h-4 w-4 text-green-600" /> All Present
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center justify-center bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 shadow-sm transition-colors w-full md:w-auto"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white sticky top-0 z-20 shadow-sm">
                <tr>
                  <th className="py-3.5 pl-5 pr-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-3 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Remarks (Reason)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoadingRollCall ? (
                  <tr><td colSpan={3} className="p-12 text-center text-gray-500"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" /></td></tr>
                ) : rollCallList?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-12 text-center">
                      <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No students found in this class.</p>
                    </td>
                  </tr>
                ) : (
                  rollCallList?.map((student) => {
                    const currentStatus = attendanceData[student.student_id]?.status || 'PRESENT';
                    
                    return (
                      <tr key={student.student_id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="whitespace-nowrap py-3.5 pl-5 pr-3">
                          <div className="font-semibold text-gray-900">{student.first_name} {student.last_name}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">{student.admission_number}</div>
                        </td>
                        
                        <td className="whitespace-nowrap px-3 py-3 text-center">
                          <div className="inline-flex bg-gray-100/80 rounded-lg p-1 border border-gray-200 shadow-inner">
                            <button 
                              onClick={() => handleStatusChange(student.student_id, 'PRESENT')}
                              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentStatus === 'PRESENT' ? 'bg-white text-green-600 shadow-sm ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Present
                            </button>
                            <button 
                              onClick={() => handleStatusChange(student.student_id, 'ABSENT')}
                              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentStatus === 'ABSENT' ? 'bg-white text-red-600 shadow-sm ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                            >
                              <XCircle className="w-4 h-4 mr-1.5" /> Absent
                            </button>
                            <button 
                              onClick={() => handleStatusChange(student.student_id, 'LATE')}
                              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentStatus === 'LATE' ? 'bg-white text-orange-600 shadow-sm ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                            >
                              <Clock className="w-4 h-4 mr-1.5" /> Late
                            </button>
                          </div>
                        </td>

                        <td className="px-3 py-3 w-72 pr-5">
                          <input
                            type="text"
                            value={attendanceData[student.student_id]?.remarks || ''}
                            onChange={(e) => handleRemarksChange(student.student_id, e.target.value)}
                            className="block w-full rounded-lg border-gray-300 py-2 px-3 text-sm focus:border-primary-500 focus:ring-primary-500 shadow-sm transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                            placeholder="Optional reason..."
                            disabled={currentStatus === 'PRESENT'}
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