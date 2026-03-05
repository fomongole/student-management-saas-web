import { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  UserSquare2, 
  Banknote, 
  TrendingUp, 
  Wallet, 
  PiggyBank, 
  Download, 
  Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import useAuthStore from '@/store/authStore';
import { useSchoolDashboard } from '@/hooks/useDashboard';
import { useSchoolConfig } from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import api from '@/services/api';

// --- MOCK DATA FOR CHARTS ---
const feeCollectionData = [
  { name: 'Primary 1', billed: 4000000, paid: 2400000 },
  { name: 'Primary 2', billed: 3000000, paid: 1398000 },
  { name: 'Primary 3', billed: 2000000, paid: 9800000 },
  { name: 'Primary 4', billed: 2780000, paid: 3908000 },
  { name: 'Primary 5', billed: 1890000, paid: 4800000 },
  { name: 'Primary 6', billed: 2390000, paid: 3800000 },
  { name: 'Primary 7', billed: 3490000, paid: 4300000 },
];

const attendanceTrendData = [
  { day: 'Mon', present: 95 },
  { day: 'Tue', present: 92 },
  { day: 'Wed', present: 96 },
  { day: 'Thu', present: 89 },
  { day: 'Fri', present: 98 },
];

export default function SchoolDashboardHome() {
  const { user } = useAuthStore();
  const { data: config } = useSchoolConfig();
  const [isExporting, setIsExporting] = useState(false);
  
  const year = config?.current_academic_year || new Date().getFullYear();
  const term = config?.current_term || 1;

  const { data, isLoading } = useSchoolDashboard(year, term);

  const handleDownloadDefaulters = async () => {
    setIsExporting(true);
    try {
      const response = await api.get(`/reports/export/defaulters?year=${year}&term=${term}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Fee_Defaulters_Term${term}_${year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export defaulters report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome back, {user?.first_name}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here is your school's overview for Term {term}, {year}.
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={handleDownloadDefaulters}
            disabled={isExporting}
            className="flex items-center px-4 py-2.5 bg-white border border-gray-300 shadow-sm rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-gray-400" /> : <Download className="w-4 h-4 mr-2 text-gray-500" />}
            Export Defaulters (CSV)
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 bg-blue-50 rounded-lg p-3 border border-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-xs font-bold text-gray-500 uppercase tracking-wider">Total Teachers</dt>
                <dd className="mt-1 flex items-baseline text-2xl font-black text-gray-900">{data?.population.total_teachers || 0}</dd>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 bg-green-50 rounded-lg p-3 border border-green-100">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-xs font-bold text-gray-500 uppercase tracking-wider">Total Students</dt>
                <dd className="mt-1 flex items-baseline text-2xl font-black text-gray-900">{data?.population.total_students || 0}</dd>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 bg-purple-50 rounded-lg p-3 border border-purple-100">
                <UserSquare2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-xs font-bold text-gray-500 uppercase tracking-wider">Registered Parents</dt>
                <dd className="mt-1 flex items-baseline text-2xl font-black text-gray-900">{data?.population.total_parents || 0}</dd>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mt-6">
            <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100 flex items-center border-l-4 border-l-gray-300">
              <div className="flex-shrink-0 bg-gray-50 rounded-full p-3"><Wallet className="h-6 w-6 text-gray-500" /></div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-xs font-bold text-gray-500 uppercase tracking-wider">Expected Revenue</dt>
                <dd className="mt-1 flex items-baseline text-xl font-bold text-gray-900">{config?.currency_symbol || 'UGX'} {data?.financials.total_billed.toLocaleString() || 0}</dd>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100 flex items-center border-l-4 border-l-green-500">
              <div className="flex-shrink-0 bg-green-50 rounded-full p-3"><PiggyBank className="h-6 w-6 text-green-600" /></div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-xs font-bold text-gray-500 uppercase tracking-wider">Total Collected</dt>
                <dd className="mt-1 flex items-baseline text-xl font-bold text-green-600">{config?.currency_symbol || 'UGX'} {data?.financials.total_collected.toLocaleString() || 0}</dd>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100 flex items-center border-l-4 border-l-red-500">
              <div className="flex-shrink-0 bg-red-50 rounded-full p-3"><Banknote className="h-6 w-6 text-red-600" /></div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-xs font-bold text-gray-500 uppercase tracking-wider">Outstanding Balance</dt>
                <dd className="mt-1 flex items-baseline text-xl font-bold text-red-600">{config?.currency_symbol || 'UGX'} {data?.financials.outstanding_balance.toLocaleString() || 0}</dd>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Banknote className="h-5 w-5 mr-2 text-green-600" />
              Fee Collection by Class
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `UGX ${(value / 1000000)}M`} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  // FIX: Handle undefined value
                  formatter={(value: number | undefined) => [`UGX ${value?.toLocaleString() ?? '0'}`, '']} 
                />
                <Bar dataKey="billed" name="Total Billed" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Amount Paid" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              School-wide Attendance (%)
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  // Handle undefined value
                  formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Present']}
                />
                <Area type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}