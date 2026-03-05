import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import ProtectedRoute from '@/components/ProtectedRoute';
import PublicRoute from '@/components/PublicRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import useAuthStore from '@/store/authStore';

const Login = lazy(() => import('@/pages/auth/Login'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin & Dashboard Pages
const SuperAdminDashboard = lazy(() => import('@/pages/super-admin/DashboardHome'));
const SchoolDashboardHome = lazy(() => import('@/pages/school-admin/SchoolDashboardHome'));
const TeacherDashboardHome = lazy(() => import('@/pages/teacher/TeacherDashboardHome'));
const StudentDashboardHome = lazy(() => import('@/pages/student/StudentDashboardHome'));
const ParentDashboardHome = lazy(() => import('@/pages/parent/ParentDashboardHome'));

// Management Pages
const SchoolsList = lazy(() => import('@/pages/super-admin/schools/SchoolsList'));
const TeachersList = lazy(() => import('@/pages/school-admin/teachers/TeachersList'));
const ClassesList = lazy(() => import('./pages/school-admin/classes/ClassesList'));
const StudentsList = lazy(() => import('./pages/school-admin/students/StudentsList'));
const SubjectsList = lazy(() => import('./pages/school-admin/subjects/SubjectsList'));
const ParentsList = lazy(() => import('./pages/school-admin/parents/ParentsList'));
const ExamsList = lazy(() => import('./pages/school-admin/exams/ExamsList'));
const MarkSheetEntry = lazy(() => import('./pages/school-admin/exams/MarkSheetEntry'));
const GradingScalesList = lazy(() => import('./pages/school-admin/academics/GradingScalesList'));
const FeeStructuresList = lazy(() => import('./pages/school-admin/fees/FeeStructuresList'));
const DailyRollCall = lazy(() => import('./pages/school-admin/attendance/DailyRollCall'));
const SchoolSettings = lazy(() => import('./pages/school-admin/settings/SchoolSettings'));

// Specific Detail Pages
const ChildDetail = lazy(() => import('./pages/parent/ChildDetail'));
const StudentGrades = lazy(() => import('./pages/student/StudentGrades'));

// A simple loading fallback for the "Suspense" wrapper
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
    <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
  </div>
);

function DashboardIndex() {
  const { user } = useAuthStore();
  
  if (user?.role === 'SUPER_ADMIN') return <SuperAdminDashboard />;
  if (user?.role === 'SCHOOL_ADMIN') return <SchoolDashboardHome />;
  if (user?.role === 'PARENT') return <ParentDashboardHome />;
  if (user?.role === 'TEACHER') return <TeacherDashboardHome />;
  if (user?.role === 'STUDENT') return <StudentDashboardHome />;
  
  return <div className="p-8">Welcome to the Portal!</div>;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}