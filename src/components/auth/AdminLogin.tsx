import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Star, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const { loginAdmin, adminEmail } = useAdminData();
  const [identifier, setIdentifier] = useState(adminEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedIdent = identifier.trim().toLowerCase();
    if (!trimmedIdent) {
      setErrorMessage('Please enter your admin email identifier.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (trimmedIdent !== adminEmail.toLowerCase()) {
      setErrorMessage(`Login Failed: Account '${trimmedIdent}' does not have Administrator privileges.`);
      return;
    }

    setIsLoading(true);
    try {
      const success = await loginAdmin(password);
      if (success) {
        onSuccess();
      } else {
        setErrorMessage(`Login Failed: Incorrect Admin Password for '${adminEmail}'.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#EEF2FF] bg-dot-grid">
      {/* Background Decorative Glow Accents */}
      <div 
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
      />
      <div 
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #1E66F5 0%, transparent 70%)' }}
      />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-[24px] border-[1.5px] border-[#E2E8F0] shadow-2xl p-7 md:p-9 transition-all">
        {/* Header with App Logo Card */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-[86px] h-[86px] rounded-[22px] bg-white border border-[#E2E8F0] shadow-lg flex items-center justify-center mb-4 relative group"
               style={{ boxShadow: '0 10px 25px -5px rgba(30, 102, 245, 0.2)' }}>
            <div className="w-[66px] h-[66px] rounded-[16px] bg-gradient-to-tr from-[#1E1B4B] to-[#1E66F5] flex flex-col items-center justify-center text-white font-black text-2xl tracking-tighter">
              <span className="leading-none text-amber-400 text-lg">?</span>
              <span>KCET</span>
            </div>
            <div className="absolute -top-1.5 -right-1.5 bg-[#1E66F5] text-white p-1 rounded-full shadow-md">
              <Star className="w-3.5 h-3.5 fill-current text-white" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <h1 className="text-[28px] font-[800] text-[#0F172A] tracking-tight">KCET Gen Z</h1>
            <ShieldCheck className="w-6 h-6 text-[#1E66F5]" />
          </div>

          <p className="text-[13px] font-[700] text-[#1E66F5] mt-1 tracking-wide uppercase">
            Karnataka's #1 KCET Entrance Prep Hub
          </p>
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
            Official Administrator Console
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Field 1: Email Address / Identifier */}
          <div>
            <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">
              Email Address or Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. name@email.com or 9876543210"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#CBD5E1] bg-white text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#1E66F5] focus:ring-2 focus:ring-[#1E66F5]/20 transition-all font-medium"
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-[#64748B]">
              Default Admin: <span className="font-mono text-[#1E66F5] font-semibold">{adminEmail}</span>
            </p>
          </div>

          {/* Field 2: Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[13px] font-semibold text-[#0F172A]">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert("Password reset link is sent to " + adminEmail)}
                className="text-[12px] font-medium text-[#1E66F5] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#CBD5E1] bg-white text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#1E66F5] focus:ring-2 focus:ring-[#1E66F5]/20 transition-all font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] bg-[#1E66F5] hover:bg-[#1854C4] active:scale-[0.99] text-white rounded-[14px] font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#F1F5F9] text-center">
          <p className="text-[11px] text-[#64748B]">
            Protected Administrator Zone • KCET Gen Z Karnataka v2.6
          </p>
          <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-[#94A3B8]">
            <a href="#" className="hover:text-[#1E66F5] transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-[#1E66F5] transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-[#1E66F5] transition-colors">Security Rules</a>
          </div>
        </div>
      </div>
    </div>
  );
};
