import React, { useState } from 'react';

import { Bell, Send, X, ShieldAlert, Sparkles } from 'lucide-react';

import { useAdminData } from '../../context/AdminDataContext';

import { NotificationType, ActionRoute } from '../../types';



interface BroadcastModalProps {

  isOpen: boolean;

  onClose: () => void;

}



export const BroadcastNotifModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose }) => {

  const { sendBroadcast, notifySuccess } = useAdminData();

  const [title, setTitle] = useState('');

  const [message, setMessage] = useState('');

  const [type, setType] = useState<NotificationType>('ANNOUNCEMENT');

  const [actionRoute, setActionRoute] = useState<ActionRoute>('NAV_PRACTICE');

  const [targetMode, setTargetMode] = useState<'ALL' | 'SPECIFIC'>('ALL');

  const [targetIdentifier, setTargetIdentifier] = useState('');

  const [pinBanner, setPinBanner] = useState(true);

  const [isSending, setIsSending] = useState(false);



  if (!isOpen) return null;



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!title.trim() || !message.trim()) return;



    setIsSending(true);

    try {

      await sendBroadcast(

        {

          title,

          message,

          type,

          actionType: actionRoute,

          targetUserId: targetMode === 'SPECIFIC' ? targetIdentifier : undefined,

          targetUserEmail: targetMode === 'SPECIFIC' && targetIdentifier.includes('@') ? targetIdentifier : undefined

        },

        pinBanner

      );

      onClose();

      notifySuccess('Broadcast notification pushed to students successfully!', 'Broadcast Sent');

    } finally {

      setIsSending(false);

    }

  };



  return (

    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl animate-fadeIn">

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">

          <div className="flex items-center gap-2 text-admin-heading">

            <div className="p-2 rounded-xl bg-indigo-50 text-admin-primary">

              <Bell className="w-5 h-5" />

            </div>

            <div>

              <h3 className="font-bold text-base leading-none">Instant Broadcast Notification</h3>

              <p className="text-sm text-admin-muted mt-1">Push alerts with deep-links to student devices</p>

            </div>

          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100">

            <X className="w-5 h-5" />

          </button>

        </div>



        <form onSubmit={handleSubmit} className="space-y-3.5">

          <div>

            <label className="block text-sm font-semibold text-admin-heading mb-1">Notification Title</label>

            <input

              type="text"

              value={title}

              onChange={(e) => setTitle(e.target.value)}

              placeholder="e.g. KCET 2026 Counseling Mock Allotment"

              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"

              required

            />

          </div>



          <div>

            <label className="block text-sm font-semibold text-admin-heading mb-1">Notification Body</label>

            <textarea

              rows={3}

              value={message}

              onChange={(e) => setMessage(e.target.value)}

              placeholder="Type message text here..."

              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"

              required

            />

          </div>



          <div className="grid grid-cols-2 gap-3">

            <div>

              <label className="block text-sm font-semibold text-admin-heading mb-1">Type Tag</label>

              <select

                value={type}

                onChange={(e) => setType(e.target.value as NotificationType)}

                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"

              >

                <option value="ANNOUNCEMENT">Announcement</option>

                <option value="EXAM_ALERT">Exam Alert</option>

                <option value="STUDY_MATERIAL">Study Material</option>

                <option value="COUNSELLING">Counselling</option>

                <option value="SYSTEM">System Alert</option>

              </select>

            </div>



            <div>

              <label className="block text-sm font-semibold text-admin-heading mb-1">Action Deep Link</label>

              <select

                value={actionRoute}

                onChange={(e) => setActionRoute(e.target.value as ActionRoute)}

                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"

              >

                <option value="NAV_PRACTICE">Practice CBT Questions</option>

                <option value="NAV_TEST_SERIES">Mock Test Series</option>

                <option value="NAV_RESOURCES">Study Resources</option>

                <option value="NAV_COUNSELLING">College Cutoffs</option>

                <option value="NAV_PROFILE">User Profile</option>

                <option value="NONE">None</option>

              </select>

            </div>

          </div>



          <div>

            <label className="block text-sm font-semibold text-admin-heading mb-1">Audience</label>

            <div className="flex items-center gap-4 text-sm font-semibold text-slate-700">

              <label className="flex items-center gap-1.5 cursor-pointer">

                <input

                  type="radio"

                  name="modalTarget"

                  checked={targetMode === 'ALL'}

                  onChange={() => setTargetMode('ALL')}

                />

                <span>All Students</span>

              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">

                <input

                  type="radio"

                  name="modalTarget"

                  checked={targetMode === 'SPECIFIC'}

                  onChange={() => setTargetMode('SPECIFIC')}

                />

                <span>Specific Student UID / Email</span>

              </label>

            </div>



            {targetMode === 'SPECIFIC' && (

              <input

                type="text"

                value={targetIdentifier}

                onChange={(e) => setTargetIdentifier(e.target.value)}

                placeholder="Enter Student UID or email address..."

                className="mt-2 w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"

                required

              />

            )}

          </div>



          <div className="pt-1">

            <label className="flex items-center gap-2 text-sm font-bold text-admin-heading cursor-pointer">

              <input

                type="checkbox"

                checked={pinBanner}

                onChange={(e) => setPinBanner(e.target.checked)}

                className="w-4 h-4 text-admin-primary rounded"

              />

              <span>Also pin as Announcement Banner on student home screen</span>

            </label>

          </div>



          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">

            <button

              type="button"

              onClick={onClose}

              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"

            >

              Cancel

            </button>

            <button

              type="submit"

              disabled={isSending}

              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-admin-primary hover:bg-indigo-700 rounded-xl shadow disabled:opacity-50"

            >

              <Send className="w-3.5 h-3.5" />

              <span>{isSending ? 'Sending...' : 'Send Broadcast'}</span>

            </button>

          </div>

        </form>

      </div>

    </div>

  );

};

