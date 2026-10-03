import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Crown, 
  ShieldAlert, 
  Activity, 
  Users, 
  PowerOff, 
  Edit3, 
  Ban, 
  CheckCircle, 
  Trash2, 
  Send, 
  FileSpreadsheet, 
  Phone, 
  Mail, 
  UserCheck 
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { User, StudentTestResult } from '../../types';

export const StudentsTab: React.FC = () => {
  const { 
    students, 
    studentTestResults, 
    togglePremium, 
    updateStudent, 
    blockStudent, 
    unblockStudent, 
    forceLogoutStudent, 
    forceLogoutAllStudents, 
    deleteStudentPermanently,
    saveTestResult,
    deleteTestResult,
    sendBroadcast 
  } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'PREMIUM' | 'FREE' | 'BLOCKED'>('ALL');

  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [blockingStudent, setBlockingStudent] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [viewingResultsStudent, setViewingResultsStudent] = useState<User | null>(null);
  const [messagingStudent, setMessagingStudent] = useState<User | null>(null);
  const [directMsgTitle, setDirectMsgTitle] = useState('');
  const [directMsgBody, setDirectMsgBody] = useState('');
  const [editingResult, setEditingResult] = useState<StudentTestResult | null>(null);

  const totalCount = students.length;
  const premiumCount = students.filter(s => s.isPremium).length;
  const activeNowCount = students.filter(s => s.isActiveNow).length;
  const blockedCount = students.filter(s => s.isBlocked).length;

  const handleBlockConfirm = async () => {
    if (!blockingStudent) return;
    if (!blockReason.trim()) {
      alert('Mandatory block reason is required.');
      return;
    }
    await blockStudent(blockingStudent.uid, blockReason);
    setBlockingStudent(null);
    setBlockReason('');
  };

  const handleEditProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    await updateStudent({
      uid: editingStudent.uid,
      name: editingStudent.name,
      email: editingStudent.email,
      targetStream: editingStudent.targetStream,
      kcetTargetRank: editingStudent.kcetTargetRank
    });
    setEditingStudent(null);
  };

  const handleSendDirectMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagingStudent || !directMsgTitle.trim() || !directMsgBody.trim()) return;

    await sendBroadcast({
      title: directMsgTitle,
      message: directMsgBody,
      type: 'SYSTEM',
      actionType: 'NAV_PROFILE',
      targetUserId: messagingStudent.uid,
      targetUserEmail: messagingStudent.email
    });

    setMessagingStudent(null);
    setDirectMsgTitle('');
    setDirectMsgBody('');
    alert(`Direct notification sent to ${messagingStudent.name}`);
  };

  const handleScoreEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;
    const percentage = Number(((editingResult.score / editingResult.maxScore) * 100).toFixed(1));
    await saveTestResult({
      ...editingResult,
      percentage
    });
    setEditingResult(null);
  };

  const filtered = students.filter(s => {
    if (filterMode === 'PREMIUM' && !s.isPremium) return false;
    if (filterMode === 'FREE' && s.isPremium) return false;
    if (filterMode === 'BLOCKED' && !s.isBlocked) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q)) ||
      (s.studentId && s.studentId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-card border border-admin-cardBorder p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-admin-muted">Total Registered</span>
            <div className="text-2xl font-extrabold text-admin-heading mt-0.5">{totalCount}</div>
            <span className="text-[10px] text-slate-400">KCET Aspirants</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-admin-primary">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-card border border-admin-cardBorder p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-admin-muted">Premium Members</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-0.5">{premiumCount}</div>
            <span className="text-[10px] text-amber-600 font-semibold">Unlocked Access</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Crown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-card border border-admin-cardBorder p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-admin-muted">Active Now</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">{activeNowCount}</div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-card border border-admin-cardBorder p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-admin-muted">Blocked Accounts</span>
            <div className="text-2xl font-extrabold text-red-600 mt-0.5">{blockedCount}</div>
            <span className="text-[10px] text-red-500">Restricted Access</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Emergency Action & Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-card border border-admin-cardBorder shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'ALL' ? 'bg-admin-tab text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Students ({totalCount})
          </button>
          <button
            onClick={() => setFilterMode('PREMIUM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'PREMIUM' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            Premium ({premiumCount})
          </button>
          <button
            onClick={() => setFilterMode('FREE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'FREE' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Free ({totalCount - premiumCount})
          </button>
          <button
            onClick={() => setFilterMode('BLOCKED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'BLOCKED' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            Blocked ({blockedCount})
          </button>
        </div>

        <button
          onClick={() => {
            if (confirm("EMERGENCY ACTION: Force logout all student active sessions?")) {
              forceLogoutAllStudents();
              alert("Force logout command broadcasted to all students.");
            }
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition-colors active:scale-95 shrink-0"
        >
          <PowerOff className="w-3.5 h-3.5" />
          <span>Force Logout All Students</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search students by name, email, phone, or Student ID (KCET-XXXXXX)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-admin-cardBorder rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary shadow-sm"
        />
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(s => (
          <div
            key={s.uid}
            className={`bg-white rounded-card border p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between ${
              s.isBlocked ? 'border-red-300 bg-red-50/20' : 'border-admin-cardBorder'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={s.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={s.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-admin-heading">{s.name}</h4>
                      {s.isActiveNow && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online now" />
                      )}
                    </div>
                    <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {s.studentId || `KCET-${s.uid.slice(-6).toUpperCase()}`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {s.isPremium ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      <Crown className="w-3 h-3 text-amber-600" />
                      PREMIUM
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      FREE
                    </span>
                  )}

                  {s.isBlocked ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                      BLOCKED
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{s.email}</span>
                </div>
                {s.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>+91 {s.phone}</span>
                  </div>
                )}
                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Stream: <strong>{s.targetStream}</strong></span>
                  <span>Rank: <strong className="text-indigo-600">{s.kcetTargetRank}</strong></span>
                </div>
                {s.isBlocked && s.blockReason && (
                  <div className="pt-1 text-[11px] text-red-600 font-medium">
                    Reason: {s.blockReason}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap text-xs">
              <button
                onClick={() => togglePremium(s.uid, s.isPremium)}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 ${
                  s.isPremium
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-800'
                }`}
              >
                <Crown className="w-3 h-3 text-amber-600" />
                {s.isPremium ? 'Revoke Premium' : 'Grant Premium'}
              </button>

              <button
                onClick={() => setEditingStudent({ ...s })}
                className="p-1.5 rounded-lg text-slate-500 hover:text-admin-primary hover:bg-slate-100"
                title="Edit Student Profile"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewingResultsStudent(s)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                title="View & Edit Test Scores"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setMessagingStudent(s);
                  setDirectMsgTitle(`Update for ${s.name}`);
                  setDirectMsgBody('');
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                title="Send Direct Push Notification"
              >
                <Send className="w-4 h-4" />
              </button>

              {s.isBlocked ? (
                <button
                  onClick={() => unblockStudent(s.uid)}
                  className="px-2.5 py-1.5 rounded-lg font-bold text-[11px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1"
                >
                  <UserCheck className="w-3 h-3" />
                  Unblock
                </button>
              ) : (
                <button
                  onClick={() => {
                    setBlockingStudent(s);
                    setBlockReason('');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50"
                  title="Block Student"
                >
                  <Ban className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  if (confirm(`Force logout active session for ${s.name}?`)) {
                    forceLogoutStudent(s.uid);
                    alert(`Force logout triggered for ${s.name}.`);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                title="Force Logout Student"
              >
                <PowerOff className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (confirm(`Permanently delete student ${s.name} (${s.email}) and blacklist identity in deleted_students?`)) {
                    deleteStudentPermanently(s.uid, s.email);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-admin-destructive hover:bg-red-50"
                title="Delete Permanently"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <h3 className="font-bold text-base text-admin-heading mb-4 pb-2 border-b border-slate-100">
              Edit Student Profile
            </h3>
            <form onSubmit={handleEditProfileSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Email Address</label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Target Stream</label>
                <input
                  type="text"
                  value={editingStudent.targetStream}
                  onChange={(e) => setEditingStudent({ ...editingStudent, targetStream: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">KCET Target Rank</label>
                <input
                  type="text"
                  value={editingStudent.kcetTargetRank}
                  onChange={(e) => setEditingStudent({ ...editingStudent, kcetTargetRank: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-admin-primary hover:bg-indigo-700 rounded-xl shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {blockingStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-base text-admin-heading">Block Student Account</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Blocking will immediately log out <strong>{blockingStudent.name}</strong>.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-admin-heading mb-1">
                Mandatory Block Reason
              </label>
              <textarea
                rows={3}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Reason for suspension or ban..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBlockingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBlockConfirm}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Push Modal */}
      {messagingStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <h3 className="font-bold text-base text-admin-heading mb-1">
              Send Private Notification
            </h3>
            <p className="text-xs text-admin-muted mb-4">
              Direct alert for <strong>{messagingStudent.name}</strong>
            </p>

            <form onSubmit={handleSendDirectMsg} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Alert Title</label>
                <input
                  type="text"
                  value={directMsgTitle}
                  onChange={(e) => setDirectMsgTitle(e.target.value)}
                  placeholder="e.g. Regarding your KCET mock submission"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Message Content</label>
                <textarea
                  rows={3}
                  value={directMsgBody}
                  onChange={(e) => setDirectMsgBody(e.target.value)}
                  placeholder="Type direct message for this student..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMessagingStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-admin-primary hover:bg-indigo-700 rounded-xl shadow"
                >
                  Send Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Test Results Modal */}
      {viewingResultsStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-2xl w-full p-6 shadow-2xl animate-fadeIn max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-admin-heading">
                  Exam History & Score Records
                </h3>
                <p className="text-xs text-admin-muted">
                  Student: <strong>{viewingResultsStudent.name}</strong> ({viewingResultsStudent.email})
                </p>
              </div>
              <button
                onClick={() => setViewingResultsStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {studentTestResults.filter(r => r.studentUid === viewingResultsStudent.uid).length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No exam attempts recorded yet for this student.
                </div>
              ) : (
                studentTestResults.filter(r => r.studentUid === viewingResultsStudent.uid).map(res => (
                  <div key={res.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-admin-heading">{res.testTitle}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Score: <strong className="text-indigo-700">{res.score} / {res.maxScore}</strong></span>
                        <span>-</span>
                        <span>Percentage: <strong className="text-emerald-700">{res.percentage}%</strong></span>
                        <span>-</span>
                        <span>Correct: {res.correctCount}, Wrong: {res.wrongCount}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Attempted on {res.attemptDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingResult({ ...res })}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Score
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this test attempt record?")) {
                            deleteTestResult(res.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                        title="Delete attempt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Score Editor Dialog */}
      {editingResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <h3 className="font-bold text-base text-admin-heading mb-1">
              Adjust Student Test Score
            </h3>
            <p className="text-xs text-slate-500 mb-4">{editingResult.testTitle}</p>

            <form onSubmit={handleScoreEditSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-admin-heading mb-1">Score Obtained</label>
                  <input
                    type="number"
                    value={editingResult.score}
                    onChange={(e) => setEditingResult({ ...editingResult, score: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-admin-heading mb-1">Max Score</label>
                  <input
                    type="number"
                    value={editingResult.maxScore}
                    onChange={(e) => setEditingResult({ ...editingResult, maxScore: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-admin-heading mb-1">Correct Count</label>
                  <input
                    type="number"
                    value={editingResult.correctCount}
                    onChange={(e) => setEditingResult({ ...editingResult, correctCount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-admin-heading mb-1">Wrong Count</label>
                  <input
                    type="number"
                    value={editingResult.wrongCount}
                    onChange={(e) => setEditingResult({ ...editingResult, wrongCount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingResult(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-admin-primary hover:bg-indigo-700 rounded-xl shadow"
                >
                  Update Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
