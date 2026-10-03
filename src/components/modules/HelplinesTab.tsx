import React, { useState } from 'react';
import { PhoneCall, Plus, Edit3, Trash2, Mail, Phone, MessageSquare, Instagram, ExternalLink, Sparkles } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { Helpline, HelplineType } from '../../types';

export const HelplinesTab: React.FC = () => {
  const { helplines, saveHelpline, deleteHelpline } = useAdminData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Helpline>({
    id: `hlp-${Date.now()}`,
    title: '',
    contactValue: '',
    type: 'PHONE',
    description: '',
    actionUrl: '',
    isHighlighted: false
  });

  const types: HelplineType[] = ['PHONE', 'EMAIL', 'WHATSAPP', 'INSTAGRAM'];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      id: `hlp-${Date.now()}`,
      title: '',
      contactValue: '',
      type: 'PHONE',
      description: '',
      actionUrl: '',
      isHighlighted: false
    });
    setIsFormOpen(true);
  };

  const handleEdit = (h: Helpline) => {
    setEditingId(h.id);
    setFormData({ ...h });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    await saveHelpline(formData);
    setIsFormOpen(false);
  };

  const getTypeIcon = (t: HelplineType) => {
    switch (t) {
      case 'PHONE': return <Phone className="w-4 h-4 text-blue-600" />;
      case 'EMAIL': return <Mail className="w-4 h-4 text-indigo-600" />;
      case 'WHATSAPP': return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'INSTAGRAM': return <Instagram className="w-4 h-4 text-pink-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-admin-cardBorder shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-admin-heading flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-admin-primary" />
            Student Emergency Helplines & Support Directory
          </h2>
          <p className="text-xs text-admin-muted mt-0.5">
            Configure direct contact channels (Phone, WhatsApp, Email, Instagram) for student queries.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-admin-royal hover:bg-blue-700 text-white font-bold text-xs shadow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Helpline Contact</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-card border-2 border-admin-primary/40 shadow-lg p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-admin-heading flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-50 text-admin-primary">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
              {editingId ? 'Edit Helpline' : 'Add Helpline Channel'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Contact Title / Dept</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. KEA Verification Query Cell"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Contact Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as HelplineType })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {types.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Display Value</label>
                <input
                  type="text"
                  value={formData.contactValue}
                  onChange={(e) => setFormData({ ...formData, contactValue: e.target.value })}
                  placeholder="080-23460460 or +91 98..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-admin-heading mb-1">Action URL (tel:, mailto:, https://wa.me/...)</label>
              <input
                type="text"
                value={formData.actionUrl}
                onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                placeholder="tel:08023460460 or https://wa.me/91..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-admin-heading mb-1">Description & Operating Hours</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Operational Monday-Saturday 10 AM to 5:30 PM..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="highHlp"
                checked={formData.isHighlighted}
                onChange={(e) => setFormData({ ...formData, isHighlighted: e.target.checked })}
                className="w-4 h-4 text-admin-primary rounded"
              />
              <label htmlFor="highHlp" className="text-xs font-bold text-admin-heading flex items-center gap-1 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Highlight on Top of Student Support Screen
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-admin-primary hover:bg-indigo-700 text-white shadow-md"
              >
                Save Helpline
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {helplines.map(h => (
          <div
            key={h.id}
            className={`bg-white rounded-card border p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between ${
              h.isHighlighted ? 'border-amber-300 ring-1 ring-amber-100' : 'border-admin-cardBorder'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-slate-100">
                    {getTypeIcon(h.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-admin-heading">{h.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {h.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(h)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-admin-primary hover:bg-slate-100"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete helpline "${h.title}"?`)) {
                        deleteHelpline(h.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-admin-destructive hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="my-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-mono font-bold text-sm text-indigo-700">
                {h.contactValue}
              </div>

              <p className="text-xs text-admin-muted leading-relaxed line-clamp-2">
                {h.description || 'No operating hours or description specified.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Action: {h.actionUrl}</span>
              <a
                href={h.actionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-admin-primary hover:underline"
              >
                <span>Launch Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
