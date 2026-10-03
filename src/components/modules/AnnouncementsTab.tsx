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







          {/* Specific Student Selector Dropdown (Shown when Specific Student is selected) */}



          {targetMode === 'specific' && (



            <div className="p-4 bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl space-y-3 animate-fadeIn">



              <div className="flex items-center justify-between">



                <label className="text-sm font-black text-indigo-950 flex items-center gap-1.5">



                  <UserIcon className="w-4 h-4 text-indigo-600" />



                  <span>Select Target Student from Database ({students.length} Registered)</span>



                </label>



              </div>







              {/* Search input to quickly filter students */}



              <div className="relative">



                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />



                <input



                  type="text"



                  value={studentSearchQuery}



                  onChange={(e) => setStudentSearchQuery(e.target.value)}



                  placeholder="Type name, email, or Student ID to search..."



                  className="w-full pl-9 pr-3 py-2 bg-white border border-indigo-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"



                />



              </div>







              {/* Student Select Dropdown */}



              <div className="relative">



                <select



                  value={selectedStudentUid}



                  onChange={(e) => setSelectedStudentUid(e.target.value)}



                  className="w-full h-12 px-3 bg-white border border-indigo-400 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"



                  required



                >



                  <option value="">-- Choose a Student ({filteredStudents.length} matches) --</option>



                  {filteredStudents.map(student => (



                    <option key={student.uid} value={student.uid}>



                      {student.name} ({student.email}) {student.studentId ? `• ID: ${student.studentId}` : ''} {student.kcetTargetRank ? `• Rank: ${student.kcetTargetRank}` : ''}



                    </option>



                  ))}



                </select>



              </div>







              {/* Selected Student Info Card */}



              {selectedStudent && (



                <div className="p-2.5 bg-white rounded-xl border border-indigo-200 flex items-center justify-between text-sm">



                  <div>



                    <span className="font-extrabold text-slate-900 block">{selectedStudent.name}</span>



                    <span className="text-[11px] text-slate-500 font-medium">{selectedStudent.email} • ID: {selectedStudent.studentId || selectedStudent.uid.slice(0, 8)}</span>



                  </div>



                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">



                    Target Ready



                  </span>



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



