import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  Settings,
  UserPlus,
  Settings2,
  FileText,
  FileSpreadsheet,
  Banknote,
  CalendarCheck
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import type { UserRole } from '@/types/auth';
import NotificationsDropdown from '@/components/NotificationsDropdown';

const NAVIGATION_CONFIG: Record<UserRole, Array<{ name: string; href: string; icon: any }>> = {
  SUPER_ADMIN: [
    { name: 'Platform Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Manage Schools', href: '/dashboard/schools', icon: Building2 },
  ],
  SCHOOL_ADMIN: [
    { name: 'School Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Staff Directory', href: '/dashboard/teachers', icon: Users },
    { name: 'Student Roster', href: '/dashboard/students', icon: GraduationCap },
    { name: 'Daily Attendance', href: '/dashboard/attendance', icon: CalendarCheck },
    { name: 'Parent Directory', href: '/dashboard/parents', icon: UserPlus }, 
    { name: 'Academics (Classes)', href: '/dashboard/academics', icon: Building2 },
    { name: 'Curriculum (Subjects)', href: '/dashboard/subjects', icon: BookOpen },
    { name: 'Exam Sessions', href: '/dashboard/exams', icon: FileText },
    { name: 'Mark Sheets Entry', href: '/dashboard/mark-sheets', icon: FileSpreadsheet },
    { name: 'Grading System', href: '/dashboard/grading', icon: Settings2 },
    { name: 'Fee Structures', href: '/dashboard/fees', icon: Banknote },
    { name: 'System Settings', href: '/dashboard/settings', icon: Settings }
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = user ? NAVIGATION_CONFIG[user.role] : [];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      
      {/* --- MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary-600 tracking-tight">Elimu.</h1>
          {/* Close Menu Button (Mobile Only) */}
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/dashboard'}
              onClick={() => setIsMobileMenuOpen(false)} // Auto-close mobile menu on click
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${location.pathname === item.href ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-500'}`} />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        
        {/* --- TOP HEADER --- */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 relative z-30">
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Right Side Header Items */}
          <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
            
            <NotificationsDropdown />

            <div className="h-6 w-px bg-gray-200 mx-1 sm:mx-2 hidden sm:block"></div>

            {/* Profile Dropdown Container */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                  {user?.first_name.charAt(0)}{user?.last_name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 leading-none">
                    {user?.first_name} {user?.last_name}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <>
                  {/* Invisible overlay to close dropdown when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileOpen(false)}
                  ></div>
                  
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => { setIsProfileOpen(false); /* Navigate to profile */ }}
                    >
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      My Profile
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-gray-400" />
                      Account Settings
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* --- MAIN VIEWPORT --- */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}