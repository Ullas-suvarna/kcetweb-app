import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Mail,
  Search,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  RefreshCw,
  Eye,
  ShieldCheck,
  FileText,
  Lock,
  ChevronDown,
  Sparkles,
  History,
  X,
  Smartphone,
  ExternalLink,
  Info,
  Check
} from 'lucide-react';
import { auth } from '../../services/firebase';
import { useAdminData } from '../../context/AdminDataContext';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StudentSummary {
  uid: string;
  name: string;
  email: string;
  studentId?: string;
}

export interface EmailLogEntry {
  id: string;
  recipientUid: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  adminEmail: string;
  status: 'SUBMITTED' | 'FAILED' | 'UNCERTAIN' | 'NETWORK_ERROR' | string;
  createdAt: string;
  error?: string | null;
}

const API_BASE = 'https://kcet-password-reset.vercel.app/api/admin';

// ─── Helper: get Firebase ID token ──────────────────────────────────────────

async function getAdminIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated. Please sign in to the Admin Panel first.');
  return user.getIdToken(/* forceRefresh */ false);
}

// ─── Predefined Quick Notification Templates ────────────────────────────────

const QUICK_TEMPLATES = [
  {
    label: '🎯 Exam Strategy & Practice',
    subject: 'KCET Prep Update: New Strategy & High-Yield Questions Ready',
    message:
      'Dear Student,\n\nWe have updated your KCET preparation resources with new high-yield practice questions and subject-wise shortcuts.\n\nPlease log in to the KCET GenZ mobile app to solve today\'s challenge sets and track your ranking.\n\nKeep pushing forward!\nTeam KCET GenZ',
  },
  {
    label: '🔔 Verification / Account Reminder',
    subject: 'Important: Action Required for Your KCET GenZ Account',
    message:
      'Dear Student,\n\nThis is a priority notification regarding your KCET GenZ student profile.\n\nPlease ensure your email address is fully verified and your profile details are up to date so you don\'t miss out on upcoming mock tests, mentor sessions, and counselling rank analysis.\n\nBest regards,\nKCET GenZ Administration',
  },
  {
    label: '💬 Mentor Live Chat Session',
    subject: 'KCET Senior Mentorship: Your Session Details & Guidelines',
    message:
      'Dear Student,\n\nYour mentorship request has been reviewed by our senior mentors. Please open the Senior Live Chat section in the KCET GenZ app to view your allocated schedule and submit your specific doubts in advance.\n\nBest wishes,\nKCET GenZ Mentor Desk',
  },
];

