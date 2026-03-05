// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/auth/Login';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicRoute from '@/components/PublicRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import NotFound from '@/pages/NotFound'; 
import useAuthStore from '@/store/authStore';

import SuperAdminDashboard from '@/pages/super-admin/DashboardHome';
import SchoolsList from '@/pages/super-admin/schools/SchoolsList';
import TeachersList from '@/pages/school-admin/teachers/TeachersList';
import SchoolDashboardHome from '@/pages/school-admin/SchoolDashboardHome'; 
import ClassesList from './pages/school-admin/classes/ClassesList';
import StudentsList from './pages/school-admin/students/StudentsList';
import SubjectsList from './pages/school-admin/subjects/SubjectsList';
import ParentsList from './pages/school-admin/parents/ParentsList';
import MarkSheetEntry from './pages/school-admin/exams/MarkSheetEntry';
import ExamsList from './pages/school-admin/exams/ExamsList';
import GradingScalesList from './pages/school-admin/academics/GradingScalesList';
import FeeStructuresList from './pages/school-admin/fees/FeeStructuresList';
import DailyRollCall from './pages/school-admin/attendance/DailyRollCall';
import ParentDashboardHome from './pages/parent/ParentDashboardHome';
import ChildDetail from './pages/parent/ChildDetail';
import TeacherDashboardHome from './pages/teacher/TeacherDashboardHome';
import StudentDashboardHome from './pages/student/StudentDashboardHome';
import StudentGrades from './pages/student/StudentGrades';
import SchoolSettings from './pages/school-admin/settings/SchoolSettings';

// 1. Create a smart index router component
function DashboardIndex() {
  const { user } = useAuthStore();
  
  if (user?.role === 'SUPER_ADMIN') return <SuperAdminDashboard />;
  if (user?.role === 'SCHOOL_ADMIN') return <SchoolDashboardHome />;
  if (user?.role === 'PARENT') return <ParentDashboardHome />;
  if (user?.role === 'TEACHER') return <TeacherDashboardHome />;
  if (user?.role === 'STUDENT') return <StudentDashboardHome />;
  
  // Fallback
  return <div>Welcome to the Portal!</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          
          <Route index element={<DashboardIndex />} />
          
          {/* Super Admin Routes */}
          <Route path="schools" element={<SchoolsList />} />
          
          {/* School Admin Routes */}
          <Route path="teachers" element={<TeachersList />} />
          <Route path="students" element={<StudentsList />} />
          <Route path="attendance" element={<DailyRollCall />} />
          <Route path="parents" element={<ParentsList />} />
          <Route path="academics" element={<ClassesList />} />
          <Route path="subjects" element={<SubjectsList />} />
          <Route path="grading" element={<GradingScalesList />} />
          <Route path="exams" element={<ExamsList />} />
          <Route path="mark-sheets" element={<MarkSheetEntry />} />
          <Route path="fees" element={<FeeStructuresList />} />
          <Route path="settings" element={<SchoolSettings />} />

          <Route path="children" element={<ParentDashboardHome />} />
          <Route path="children/:id" element={<ChildDetail />} />

          <Route path="grades" element={<StudentGrades />} />
          
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}