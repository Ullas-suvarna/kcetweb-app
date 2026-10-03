import React, { useState } from 'react';
import { Megaphone, Send, Bell, Trash2, Radio, Compass, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { NotificationType, ActionRoute, Notification } from '../../types';

export const AnnouncementsTab: React.FC = () => {
  const { announcements, notifications, sendBroadcast, deleteAnnouncement, deleteNotification } = useAdminData();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('ANNOUNCEMENT');
  const [actionRoute, setActionRoute] = useState<ActionRoute>('NAV_PRACTICE');
  const [targetMode, setTargetMode] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [targetIdentifier, setTargetIdentifier] = useState('');
  const [makeBanner, setMakeBanner] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const notificationTypes: NotificationType[] = [
    'ANNOUNCEMENT',
    'EXAM_ALERT',
    'STUDY_MATERIAL',
    'COUNSELLING',
    'SYSTEM',
    'PAYMENT',
    'BOOKING'
  ];

  const routes: { label: string; value: ActionRoute }[] = [
    { label: 'Practice Questions (NAV_PRACTICE)', value: 'NAV_PRACTICE' },
    { label: 'Mock Test Series (NAV_TEST_SERIES)', value: 'NAV_TEST_SERIES' },
    { label: 'Resources & Handbooks (NAV_RESOURCES)', value: 'NAV_RESOURCES' },
    { label: 'Colleges & Counselling (NAV_COUNSELLING)', value: 'NAV_COUNSELLING' },
    { label: 'User Profile & Premium (NAV_PROFILE)', value: 'NAV_PROFILE' },
    { label: 'None (Default Alert)', value: 'NONE' }
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Title and message are required.');
      return;
    }

    if (targetMode === 'SPECIFIC' && !targetIdentifier.trim()) {
      alert('Please enter a target Student UID or Email.');
      return;
    }

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
        makeBanner
      );

      setSuccessNotice(`Notification dispatched successfully to ${targetMode === 'ALL' ? 'all registered students' : targetIdentifier}!`);
      setTitle('');
      setMessage('');
      setTimeout(() => setSuccessNotice(null), 4000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-admin-cardBorder shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-admin-heading flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-admin-primary" />
            Announcement & Notification Dispatcher
          </h2>
          <p className="text-xs text-admin-muted mt-0.5">
            Broadcast platform updates, exam alerts, and deep links to student apps in real time.
          </p>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Main Dispatcher Card */}
      <div className="bg-white rounded-card border border-admin-cardBorder p-6 shadow-sm">
        <h3 className="text-sm font-bold text-admin-heading mb-4 flex items-center gap-2">
          <Send className="w-4 h-4 text-admin-primary" />
          Compose System Broadcast / Notification
        </h3>

        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-admin-heading mb-1">Notification Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. KEA Admit Cards Released — Download Now!"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-admin-heading mb-1">Notification Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {notificationTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-admin-heading mb-1">Broadcast Message Body</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message details that will appear on student notifications tray..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-admin-heading mb-1">Deep Link Navigation Route</label>
              <select
                value={actionRoute}
                onChange={(e) => setActionRoute(e.target.value as ActionRoute)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                {routes.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Target Mode */}
            <div>
              <label className="block text-xs font-semibold text-admin-heading mb-1.5">Target Audience</label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="targetMode"
                    checked={targetMode === 'ALL'}
                    onChange={() => setTargetMode('ALL')}
                    className="text-admin-primary"
                  />
                  <span>All Registered Students</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="targetMode"
                    checked={targetMode === 'SPECIFIC'}
                    onChange={() => setTargetMode('SPECIFIC')}
                    className="text-admin-primary"
                  />
                  <span>Target Specific Student</span>
                </label>
              </div>

              {targetMode === 'SPECIFIC' && (
                <input
                  type="text"
                  value={targetIdentifier}
                  onChange={(e) => setTargetIdentifier(e.target.value)}
                  placeholder="Enter Student UID or email address..."
                  className="mt-2 w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-admin-heading cursor-pointer">
              <input
                type="checkbox"
                checked={makeBanner}
                onChange={(e) => setMakeBanner(e.target.checked)}
                className="w-4 h-4 text-admin-primary rounded"
              />
              <span>Also pin as In-App Announcement Banner on student dashboard</span>
            </label>

            <button
              type="submit"
              disabled={isSending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-button bg-admin-primary hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Sending...' : 'Dispatch Broadcast'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner Announcements */}
        <div className="bg-white rounded-card border border-admin-cardBorder p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Pinned Banner Announcements ({announcements.length})</span>
            <span className="text-[10px] text-indigo-600 font-bold">Visible on Home Carousel</span>
          </h3>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active banner announcements.</p>
            ) : (
              announcements.map(a => (
                <div key={a.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-admin-heading">{a.title}</h4>
                      {a.isImportant && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                          Important
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{a.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1.5 block">{a.date}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Delete banner "${a.title}"?`)) {
                        deleteAnnouncement(a.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 rounded shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="bg-white rounded-card border border-admin-cardBorder p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Push Notifications History ({notifications.length})</span>
            <span className="text-[10px] text-slate-400">Real-time Stream</span>
          </h3>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {notifications.map(n => (
              <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-admin-heading">{n.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {n.type}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{n.message}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                    <span>{n.timestamp}</span>
                    {n.actionType && <span>Route: {n.actionType}</span>}
                    {n.targetUserEmail && <span className="text-indigo-600">To: {n.targetUserEmail}</span>}
                  </div>
                </div>

                <button
                  onClick={() => deleteNotification(n.id)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