export const AdminEmailNotificationsTab: React.FC = () => {
  const { students: localStudents, notifySuccess, notifyError, notifyWarning } = useAdminData();

  // Active view: 'compose' | 'history'
  const [activeView, setActiveView] = useState<'compose' | 'history'>('compose');

  // Student selection state
  const [serverStudents, setServerStudents] = useState<StudentSummary[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [studentFetchError, setStudentFetchError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);

  // Email form state
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Sending & confirmation state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string>('');
  const [sendErrorMessage, setSendErrorMessage] = useState<string>('');

  // History state
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [logsError, setLogsError] = useState<string>('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // ── Fetch students from serverless API ─────────────────────────────────────
  const fetchStudents = async (query = '') => {
    setIsLoadingStudents(true);
    setStudentFetchError('');
    try {
      const token = await getAdminIdToken();
      const url = new URL(`${API_BASE}/students`);
      if (query.trim()) url.searchParams.set('search', query.trim());
      url.searchParams.set('limit', '80');

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      if (data.students && Array.isArray(data.students)) {
        setServerStudents(data.students);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load students.';
      setStudentFetchError(msg);
      // Fallback: populate from local cache if available
      if (localStudents && localStudents.length > 0 && serverStudents.length === 0) {
        const mapped: StudentSummary[] = localStudents
          .filter((s) => s.email && s.email.includes('@'))
          .map((s) => ({
            uid: s.uid,
            name: s.name || s.email.split('@')[0],
            email: s.email,
            studentId: s.formattedStudentId || s.studentId,
          }));
        setServerStudents(mapped);
      }
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Initial load of students
  useEffect(() => {
    fetchStudents();
  }, []);

  // Combine server students with any local students not yet in server list
  const combinedStudents = useMemo(() => {
    const map = new Map<string, StudentSummary>();
    serverStudents.forEach((s) => {
      if (s.email && s.email.includes('@')) map.set(s.uid, s);
    });
    localStudents.forEach((ls) => {
      if (ls.uid && ls.email && ls.email.includes('@') && !map.has(ls.uid)) {
        map.set(ls.uid, {
          uid: ls.uid,
          name: ls.name || ls.email.split('@')[0],
          email: ls.email,
          studentId: ls.formattedStudentId || ls.studentId,
        });
      }
    });
    return Array.from(map.values());
  }, [serverStudents, localStudents]);

  // Filtered students for dropdown
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return combinedStudents.slice(0, 30);
    const term = searchTerm.toLowerCase().trim();
    return combinedStudents
      .filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term) ||
          (s.studentId && s.studentId.toLowerCase().includes(term))
      )
      .slice(0, 30);
  }, [combinedStudents, searchTerm]);

  // ── Fetch Email Logs ───────────────────────────────────────────────────────
  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    setLogsError('');
    try {
      const token = await getAdminIdToken();
      const res = await fetch(`${API_BASE}/email-logs?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err: unknown) {
      setLogsError(err instanceof Error ? err.message : 'Failed to load email logs.');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeView === 'history') {
      fetchLogs();
    }
  }, [activeView]);

  // ── Apply Quick Template ───────────────────────────────────────────────────
  const applyTemplate = (tmpl: (typeof QUICK_TEMPLATES)[0]) => {
    setSubject(tmpl.subject);
    setMessage(tmpl.message);
    setSendSuccessMessage('');
    setSendErrorMessage('');
  };

  // ── Validate Before Send Confirmation ──────────────────────────────────────
  const handleOpenConfirm = () => {
    setSendSuccessMessage('');
    setSendErrorMessage('');

    if (!selectedStudent) {
      notifyWarning('Please select a student from the dropdown first.');
      return;
    }
    if (!subject.trim()) {
      notifyWarning('Please enter an email subject.');
      return;
    }
    if (!message.trim()) {
      notifyWarning('Please enter the email message body.');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // ── Execute Send Email ─────────────────────────────────────────────────────
  const handleConfirmSend = async () => {
    if (!selectedStudent) return;
    setIsSending(true);
    setSendSuccessMessage('');
    setSendErrorMessage('');

    try {
      const token = await getAdminIdToken();

      const payload = {
        studentUid: selectedStudent.uid,
        subject: subject.trim(),
        message: message.trim(),
      };

      const res = await fetch(`${API_BASE}/send-student-email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `Server error (${res.status})`);
      }

      if (data.deliveryUncertain) {
        notifyWarning('Email delivery status is uncertain. Please check history before resending.');
        setSendErrorMessage(data.message || 'Delivery status uncertain.');
      } else {
        const successMsg = `Email submitted successfully to ${data.recipientEmail || selectedStudent.email} via Admin EmailJS!`;
        notifySuccess(successMsg, 'Email Sent');
        setSendSuccessMessage(successMsg);
        setIsConfirmModalOpen(false);

        // Reset composer but keep student selected
        setSubject('');
        setMessage('');

        // Refresh history in background
        fetchLogs();
      }
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : 'Failed to send email.';
      notifyError(errText, 'Email Send Failed');
      setSendErrorMessage(errText);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* ── Header Card ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 font-semibold text-xs tracking-wider uppercase mb-1">
              <Mail className="w-4 h-4" />
              <span>KCET GenZ Communication Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Admin Email Notifications
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Select any registered student to dispatch custom, branded emails directly to their verified Gmail address using the dedicated Admin EmailJS service.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView('compose')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeView === 'compose'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose Email</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeView === 'history'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Sending History</span>
            </button>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-slate-100 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Firebase Admin Auth
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-medium border border-blue-200/60">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            Recipient Gmail Derived Server-Side (Zero Client Spoofing)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-medium border border-purple-200/60">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Dedicated Admin EmailJS Account
          </span>
        </div>
      </div>

      {/* ── VIEW: COMPOSE EMAIL ────────────────────────────────────────────── */}
      {activeView === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Feedback Banners */}
            {sendSuccessMessage && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Email Successfully Sent</p>
                  <p className="text-xs text-emerald-700 mt-0.5">{sendSuccessMessage}</p>
                </div>
              </div>
            )}

            {sendErrorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-fade-in">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Sending Failed</p>
                  <p className="text-xs text-rose-700 mt-0.5">{sendErrorMessage}</p>
                </div>
              </div>
            )}

            {/* 1. Student Selection Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    1
                  </div>
                  <h2 className="text-base font-bold text-slate-800">Select Registered Student</h2>
                </div>
                <button
                  type="button"
                  onClick={() => fetchStudents()}
                  disabled={isLoadingStudents}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                  title="Refresh student list from Firebase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStudents ? 'animate-spin' : ''}`} />
                  <span>Refresh List</span>
                </button>
              </div>

              {/* Searchable Dropdown Container */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Search by Student Name, Registered Gmail, or Student ID:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Type name (e.g. Ullas), Gmail (e.g. student@gmail.com), or ID..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-slate-800 transition-all"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-72 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl divide-y divide-slate-100 animate-fade-in">
                    {isLoadingStudents ? (
                      <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Searching registered students...</span>
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No registered students match &quot;{searchTerm}&quot;.
                      </div>
                    ) : (
                      filteredStudents.map((st) => (
                        <button
                          key={st.uid}
                          type="button"
                          onClick={() => {
                            setSelectedStudent(st);
                            setIsDropdownOpen(false);
                            setSearchTerm('');
                          }}
                          className={`w-full text-left p-3 hover:bg-blue-50/70 transition-colors flex items-center justify-between ${
                            selectedStudent?.uid === st.uid ? 'bg-blue-50/90' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                              {st.name ? st.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-tight">{st.name}</p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                                <span>{st.email}</span>
                              </p>
                            </div>
                          </div>
                          {st.studentId && (
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {st.studentId}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Student Display Card */}
              {selectedStudent ? (
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/80 space-y-2 relative animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      Recipient Selected
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors font-medium"
                    >
                      Change Student
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">Student Name</p>
                      <p className="font-bold text-slate-800 text-sm">{selectedStudent.name}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                        <span>Registered Gmail</span>
                        <span title="Read-only from Firebase Auth"><Lock className="w-2.5 h-2.5 text-blue-600" /></span>
                      </p>
                      <p className="font-mono font-bold text-blue-700 bg-white/80 px-2 py-1 rounded border border-blue-200/60 inline-block text-xs mt-0.5">
                        {selectedStudent.email}
                      </p>
                    </div>

                    {selectedStudent.studentId && (
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-400">Student ID</p>
                        <p className="font-mono text-slate-700">{selectedStudent.studentId}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">Firebase UID</p>
                      <p className="font-mono text-[11px] text-slate-500 truncate" title={selectedStudent.uid}>
                        {selectedStudent.uid}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-500 text-center">
                  No student selected yet. Use the search bar above to select a registered student.
                </div>
              )}
            </div>

            {/* 2. Email Composer Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    2
                  </div>
                  <h2 className="text-base font-bold text-slate-800">Email Composer</h2>
                </div>

                <span className="text-[11px] text-slate-400">Supports multiline messages</span>
              </div>

              {/* Quick Template Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Quick Insert Templates:
                </label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyTemplate(tmpl)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-all text-left"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Email Subject *</label>
                  <span className="text-[10px] text-slate-400">{subject.length} / 200</span>
                </div>
                <input
                  type="text"
                  maxLength={200}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. KCET Mock Test 04 Solution & Rank Analysis Ready"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-slate-800 font-medium transition-all"
                />
              </div>

              {/* Message Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Message Body *</label>
                  <span className="text-[10px] text-slate-400">{message.length} / 5000</span>
                </div>
                <textarea
                  rows={8}
                  maxLength={5000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here. Line breaks and paragraphs are preserved exactly as written..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-slate-800 leading-relaxed font-normal transition-all"
                />
              </div>

              {/* Send Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenConfirm}
                  disabled={!selectedStudent || !subject.trim() || !message.trim()}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Review & Send Email Notification</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Email Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Live Student Email Preview</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold font-mono">
                  KCET GenZ Branded
                </span>
              </div>

              {/* Mock Email Frame */}
              <div className="rounded-2xl border border-slate-200/90 bg-white shadow-lg overflow-hidden">
                {/* Email Client Header Bar */}
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">Gmail Web / Mobile View</span>
                </div>

                {/* Sender & Recipient Metadata */}
                <div className="p-4 bg-slate-50/60 border-b border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-400 font-semibold w-16 text-right shrink-0">From:</span>
                    <span className="text-slate-800 font-medium">
                      KCET GenZ Admin &lt;notifications@kcetgenz.app&gt;
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-400 font-semibold w-16 text-right shrink-0">To:</span>
                    <span className="font-mono text-blue-700 font-semibold">
                      {selectedStudent ? `${selectedStudent.name} <${selectedStudent.email}>` : 'student@gmail.com'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-400 font-semibold w-16 text-right shrink-0">Subject:</span>
                    <span className="text-slate-900 font-bold">
                      {subject.trim() || 'Your KCET GenZ Notification Subject Here'}
                    </span>
                  </div>
                </div>

                {/* Branded Email Body */}
                <div className="p-5 space-y-4 bg-white text-slate-800">
                  {/* Neon Header Banner */}
                  <div className="rounded-xl p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm">
                        KG
                      </div>
                      <div>
                        <h3 className="font-bold text-sm tracking-tight">KCET GenZ Official Notice</h3>
                        <p className="text-[10px] text-blue-100">Karnataka CET Entrance Prep Hub</p>
                      </div>
                    </div>
                  </div>

                  {/* Greeting */}
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Hello {selectedStudent ? selectedStudent.name : 'Student'},
                    </p>
                  </div>

                  {/* Message Content */}
                  <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed min-h-[120px] p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                    {message.trim() ||
                      'Your custom message will appear here exactly as written, preserving line breaks and formatting.'}
                  </div>

                  {/* CTA Button Mock */}
                  <div className="pt-2 text-center">
                    <span className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 shadow-sm cursor-default">
                      Open KCET GenZ Mobile App
                    </span>
                  </div>

                  {/* Footer Notice */}
                  <div className="pt-4 border-t border-slate-100 text-center space-y-1 text-[10px] text-slate-400">
                    <p>© 2026 KCET GenZ Platform • Karnataka Exam Preparation</p>
                    <p>This is a verified administrative communication sent to your registered student address.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW: SENDING HISTORY ──────────────────────────────────────────── */}
      {activeView === 'history' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <span>Admin Notification Sending History</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every email dispatched through the Admin EmailJS integration is securely logged in Firestore.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchLogs}
              disabled={isLoadingLogs}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              <span>Refresh History</span>
            </button>
          </div>

          {logsError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{logsError}</span>
            </div>
          )}

          {isLoadingLogs ? (
            <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span>Loading email dispatch logs from Firestore...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No email notification logs found. Newly sent emails will appear here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'Just now'}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{log.recipientName || 'Student'}</p>
                        <p className="text-[11px] font-mono text-blue-600">{log.recipientEmail}</p>
                      </td>
                      <td className="p-3 max-w-xs truncate font-medium text-slate-800" title={log.subject}>
                        {log.subject}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {log.status === 'SUBMITTED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Submitted
                          </span>
                        ) : log.status === 'UNCERTAIN' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Uncertain
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200" title={log.error || ''}>
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {log.adminEmail || 'admin'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── CONFIRMATION MODAL ──────────────────────────────────────────────── */}
      {isConfirmModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600">
                <Send className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">Confirm Email Dispatch</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSending}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are about to dispatch an official notification email to the following registered student:
            </p>

            {/* Recipient Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Recipient Name:</span>
                <span className="font-bold text-slate-800">{selectedStudent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Registered Gmail:</span>
                <span className="font-mono font-bold text-blue-700">{selectedStudent.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Subject:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={subject}>
                  {subject}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Email Provider:</span>
                <span className="font-semibold text-purple-700">Dedicated Admin EmailJS</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Changes take effect immediately. Once submitted to EmailJS, the email cannot be recalled.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                disabled={isSending}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting to EmailJS...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm & Send Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
