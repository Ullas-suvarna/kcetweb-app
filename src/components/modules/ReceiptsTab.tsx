import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Crown, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  ZoomIn,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAdminData } from '../../context/AdminDataContext';
import { PaymentReceipt, ReceiptStatus } from '../../types';

export const ReceiptsTab: React.FC = () => {
  const { receipts, approveReceipt, rejectReceipt } = useAdminData();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Zoom preview modal
  const [previewReceipt, setPreviewReceipt] = useState<PaymentReceipt | null>(null);

  // Reject dialog
  const [rejectingReceipt, setRejectingReceipt] = useState<PaymentReceipt | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const statuses: { label: string; value: string }[] = [
    { label: 'All Receipts', value: 'ALL' },
    { label: 'Under Verification', value: 'UNDER_VERIFICATION' },
    { label: 'Verified & Approved', value: 'VERIFIED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  const handleApprove = async (r: PaymentReceipt) => {
    await approveReceipt(r);
    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (previewReceipt && previewReceipt.receiptId === r.receiptId) {
      setPreviewReceipt(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingReceipt) return;
    if (!rejectReason.trim()) {
      alert('Mandatory rejection reason is required.');
      return;
    }
    await rejectReceipt(rejectingReceipt.receiptId, rejectReason);
    setRejectingReceipt(null);
    setRejectReason('');
    if (previewReceipt) setPreviewReceipt(null);
  };

  const filtered = receipts.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.userName.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q) ||
      r.transactionRef.toLowerCase().includes(q) ||
      (r.userPhone && r.userPhone.includes(q))
    );
  });

  const pendingCount = receipts.filter(r => r.status === 'UNDER_VERIFICATION').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-admin-cardBorder shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-admin-heading flex items-center gap-2">
            <Receipt className="w-5 h-5 text-admin-primary" />
            UPI Payment Receipts Verification
          </h2>
          <p className="text-xs text-admin-muted mt-0.5">
            Audit student transaction screenshots for ₹299 Premium upgrades with one-click verification.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold animate-pulse">
            <Crown className="w-4 h-4 text-amber-600" />
            <span>{pendingCount} Pending Verifications</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statuses.map(st => (
            <button
              key={st.value}
              onClick={() => setStatusFilter(st.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st.value
                  ? 'bg-admin-tab text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-admin-cardBorder'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by UTR number, student name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-admin-cardBorder rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary"
          />
        </div>
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(r => (
          <div
            key={r.receiptId}
            className={`bg-white rounded-card border p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between ${
              r.status === 'UNDER_VERIFICATION' ? 'border-amber-300 ring-1 ring-amber-100' : 'border-admin-cardBorder'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="font-mono text-[10px] text-slate-400">#{r.receiptId}</span>
                  <h4 className="font-bold text-sm text-admin-heading">{r.userName}</h4>
                  <p className="text-xs text-slate-500">{r.userEmail}</p>
                  {r.userPhone && <p className="text-xs text-slate-400">+91 {r.userPhone}</p>}
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-admin-heading">₹{r.amountPaid}</span>
                  <div className="mt-1">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      r.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                      r.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-900 font-extrabold animate-pulse'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* UTR Reference Strip */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between mb-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">UPI UTR / Ref No.</span>
                  <span className="font-mono font-bold text-indigo-700">{r.transactionRef}</span>
                </div>
                <button
                  onClick={() => setPreviewReceipt(r)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-admin-primary font-bold text-[11px] flex items-center gap-1 shadow-sm"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  View Screenshot
                </button>
              </div>

              {r.status === 'REJECTED' && r.rejectionReason && (
                <div className="mb-3 p-2 bg-red-50 rounded-lg border border-red-200 text-[11px] text-red-700">
                  <strong>Rejection Reason:</strong> {r.rejectionReason}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400">
                Submitted {new Date(r.submittedAtTimestamp).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-2">
                {r.status === 'UNDER_VERIFICATION' && (
                  <>
                    <button
                      onClick={() => {
                        setRejectingReceipt(r);
                        setRejectReason('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(r)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Grant
                    </button>
                  </>
                )}
                {r.status === 'VERIFIED' && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    Premium Unlocked
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Screenshot Zoom Preview Modal */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-admin-heading">Payment Screenshot Preview</h3>
                <p className="text-xs text-slate-500">Student: {previewReceipt.userName} (UTR: {previewReceipt.transactionRef})</p>
              </div>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center min-h-[300px]">
              {previewReceipt.receiptImageUri ? (
                <img
                  src={previewReceipt.receiptImageUri}
                  alt="Receipt Screenshot"
                  className="max-h-[450px] w-auto object-contain mx-auto"
                />
              ) : (
                <div className="text-slate-400 text-xs">No image preview available.</div>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl mb-4 text-xs space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>Amount:</span>
                <strong>₹{previewReceipt.amountPaid}</strong>
              </div>
              <div className="flex justify-between">
                <span>UTR Reference:</span>
                <strong className="font-mono text-indigo-700">{previewReceipt.transactionRef}</strong>
              </div>
              <div className="flex justify-between">
                <span>Student Email:</span>
                <span>{previewReceipt.userEmail}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPreviewReceipt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>

              {previewReceipt.status === 'UNDER_VERIFICATION' && (
                <>
                  <button
                    onClick={() => {
                      setRejectingReceipt(previewReceipt);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl"
                  >
                    Reject Receipt
                  </button>
                  <button
                    onClick={() => handleApprove(previewReceipt)}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow"
                  >
                    Approve & Grant Premium
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Dialog */}
      {rejectingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <h3 className="font-bold text-base text-admin-heading mb-1">
              Reject Payment Receipt
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Student: <strong>{rejectingReceipt.userName}</strong> (Ref: {rejectingReceipt.transactionRef})
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-admin-heading mb-1">
                Mandatory Rejection Reason
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. UTR number not found in bank statement, blurry screenshot, duplicate submission..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectingReceipt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
