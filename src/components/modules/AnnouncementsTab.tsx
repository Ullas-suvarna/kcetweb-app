import React, { useState } from 'react';



import { 



  Megaphone, 



  Bell, 



  Send, 



  Trash2, 



  Users, 



  User as UserIcon, 



  CheckCircle2, 



  AlertTriangle, 



  Pin, 



  Calendar, 



  Clock, 



  Sparkles,



  ChevronDown,



  Search



} from 'lucide-react';



import { useAdminData } from '../../context/AdminDataContext';



import { NotificationType, Notification, Announcement } from '../../types';







export const AnnouncementsTab: React.FC = () => {



  const { 



    announcements, 



    notifications, 



    students, 



    sendBroadcast, 



    deleteAnnouncement, 



    deleteNotification, 



    notifySuccess, 



    notifyError, 



    notifyWarning, 



    requestConfirm 



  } = useAdminData();







  // Announcement Form State (Card 1)



  const [ancTitle, setAncTitle] = useState('');



  const [ancMessage, setAncMessage] = useState('');



  const [isUrgent, setIsUrgent] = useState(false);



  const [isSendingAnc, setIsSendingAnc] = useState(false);







  // Push Notification Form State (Card 2)



  const [targetMode, setTargetMode] = useState<'global' | 'specific'>('global');



  const [selectedStudentUid, setSelectedStudentUid] = useState<string>('');



  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);



  const [notifCategory, setNotifCategory] = useState<NotificationType>('ANNOUNCEMENT');



  const [notifTitle, setNotifTitle] = useState('');



  const [notifMessage, setNotifMessage] = useState('');



  const [isSendingNotif, setIsSendingNotif] = useState(false);







  // Status Alerts



  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);







  // Filtered Students for Dropdown



  const filteredStudents = students.filter(s => {



    if (!studentSearchQuery.trim()) return true;



    const q = studentSearchQuery.toLowerCase();



    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.studentId && s.studentId.toLowerCase().includes(q));



  });







  const selectedStudent = students.find(s => s.uid === selectedStudentUid);







  // Handle Send Announcement (Card 1)



  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {



    e.preventDefault();



    if (!ancTitle.trim() || !ancMessage.trim()) {



      setStatusMsg({ text: 'Please enter both announcement title and message.', type: 'error' });



      return;



    }







    setIsSendingAnc(true);



    setStatusMsg(null);







    try {



      await sendBroadcast({



        title: ancTitle.trim(),



        message: ancMessage.trim(),



        type: isUrgent ? 'EXAM_ALERT' : 'ANNOUNCEMENT',



        actionType: 'NONE'



      }, true); // makeBanner = true







      setStatusMsg({ text: 'Official Announcement published to Home feed and broadcasted!', type: 'success' });
      notifySuccess('Official Announcement published to Home feed and broadcasted!', 'Announcement Broadcasted');



      setAncTitle('');



      setAncMessage('');



      setIsUrgent(false);



    } catch (err: any) {



      setStatusMsg({ text: 'Failed to broadcast announcement: ' + (err?.message || err), type: 'error' });



    } finally {



      setIsSendingAnc(false);



    }



  };







  // Handle Send Push Notification (Card 2)



  const handleSendPushNotification = async (e: React.FormEvent) => {



    e.preventDefault();



    if (!notifTitle.trim() || !notifMessage.trim()) {



      setStatusMsg({ text: 'Please enter notification title and message.', type: 'error' });



      return;



    }







    if (targetMode === 'specific' && !selectedStudentUid) {



      setStatusMsg({ text: 'Please select a specific student from the dropdown.', type: 'error' });



      return;



    }







    setIsSendingNotif(true);



    setStatusMsg(null);







    try {



      const targetUser = targetMode === 'specific' ? selectedStudent : null;







      await sendBroadcast({



        title: notifTitle.trim(),



        message: notifMessage.trim(),



        type: notifCategory,



        targetUserId: targetUser ? targetUser.uid : undefined,



        targetUserEmail: targetUser ? targetUser.email : undefined,



        actionType: notifCategory === 'COUNSELLING' ? 'NAV_COUNSELLING' : (notifCategory === 'STUDY_MATERIAL' ? 'NAV_RESOURCES' : 'NONE')



      }, false);







      setStatusMsg({ 



        text: targetMode === 'specific' 



          ? `Push notification sent directly to ${targetUser?.name || 'student'} (${targetUser?.email})!` 



          : 'Global Push Notification dispatched to all students!', 



        type: 'success' 



      });







      setNotifTitle('');



      setNotifMessage('');



    } catch (err: any) {



      setStatusMsg({ text: 'Failed to dispatch notification: ' + (err?.message || err), type: 'error' });



    } finally {



      setIsSendingNotif(false);



    }



  };







  const categories: { label: string; icon: string; type: NotificationType }[] = [



    { label: 'Announcement', icon: '📢', type: 'ANNOUNCEMENT' },



    { label: 'Exam Alert', icon: '🚨', type: 'EXAM_ALERT' },



    { label: 'Study Material', icon: '📚', type: 'STUDY_MATERIAL' },



    { label: 'Senior Chat', icon: '💬', type: 'BOOKING' },



    { label: 'Premium/Payment', icon: '💳', type: 'PAYMENT' },



    { label: 'System Notice', icon: '⚙️', type: 'SYSTEM' }



  ];







  return (



    <div className="w-full space-y-6 animate-fadeIn pb-16">



      {/* Global Status Message */}



      {statusMsg && (



        <div className={`p-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm ${



          statusMsg.type === 'success' 



            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 



            : 'bg-rose-50 text-rose-800 border border-rose-300'



        }`}>



          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : '⚠️'}



          <span>{statusMsg.text}</span>



        </div>



      )}







      {/* ============================================================ */}



      {/* CARD 1: Broadcast Official Announcement                      */}



      {/* ============================================================ */}



      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-4">



        {/* Title Header */}



        <div className="flex items-center gap-3">



          <div className="w-10 h-10 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center text-lg shadow shrink-0">



            🔔



          </div>



          <div>



            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">



              <span>📢</span> Broadcast Official Announcement



            </h2>



            <p className="text-sm text-slate-500 font-medium mt-0.5">



              Pushes to KCET Home feed & triggers status bar alert



            </p>



          </div>



        </div>







        <form onSubmit={handleBroadcastAnnouncement} className="space-y-4 pt-1">



          {/* Announcement Title */}



          <div className="relative">



            <input



              type="text"



              value={ancTitle}



              onChange={(e) => setAncTitle(e.target.value)}



              placeholder="Announcement Title (e.g., KCET 2026 Registration Open)"



              className="w-full h-14 px-4 bg-white border border-slate-400 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"



              required



            />



          </div>







          {/* Announcement Message Body */}



          <div className="relative">



            <textarea



              rows={4}



              value={ancMessage}



              onChange={(e) => setAncMessage(e.target.value)}



              placeholder="Announcement Message Body / Guidelines"



              className="w-full p-4 bg-white border border-slate-400 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"



              required



            />



          </div>







          {/* Standard / Urgent Toggle Box */}



          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200 p-4 flex items-center justify-between">



            <div>



              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">



                <span>📌</span> {isUrgent ? 'Urgent / Important Announcement' : 'Standard Announcement'}



              </h4>



              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">



                {isUrgent 



                  ? 'Highlighted in red banner with URGENT badge on student app'



                  : 'Displayed with standard blue announcement tag'}



              </p>



            </div>







            {/* Toggle Switch */}



            <button



              type="button"



              onClick={() => setIsUrgent(!isUrgent)}



              className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center ${



                isUrgent ? 'bg-[#DC2626] justify-end' : 'bg-slate-300 justify-start'



              }`}



            >



              <span className="w-6 h-6 rounded-full bg-white shadow-md block" />



            </button>



          </div>







          {/* Action Button */}



          <button



            type="submit"



            disabled={isSendingAnc}



            className="w-full h-14 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"



          >



            <span className="text-base">🔔</span>



            <span>{isSendingAnc ? 'Broadcasting...' : 'Broadcast Announcement to All Students'}</span>



          </button>



        </form>



      </div>







      {/* ============================================================ */}



      {/* CARD 2: Targeted Push Notification Engine                   */}



      {/* ============================================================ */}



      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-5">



        {/* Title Header */}



        <div className="flex items-center gap-3">



          <div className="w-10 h-10 rounded-2xl bg-[#0D9488] text-white flex items-center justify-center text-lg shadow shrink-0">



            🔔



          </div>



          <div>



            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">



              <span>🔔</span> Targeted Push Notification Engine



            </h2>



            <p className="text-sm text-slate-500 font-medium mt-0.5">



              Send instant custom alerts to all students or a specific user



            </p>



          </div>



        </div>







        <form onSubmit={handleSendPushNotification} className="space-y-4">



          {/* Target Audience Section */}



          <div className="space-y-2">



            <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">



              <span>🎯</span> Target Audience



            </label>







            <div className="grid grid-cols-2 gap-3">



              {/* Option 1: All Students (Global) */}



              <button



                type="button"



                onClick={() => {



                  setTargetMode('global');



                  setSelectedStudentUid('');



                }}



                className={`h-13 rounded-2xl text-sm font-bold transition-all border flex items-center justify-center gap-2 ${



                  targetMode === 'global'



                    ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5] shadow-sm font-black'



                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'



                }`}



              >



                <span>🌐</span>



                <span>All Students (Global)</span>



              </button>







              {/* Option 2: Specific Student */}



              <button



                type="button"



                onClick={() => setTargetMode('specific')}



                className={`h-13 rounded-2xl text-sm font-bold transition-all border flex items-center justify-center gap-2 ${



                  targetMode === 'specific'



                    ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5] shadow-sm font-black'



                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'



                }`}



              >



                <span>🎯</span>



                <span>Specific Student</span>



              </button>



            </div>



          </div>








          {/* Specific Student Selector — Custom Searchable Dropdown */}
          {targetMode === 'specific' && (
            <div className="p-4 bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl space-y-3 animate-fadeIn">

              {/* Label */}
              <label className="text-sm font-black text-indigo-950 flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-indigo-600" />
                <span>Select Target Student ({students.length} Registered)</span>
              </label>

              {/* Custom Dropdown */}
              <div className="relative">

                {/* Trigger button */}
                <button
                  type="button"
                  onClick={() => { setStudentDropdownOpen(prev => !prev); setStudentSearchQuery(''); }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold text-left transition-all bg-white ${selectedStudent ? 'border-indigo-400 text-slate-900' : 'border-indigo-300 text-slate-400'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  {selectedStudent ? (
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                        {selectedStudent.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                      <span className="min-w-0">
                        <span className="font-extrabold text-slate-900 block truncate">{selectedStudent.name}</span>
                        <span className="text-xs text-slate-500">{selectedStudent.email}{selectedStudent.studentId ? ` • ${selectedStudent.studentId}` : ''}</span>
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-slate-400">
                      <Search className="w-4 h-4" />
                      <span>Click to search &amp; select a student...</span>
                    </span>
                  )}
                  <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${studentDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {/* Dropdown panel */}
                {studentDropdownOpen && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-indigo-200 rounded-2xl shadow-2xl overflow-hidden">

                    {/* Search input inside dropdown */}
                    <div className="p-2 border-b border-slate-100 bg-white">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          autoFocus
                          type="text"
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          placeholder="Type name, email or Student ID..."
                          className="w-full pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
                        />
                        {studentSearchQuery && (
                          <button type="button" onClick={() => setStudentSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">✕</button>
                        )}
                      </div>
                    </div>

                    {/* Student list */}
                    <div className="max-h-56 overflow-y-auto">
                      {filteredStudents.length === 0 ? (
                        <div className="py-6 text-center text-sm text-slate-400 font-medium">No students match "{studentSearchQuery}"</div>
                      ) : (
                        filteredStudents.map((student) => (
                          <button
                            key={student.uid}
                            type="button"
                            onClick={() => { setSelectedStudentUid(student.uid); setStudentDropdownOpen(false); setStudentSearchQuery(''); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0 ${selectedStudentUid === student.uid ? 'bg-indigo-50' : ''}`}
                          >
                            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                              {student.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="font-extrabold text-slate-900 text-sm block truncate">{student.name}</span>
                              <span className="text-xs text-slate-500 block truncate">{student.email}</span>
                            </span>
                            <span className="flex flex-col items-end gap-1 shrink-0">
                              {student.studentId && <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">{student.studentId}</span>}
                              {student.isPremium && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">⭐ Pro</span>}
                            </span>
                            {selectedStudentUid === student.uid && <span className="text-indigo-600 font-black text-base shrink-0">✓</span>}
                          </button>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 font-medium text-center">
                      {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} {studentSearchQuery ? 'found' : 'registered'}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected student confirmation chip */}
              {selectedStudent && (
                <div className="p-2.5 bg-white rounded-xl border border-indigo-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                      {selectedStudent.name?.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <span className="font-extrabold text-slate-900 text-sm block truncate">{selectedStudent.name}</span>
                      <span className="text-xs text-slate-500 block">{selectedStudent.email}{selectedStudent.studentId ? ` • ${selectedStudent.studentId}` : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">✓ Target Ready</span>
                    <button type="button" onClick={() => { setSelectedStudentUid(''); }} className="text-slate-400 hover:text-red-500 text-sm font-bold transition-colors" title="Clear">✕</button>
                  </div>
                </div>
              )}

            </div>
          )}














          {/* Category Selector Chips */}



          <div className="space-y-2">



            <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">



              <span>🏷️</span> Category



            </label>







            <div className="flex flex-wrap gap-2">



              {categories.map(cat => {



                const isSelected = notifCategory === cat.type;



                return (



                  <button



                    key={cat.label}



                    type="button"



                    onClick={() => setNotifCategory(cat.type)}



                    className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 border ${



                      isSelected



                        ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5] shadow-sm font-black'



                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'



                    }`}



                  >



                    <span>{cat.icon}</span>



                    <span>{cat.label}</span>



                  </button>



                );



              })}



            </div>



          </div>







          {/* Notification Title */}



          <div className="relative">



            <input



              type="text"



              value={notifTitle}



              onChange={(e) => setNotifTitle(e.target.value)}



              placeholder="Notification Title"



              className="w-full h-14 px-4 bg-white border border-slate-400 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"



              required



            />



          </div>







          {/* Notification Message */}



          <div className="relative">



            <textarea



              rows={3}



              value={notifMessage}



              onChange={(e) => setNotifMessage(e.target.value)}



              placeholder="Notification Message"



              className="w-full p-4 bg-white border border-slate-400 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"



              required



            />



          </div>







          {/* Action Button */}



          <button



            type="submit"



            disabled={isSendingNotif}



            className="w-full h-14 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"



          >



            <span className="text-base">🔔</span>



            <span>



              {isSendingNotif 



                ? 'Dispatching...' 



                : targetMode === 'specific'



                ? `Send Targeted Push to ${selectedStudent ? selectedStudent.name : 'Student'}`



                : 'Send Global Push Notification'}



            </span>



          </button>



        </form>



      </div>







      {/* ============================================================ */}



      {/* SECTION 3: 📋 Published Announcements                         */}



      {/* ============================================================ */}



      <div className="space-y-3">



        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 px-1">



          <span>📋</span> Published Announcements ({announcements.length})



        </h3>







        {announcements.length === 0 ? (



          <div className="text-center py-8 bg-white rounded-3xl border border-slate-200 p-6">



            <p className="text-sm text-slate-500 font-medium">No announcements published yet.</p>



          </div>



        ) : (



          <div className="space-y-3">



            {announcements.map((anc) => (



              <div 



                key={anc.id}



                className="bg-white rounded-3xl border border-rose-200/80 p-5 shadow-sm space-y-2 relative"



              >



                <div className="flex items-start justify-between gap-3">



                  <div className="flex items-center gap-2 flex-wrap">



                    {anc.isImportant && (



                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">



                        <span>🚨</span> URGENT



                      </span>



                    )}



                    <h4 className="font-extrabold text-sm text-slate-900">



                      {anc.title}



                    </h4>



                  </div>







                  <button



                    onClick={async () => {



                      const ok = await requestConfirm({
                        title: 'Delete Announcement',
                        itemName: anc.title,
                        message: `Are you sure you want to remove this announcement from the student Home feed?`,
                        isDestructive: true
                      });
                      if (ok) {
                        await deleteAnnouncement(anc.id);
                        notifySuccess(`Announcement "${anc.title}" deleted.`, 'Announcement Deleted');
                      }



                    }}



                    className="text-rose-500 hover:text-rose-700 p-1 transition-colors"



                    title="Delete Announcement"



                  >



                    <Trash2 className="w-4 h-4" />



                  </button>



                </div>







                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">



                  <span>📅</span>



                  <span>{anc.date || 'Today'}</span>



                </div>







                <p className="text-sm text-slate-700 leading-relaxed pt-1">



                  {anc.message}



                </p>



              </div>



            ))}



          </div>



        )}



      </div>







      {/* ============================================================ */}



      {/* SECTION 4: ✉️ Notifications History                           */}



      {/* ============================================================ */}



      <div className="space-y-3">



        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 px-1">



          <span>✉️</span> Notifications History ({notifications.length})



        </h3>







        {notifications.length === 0 ? (



          <div className="text-center py-8 bg-white rounded-3xl border border-slate-200 p-6">



            <p className="text-sm text-slate-500 font-medium">No push notifications dispatched yet.</p>



          </div>



        ) : (



          <div className="space-y-3">



            {notifications.map((notif) => (



              <div 



                key={notif.id}



                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-2"



              >



                <div className="flex items-start justify-between gap-3">



                  <div className="flex items-center gap-2 flex-wrap">



                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-slate-100 text-slate-700">



                      {notif.type}



                    </span>







                    {notif.targetUserEmail ? (



                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">



                        <span>🎯</span> User: {notif.targetUserEmail.split('@')[0]}@



                      </span>



                    ) : (



                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-indigo-50 text-indigo-800">



                        🌐 Global



                      </span>



                    )}



                  </div>







                  <button



                    onClick={async () => {



                      if (confirm(`Delete notification "${notif.title}"?`)) {



                        await deleteNotification(notif.id);



                      }



                    }}



                    className="text-rose-500 hover:text-rose-700 p-1 transition-colors"



                    title="Delete Notification"



                  >



                    <Trash2 className="w-4 h-4" />



                  </button>



                </div>







                <h4 className="font-extrabold text-sm text-slate-900">



                  {notif.title}



                </h4>







                <p className="text-sm text-slate-600 leading-relaxed">



                  {notif.message}



                </p>







                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium pt-1">



                  <span>🕒</span>



                  <span>{notif.timestamp || 'Just now'}</span>



                </div>



              </div>



            ))}



          </div>



        )}



      </div>



    </div>



  );



};



