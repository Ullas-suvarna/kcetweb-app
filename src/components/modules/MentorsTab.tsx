import React, { useState } from 'react';
import { 
  Users2, 
  Plus, 
  Star, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Mail, 
  Instagram, 
  Trash2, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { Mentor, SeniorChatBooking, BookingStatus } from '../../types';

export const MentorsTab: React.FC = () => {
  const { mentors, bookings, saveMentor, deleteMentor, updateBooking, sendBroadcast } = useAdminData();

  // Active view: "bookings" or "mentors"
  const [subSection, setSubSection] = useState<'bookings' | 'mentors'>('bookings');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Add Mentor Modal
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [mentorForm, setMentorForm] = useState<Mentor>({
    id: `m-${Date.now()}`,
    name: '',
    branch: '',
    college: '',
    currentYear: '3rd Year B.Tech',
    kcetRank: 'KCET Rank #',
    rating: 4.9,
    bio: '',
    email: '',
    instagram: '',
    photoUrl: ''
  });

  // Action Dialog for booking status change
  const [activeBooking, setActiveBooking] = useState<SeniorChatBooking | null>(null);
  const [actionType, setActionType] = useState<'confirm' | 'reschedule' | 'reject' | 'message' | null>(null);
  const [actionInput, setActionInput] = useState('');

  const statuses: BookingStatus[] = [
    'Under Verification',
    'Waiting for Senior Confirmation',
    'Confirmed',
    'Reschedule Needed',
    'Declined',
    'Expired'
  ];

  const handleOpenAddMentor = () => {
    setMentorForm({
      id: `m-${Date.now()}`,
      name: '',
      branch: 'Computer Science & Engineering',
      college: 'RV College of Engineering (RVCE)',
      currentYear: '3rd Year B.Tech',
      kcetRank: 'KCET Rank #150',
      rating: 4.9,
      bio: '',
      email: '',
      instagram: '',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    });
    setIsMentorModalOpen(true);
  };

  const handleSaveMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorForm.name.trim()) return;
    await saveMentor(mentorForm);
    setIsMentorModalOpen(false);
  };

  const handleExecuteBookingAction = async () => {
    if (!activeBooking) return;

    if (actionType === 'confirm') {
      await updateBooking({
        ...activeBooking,
        status: 'Confirmed',
        adminMessage: actionInput || 'Your senior mentoring call is confirmed. Link will be sent 30 mins before.'
      });
      await sendBroadcast({
        title: 'Mentoring Booking Confirmed! ??',
        message: `Your session with ${activeBooking.mentorName} on ${activeBooking.selectedDate} (${activeBooking.selectedTime}) is confirmed.`,
        type: 'BOOKING',
        targetUserId: activeBooking.userId,
        targetUserEmail: activeBooking.userEmail
      });
    } else if (actionType === 'reschedule') {
      await updateBooking({
        ...activeBooking,
        status: 'Reschedule Needed',
        adminMessage: actionInput || 'Mentor is unavailable at requested time. Please pick a new slot.'
      });
      await sendBroadcast({
        title: 'Action Needed: Reschedule Mentoring Session',
        message: `Senior mentor requested reschedule: "${actionInput}". Please choose a new slot.`,
        type: 'BOOKING',
        targetUserId: activeBooking.userId,
        targetUserEmail: activeBooking.userEmail
      });
    } else if (actionType === 'reject') {
      if (!actionInput.trim()) {
        alert('Please specify a rejection reason.');
        return;
      }
      await updateBooking({
        ...activeBooking,
        status: 'Declined',
        rejectionReason: actionInput
      });
      await sendBroadcast({
        title: 'Mentoring Booking Declined',
        message: `Your booking was declined: ${actionInput}. Refund initiated if applicable.`,
        type: 'BOOKING',
        targetUserId: activeBooking.userId,
        targetUserEmail: activeBooking.userEmail
      });
    } else if (actionType === 'message') {
      await updateBooking({
        ...activeBooking,
        adminMessage: actionInput
      });
      await sendBroadcast({
        title: `Message from KCET Gen Z Desk (${activeBooking.mentorName})`,
        message: actionInput,
        type: 'BOOKING',
        targetUserId: activeBooking.userId,
        targetUserEmail: activeBooking.userEmail
      });
    }

    setActiveBooking(null);
    setActionType(null);
    setActionInput('');
  };

  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-admin-cardBorder shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-admin-heading flex items-center gap-2">
            <Users2 className="w-5 h-5 text-admin-primary" />
            Senior Engineering Mentors & Live Counseling
          </h2>
          <p className="text-xs text-admin-muted mt-0.5">
            Manage top Karnataka ranker mentors and moderate 1-on-1 student counseling bookings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub Navigation toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSubSection('bookings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subSection === 'bookings' ? 'bg-white text-admin-primary shadow-sm' : 'text-slate-600'
              }`}
            >
              Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setSubSection('mentors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subSection === 'mentors' ? 'bg-white text-admin-primary shadow-sm' : 'text-slate-600'
              }`}
            >
              Mentors Directory ({mentors.length})
            </button>
          </div>

          <button
            onClick={handleOpenAddMentor}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-button bg-admin-royal hover:bg-blue-700 text-white font-bold text-xs shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Mentor</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: BOOKINGS */}
      {subSection === 'bookings' && (
        <div className="space-y-4">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-admin-tab text-white'
                  : 'bg-white text-slate-600 border border-admin-cardBorder'
              }`}
            >
              All Bookings ({bookings.length})
            </button>
            {statuses.map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-admin-tab text-white'
                    : 'bg-white text-slate-600 border border-admin-cardBorder'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Bookings List Cards */}
          <div className="space-y-3">
            {filteredBookings.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-card border border-admin-cardBorder text-slate-400">
                No bookings found for the selected status.
              </div>
            ) : (
              filteredBookings.map(b => (
                <div
                  key={b.bookingId}
                  className="bg-white rounded-card border border-admin-cardBorder p-5 shadow-sm hover:shadow transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {b.bookingId}
                        </span>
                        <h4 className="font-bold text-sm text-admin-heading">
                          {b.userName}
                        </h4>
                        <span className="text-xs text-slate-400">({b.userEmail})</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span>Assigned Mentor: <strong className="text-indigo-700">{b.mentorName}</strong></span>
                        <span>•</span>
                        <span>Fee: <strong className="text-emerald-700">?{b.amountPaid}</strong></span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-slate-400">Ref: {b.paymentRefNumber}</span>
                      </div>
                    </div>

                    <span className={`self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full ${
                      b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      b.status === 'Waiting for Senior Confirmation' ? 'bg-amber-100 text-amber-900' :
                      b.status === 'Under Verification' ? 'bg-blue-100 text-blue-900' :
                      b.status === 'Reschedule Needed' ? 'bg-purple-100 text-purple-900' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        Date: <strong>{b.selectedDate}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-500" />
                        Time: <strong>{b.selectedTime}</strong>
                      </span>
                    </div>

                    {b.adminMessage && (
                      <div className="text-[11px] bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-slate-600">
                        Admin Note: {b.adminMessage}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap justify-end">
                    <button
                      onClick={() => {
                        setActiveBooking(b);
                        setActionType('confirm');
                        setActionInput('Your senior mentoring call is confirmed. Google Meet link will be dispatched 30 mins prior.');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Confirm
                    </button>

                    <button
                      onClick={() => {
                        setActiveBooking(b);
                        setActionType('reschedule');
                        setActionInput('Senior mentor is occupied with university exams. Please select another slot.');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reschedule
                    </button>

                    <button
                      onClick={() => {
                        setActiveBooking(b);
                        setActionType('reject');
                        setActionInput('Invalid transaction reference number.');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold border border-red-200 transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Decline
                    </button>

                    <button
                      onClick={() => {
                        setActiveBooking(b);
                        setActionType('message');
                        setActionInput('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Direct Msg
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: MENTORS DIRECTORY */}
      {subSection === 'mentors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentors.map(m => (
            <div
              key={m.id}
              className="bg-white rounded-card border border-admin-cardBorder p-5 shadow-sm hover:shadow transition-shadow flex gap-4"
            >
              <img
                src={m.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={m.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-admin-heading">{m.name}</h4>
                    <p className="text-xs text-indigo-700 font-semibold">{m.kcetRank}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remove mentor ${m.name}?`)) {
                        deleteMentor(m.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 mt-1">{m.branch}</p>
                <p className="text-xs text-slate-500 font-medium">{m.college} ({m.currentYear})</p>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {m.bio}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{m.rating} Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.email && <span className="text-[11px] text-slate-400">{m.email}</span>}
                    {m.instagram && <span className="text-[11px] text-pink-600 font-semibold">{m.instagram}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Action Modal */}
      {activeBooking && actionType && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <h3 className="font-bold text-base text-admin-heading mb-1 capitalize">
              {actionType === 'confirm' ? 'Confirm Mentoring Slot' :
               actionType === 'reschedule' ? 'Request Reschedule' :
               actionType === 'reject' ? 'Decline Booking' : 'Send Direct Message to Student'}
            </h3>
            <p className="text-xs text-admin-muted mb-4">
              Student: <strong>{activeBooking.userName}</strong> ({activeBooking.userEmail})
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-admin-heading mb-1.5">
                {actionType === 'reject' ? 'Rejection Reason (Required)' : 'Message / Instructions for Student'}
              </label>
              <textarea
                rows={3}
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="Type details here..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => { setActiveBooking(null); setActionType(null); }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBookingAction}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow ${
                  actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  actionType === 'confirm' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  'bg-admin-primary hover:bg-indigo-700'
                }`}
              >
                Execute Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Mentor Modal */}
      {isMentorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-admin-heading mb-4 pb-2 border-b border-slate-100">
              Onboard Senior Engineering Mentor
            </h3>
            <form onSubmit={handleSaveMentor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Mentor Full Name</label>
                <input
                  type="text"
                  value={mentorForm.name}
                  onChange={(e) => setMentorForm({ ...mentorForm, name: e.target.value })}
                  placeholder="e.g. Rohan Deshmukh"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-admin-heading mb-1">Engineering Branch</label>
                  <input
                    type="text"
                    value={mentorForm.branch}
                    onChange={(e) => setMentorForm({ ...mentorForm, branch: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-admin-heading mb-1">College Name</label>
                  <input
                    type="text"
                    value={mentorForm.college}
                    onChange={(e) => setMentorForm({ ...mentorForm, college: e.target.value })}
                    placeholder="e.g. RVCE Bengaluru"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-admin-heading mb-1">Current Year</label>
                  <input
                    type="text"
                    value={mentorForm.currentYear}
                    onChange={(e) => setMentorForm({ ...mentorForm, currentYear: e.target.value })}
                    placeholder="e.g. 3rd Year"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-admin-heading mb-1">KCET Rank</label>
                  <input
                    type="text"
                    value={mentorForm.kcetRank}
                    onChange={(e) => setMentorForm({ ...mentorForm, kcetRank: e.target.value })}
                    placeholder="Rank #142"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-admin-heading mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.01"
                    max="5.0"
                    value={mentorForm.rating}
                    onChange={(e) => setMentorForm({ ...mentorForm, rating: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Experience & Bio</label>
                <textarea
                  rows={2}
                  value={mentorForm.bio}
                  onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })}
                  placeholder="Tell students how you cracked KCET and what counseling tips you offer..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-admin-heading mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={mentorForm.email}
                    onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })}
                    placeholder="mentor@college.edu"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-admin-heading mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    value={mentorForm.instagram}
                    onChange={(e) => setMentorForm({ ...mentorForm, instagram: e.target.value })}
                    placeholder="@username"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Photo URL</label>
                <input
                  type="text"
                  value={mentorForm.photoUrl}
                  onChange={(e) => setMentorForm({ ...mentorForm, photoUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMentorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-admin-royal hover:bg-blue-700 rounded-xl shadow"
                >
                  Save Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
