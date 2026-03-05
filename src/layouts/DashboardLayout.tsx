// --- 1. IMPORTS ---
import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Users, GraduationCap, BookOpen,
  LogOut, Menu, X, ChevronDown, User as UserIcon, Settings,
  UserPlus, Settings2, FileText, FileSpreadsheet, Banknote,
  CalendarCheck, Shield
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import type { UserRole } from '@/types/auth';
import NotificationsDropdown from '@/components/NotificationsDropdown';

// --- 2. NAVIGATION CONFIGURATION ---
// Grouped for better UX scannability
const NAVIGATION_CONFIG: Record<UserRole, Array<{ name: string; href: string; icon: any; section?: string }>> = {
  SUPER_ADMIN: [
    { name: 'Platform Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Manage Schools', href: '/dashboard/schools', icon: Building2 },
  ],
  SCHOOL_ADMIN: [
    { section: 'Overview', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { section: 'People', name: 'Staff Directory', href: '/dashboard/teachers', icon: Users },
    { name: 'Student Roster', href: '/dashboard/students', icon: GraduationCap },
    { name: 'Parent Directory', href: '/dashboard/parents', icon: UserPlus }, 
    { section: 'Academic', name: 'Attendance', href: '/dashboard/attendance', icon: CalendarCheck },
    { name: 'Classes', href: '/dashboard/academics', icon: Building2 },
    { name: 'Subjects', href: '/dashboard/subjects', icon: BookOpen },
    { section: 'Exams & Grades', name: 'Sessions', href: '/dashboard/exams', icon: FileText },
    { name: 'Mark Sheets', href: '/dashboard/mark-sheets', icon: FileSpreadsheet },
    { name: 'Grading System', href: '/dashboard/grading', icon: Settings2 },
    { section: 'Finance', name: 'Fee Structures', href: '/dashboard/fees', icon: Banknote },
    { section: 'System', name: 'Settings', href: '/dashboard/settings', icon: Settings }
  ],
  TEACHER: [
    { name: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Daily Attendance', href: '/dashboard/attendance', icon: CalendarCheck },
    { name: 'Mark Sheets Entry', href: '/dashboard/mark-sheets', icon: FileSpreadsheet },
  ],
  STUDENT: [
    { name: 'My Portal', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Grades', href: '/dashboard/grades', icon: GraduationCap },
  ],
  PARENT: [
    { name: 'Parent Portal', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Children', href: '/dashboard/children', icon: Users },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = user ? NAVIGATION_CONFIG[user.role] : [];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* --- 3. MOBILE SIDEBAR OVERLAY --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-all"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- 4. SIDEBAR NAVIGATION --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col shadow-2xl shadow-slate-200/50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Branding */}
        <div className="h-20 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-200">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Elimu.</h1>
          </div>
          <button className="md:hidden p-1 text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Dynamic Nav List */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
          {navItems.map((item) => (
            <div key={item.name}>
              {/* Optional Section Header */}
              {item.section && (
                <p className="mt-6 mb-2 ml-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {item.section}
                </p>
              )}
              <NavLink
                to={item.href}
                end={item.href === '/dashboard'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  group flex items-center px-3 py-2.5 my-0.5 text-sm font-semibold rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200 active-nav-glow' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-primary-600'}
                `}
              >
                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  location.pathname === item.href ? 'text-white' : 'text-slate-400 group-hover:text-primary-600'
                }`} />
                {item.name}
              </NavLink>
            </div>
          ))}
        </nav>

        {/* Logout at bottom of sidebar */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- 5. MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        
        {/* --- 6. TOP HEADER --- */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            <NotificationsDropdown />

            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            {/* Profile Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-all focus:outline-none"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-none">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-[10px] font-black text-primary-600 uppercase mt-1 tracking-tighter">
                    {user?.role.replace('_', ' ')}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-200 border-2 border-white ring-1 ring-primary-100">
                  <span className="text-sm font-bold">{user?.first_name.charAt(0)}{user?.last_name.charAt(0)}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 hidden sm:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 ring-1 ring-slate-200 py-2 z-50 animate-in fade-in zoom-in duration-150">
                    <div className="px-5 py-4 border-b border-slate-50">
                      <p className="text-sm font-bold text-slate-900">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors">
                        <UserIcon className="h-4 w-4 text-slate-400" />
                        Account Profile
                      </button>
                      <button className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors">
                        <Settings className="h-4 w-4 text-slate-400" />
                        Preferences
                      </button>
                    </div>
                    <div className="border-t border-slate-50 m-2"></div>
                    <div className="p-2">
                      <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors">
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* --- 7. CONTENT VIEWPORT --- */}
        <main className="flex-1 overflow-auto bg-[#F8FAFC] p-4 sm:p-8">
          {/* Internal shadow to give "depth" to the main area */}
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}