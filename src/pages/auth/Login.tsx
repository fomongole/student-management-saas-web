import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

import { loginSchema } from '@/schemas/auth.schema';
import type { LoginFormValues } from '@/schemas/auth.schema';
import { useLogin } from '@/hooks/useAuth';
import logo from '@/assets/logo.jpg'; 

export default function Login() {
  // --- 2. STATE & HOOKS ---
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // --- 3. FORM HANDLERS ---
  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      
      {/* --- 4. LEFT SIDE: LOGIN FORM --- 
      */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-slate-50 order-2 lg:order-1">
        <div className="w-full max-w-md">
          
          {/* Universal Branding Header (Visible on Mobile) */}
          <div className="lg:hidden text-center mb-10">
            <img src={logo} alt="Elimu Logo" className="mx-auto h-16 w-auto rounded-xl shadow-md mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Elimu Portal</h2>
          </div>

          {/* Form Title Section */}
          <div className="mb-10 text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-slate-500 mt-2 font-medium">Please enter your credentials to access your account.</p>
          </div>

          {/* Main Interaction Area */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* EMAIL / IDENTITY INPUT */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Identity / Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-600'}`} />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className={`block w-full pl-12 pr-4 py-3.5 bg-white border-2 ${errors.email ? 'border-red-200 ring-red-50' : 'border-slate-100 focus:border-primary-600 focus:ring-primary-50'} rounded-xl transition-all focus:outline-none focus:ring-4 text-slate-900 placeholder:text-slate-400`}
                  placeholder="name@portal.com"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600 font-semibold">{errors.email.message}</p>}
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-600'}`} />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`block w-full pl-12 pr-12 py-3.5 bg-white border-2 ${errors.password ? 'border-red-200 ring-red-50' : 'border-slate-100 focus:border-primary-600 focus:ring-primary-50'} rounded-xl transition-all focus:outline-none focus:ring-4 text-slate-900 placeholder:text-slate-400`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600 font-semibold">{errors.password.message}</p>}
            </div>

            {/* PERSISTENCE OPTION */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-slate-300 rounded-lg cursor-pointer transition-all"
              />
              <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-slate-600 cursor-pointer select-none">
                Remember this device
              </label>
            </div>

            {/* ACTION BUTTON */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg shadow-primary-200 text-base font-black text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isPending ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                <span>Enter Portal</span>
              )}
            </button>
          </form>

          {/* System Branding Footer */}
          <footer className="mt-16 text-left border-t border-slate-200 pt-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Elimu Academic Management System
            </p>
          </footer>
        </div>
      </div>

      {/* --- 5. RIGHT SIDE: BRANDING DISPLAY (Hidden on Mobile) --- 
      */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 relative overflow-hidden items-center justify-center p-12 order-1 lg:order-2">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-primary-800/40 via-transparent to-primary-400/20"></div>
        
        <div className="relative z-10 max-w-lg text-center text-white">
          <img 
            src={logo} 
            alt="Elimu Logo" 
            className="mx-auto h-24 w-auto rounded-2xl shadow-2xl mb-10 border-4 border-white/20"
          />
          <h1 className="text-4xl font-black mb-6 tracking-tight">
            Advancing Education <br />Through Technology.
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed font-medium">
            Empowering students, parents, and educators with a seamless digital experience. 
            All your academic needs in one unified platform.
          </p>
          
          {/* Security Indicator */}
          <div className="mt-12 inline-flex items-center gap-2 px-5 py-2.5 bg-black/10 rounded-full border border-white/10 text-white text-sm font-bold backdrop-blur-lg">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            Standard Security Protocol Active
          </div>
        </div>
      </div>
      
    </div>
  );
}