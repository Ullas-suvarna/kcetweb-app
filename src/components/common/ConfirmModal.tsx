import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  confirmText: string;
  cancelText: string;
  isDestructive: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ConfirmModalProps {
  dialog: ConfirmDialogState;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ dialog }) => {
  if (!dialog.isOpen) return null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dialog.onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-rose-300/80 space-y-5 transform transition-all animate-scaleUp"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm ${
              dialog.isDestructive 
                ? 'bg-rose-100 text-rose-600 border-2 border-rose-300' 
                : 'bg-amber-100 text-amber-600 border-2 border-amber-300'
            }`}>
              {dialog.isDestructive ? '⚠️' : '🔔'}
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 leading-tight">
                {dialog.title || 'Warning: Action Required'}
              </h3>
              <p className="text-xs font-bold text-rose-600">
                {dialog.isDestructive ? 'Permanent Irreversible Action' : 'Confirmation'}
              </p>
            </div>
          </div>
          <button
            onClick={dialog.onCancel}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            title="Cancel"
          >
            ✕
          </button>
        </div>

        {/* Warning Message Content */}
        <div className="space-y-3">
          {dialog.itemName && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-sm">
              <span className="text-xs font-black text-rose-700 uppercase tracking-wider block mb-0.5">Target Item</span>
              <strong className="text-rose-950 font-black text-base break-words">
                {dialog.itemName}
              </strong>
            </div>
          )}

          <p className="text-sm font-bold text-slate-700 leading-relaxed">
            {dialog.message}
          </p>

          {dialog.isDestructive && (
            <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>This action cannot be undone and will update live database records.</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={dialog.onCancel}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-colors cursor-pointer"
          >
            {dialog.cancelText || 'Cancel'}
          </button>
          <button
            type="button"
            autoFocus
            onClick={dialog.onConfirm}
            className={`flex-1 py-3 text-white font-black rounded-2xl shadow-lg text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer ${
              dialog.isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {dialog.isDestructive && <Trash2 className="w-4 h-4" />}
            <span>{dialog.confirmText || 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
