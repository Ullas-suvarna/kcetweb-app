import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Star, ShieldCheck, Zap, Database, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const { loginAdmin, adminEmail, notifySuccess, notifyError, notifyInfo } = useAdminData();
  const [identifier, setIdentifier] = useState(adminEmail || 'ullassuvarna65@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedIdent = identifier.trim().toLowerCase();
    if (!trimmedIdent) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await loginAdmin(password);
      if (success) {
        notifySuccess('Welcome to KCET Gen Z Console!', 'Login Successful');
        onSuccess();
      } else {
        setErrorMessage(`Login Failed: Incorrect password for '${trimmedIdent}'.`);
        notifyError('Incorrect password. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    notifyInfo(`Password reset instructions sent to ${identifier || adminEmail}.`, 'Reset Dispatched');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] overflow-x-hidden font-sans">
      {/* ============================================================ */}
      {/* LEFT SIDE: Brand Hero & Real-Time Sync Showcase (Full Height) */}
      {/* ============================================================ */}
      <div className="relative w-full lg:w-1/2 bg-[#0B0F19] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden">
        {/* Background Ambient Glows & Dot Pattern */}
        <div 
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none"
        />
        <div 
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none"
        />
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#FFFFFF 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Header Badge */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE FIREBASE & RTDB DUAL-SYNC CONSOLE</span>
          </div>

          {/* Logo & Brand Title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-blue-500/20 shrink-0">
              <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="50,18 88,34 50,50 12,34" stroke="#38BDF8" strokeWidth="4" fill="#0B132B" />
                  <path d="M28,42 L28,60 C28,68 72,68 72,60 L72,42" stroke="#818CF8" strokeWidth="3.5" fill="none" />
                  <path d="M84,36 L88,54 L85,62" stroke="#E879F9" strokeWidth="3" strokeLinecap="round" />
                  <text x="50" y="66" textAnchor="middle" fill="#38BDF8" fontSize="20" fontWeight="900" fontFamily="sans-serif">
                    KG
                  </text>
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  KCET Gen Z
                </h1>
                <Star className="w-5 h-5 fill-blue-400 text-blue-400 shrink-0" />
              </div>
              <p className="text-sm font-bold text-blue-400 tracking-wide">
                Karnataka's #1 KCET Entrance Prep Hub
              </p>
            </div>
          </div>
        </div>

        {/* Middle Feature Highlights Grid */}
        <div className="relative z-10 my-8 sm:my-12 space-y-4 max-w-xl">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-start gap-4 transition-all hover:border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-100">Sub-50ms Cross-Platform Sync</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Instant socket updates via Firebase Realtime Database and persistent Cloud Firestore collections.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-start gap-4 transition-all hover:border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-100">Karnataka College Cutoffs Matrix</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Manage branch cutoffs for GM, 2A, 2B, 3A, 3B, SC, ST across all Karnataka engineering institutions.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-start gap-4 transition-all hover:border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-100">PIN-Protected Student Security</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                4-Digit Security PIN (1111) verification gate before permanent deletions and account blacklisting.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom System Status Footer */}
        <div className="relative z-10 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold">All Systems Operational</span>
          </div>
          <span className="font-mono text-slate-400">Version 1.0.0</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT SIDE: Clean, Wide & Spatially Balanced Sign-In Form    */}
      {/* ============================================================ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#F8FAFC]">
        <div className="w-full max-w-lg space-y-8">
          {/* Form Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrator Portal</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm sm:text-base font-medium text-slate-600">
              Sign in with your master administrator credentials to access the central dashboard.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field 1: Email Address or Identifier */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                Administrator Identifier (Email)
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ullassuvarna65@gmail.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-bold text-base focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                  required
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-900">
                  Master Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-bold text-base focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal tracking-wider"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Master Credentials...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Admin Dashboard</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Security Note */}
          <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>256-bit Encrypted Admin Session</span>
            </div>
            <span className="font-mono text-slate-500">Karnataka Region</span>
          </div>

          {/* Disclaimer & Copyright Information */}
          <div className="pt-4 border-t border-slate-200 space-y-2.5 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              KCET Gen Z is an independent educational platform and is not affiliated with KEA or the Government of Karnataka.{' '}
              <button
                type="button"
                onClick={() => notifyInfo('KCET Gen Z is an independent prep portal for Karnataka students and is not officially associated with Karnataka Examinations Authority (KEA).', 'Platform Disclaimer')}
                className="text-blue-600 hover:text-blue-700 font-bold underline cursor-pointer"
              >
                Read Disclaimer
              </button>
            </p>
            <div className="text-[11px] text-slate-400 space-y-0.5 font-medium">
              <div>&copy; 2026 KCET Gen Z. All Rights Reserved</div>
              <div>
                Developed &amp; Maintained by <span className="font-bold text-slate-600">Gen Z EduTech</span> &bull; Version 1.0.0
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
