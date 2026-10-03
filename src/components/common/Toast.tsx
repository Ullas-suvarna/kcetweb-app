import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-md w-[calc(100vw-2.5rem)] pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-emerald-500 bg-white text-emerald-950 shadow-emerald-200/60';
        let iconBg = 'bg-emerald-500 text-white';
        let progressBg = 'bg-emerald-500';
        let Icon = CheckCircle2;

        if (toast.type === 'error') {
          borderClass = 'border-rose-500 bg-white text-rose-950 shadow-rose-200/60';
          iconBg = 'bg-rose-500 text-white';
          progressBg = 'bg-rose-500';
          Icon = XCircle;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500 bg-white text-amber-950 shadow-amber-200/60';
          iconBg = 'bg-amber-500 text-white';
          progressBg = 'bg-amber-500';
          Icon = AlertTriangle;
        } else if (toast.type === 'info') {
          borderClass = 'border-indigo-500 bg-white text-indigo-950 shadow-indigo-200/60';
          iconBg = 'bg-indigo-500 text-white';
          progressBg = 'bg-indigo-500';
          Icon = Info;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border-2 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 animate-slideInRight ${borderClass}`}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 pr-6 space-y-0.5">
                <h4 className="font-black text-sm sm:text-base leading-tight tracking-tight text-slate-900">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-xs sm:text-sm font-bold text-slate-600 leading-snug break-words">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar countdown */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100 overflow-hidden">
              <div
                className={`h-full ${progressBg} animate-toastProgress`}
                style={{
                  animationDuration: `${toast.duration || 3500}ms`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
