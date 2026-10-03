import React, { useState } from 'react';
import { CalendarDays, Plus, Edit3, Trash2, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { ImportantDate, DateCategory, DateStatus } from '../../types';

export const ImportantDatesTab: React.FC = () => {
  const { dates, saveDate, deleteDate, notifySuccess, requestConfirm } = useAdminData();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<ImportantDate>({
    id: `date-${Date.now()}`,
    eventTitle: '',
    dateOrDeadline: '',
    status: 'Upcoming',
    description: '',
    category: 'Exam',
    isHighlighted: true
  });

  const categories: DateCategory[] = ['Exam', 'Counselling', 'Application', 'Results', 'Admit Card'];
  const statuses: DateStatus[] = ['Upcoming', 'Active Now', 'Completed', 'Crucial'];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      id: `date-${Date.now()}`,
      eventTitle: '',
      dateOrDeadline: '',
      status: 'Upcoming',
      description: '',
      category: 'Exam',
      isHighlighted: true
    });
    setIsFormOpen(true);
  };

  const handleEdit = (d: ImportantDate) => {
    setEditingId(d.id);
    setFormData({ ...d });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eventTitle.trim()) return;
    await saveDate(formData);
    notifySuccess(editingId ? `Event "${formData.eventTitle}" updated successfully!` : `Event "${formData.eventTitle}" added to Important Dates!`, editingId ? 'Date Updated' : 'Date Added');
    setIsFormOpen(false);
  };

  const filtered = dates.filter(d => {
    if (selectedCategory === 'ALL') return true;
    return d.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-admin-cardBorder shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-admin-heading flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-admin-primary" />
            Official KCET Timeline & Important Dates
          </h2>
          <p className="text-sm text-admin-muted mt-0.5">
            Maintain the official KEA examination timetable, application deadlines, and counselling stages.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-admin-royal hover:bg-blue-700 text-white font-bold text-sm shadow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Important Date</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-admin-tab text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-admin-cardBorder'
          }`}
        >
          All Deadlines ({dates.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-admin-tab text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-admin-cardBorder'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add / Edit Form Card */}
      {isFormOpen && (
        <div className="bg-white rounded-card border-2 border-admin-primary/40 shadow-lg p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-admin-heading flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-50 text-admin-primary">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
              {editingId ? 'Edit Event Date' : 'Add Official KCET Event / Date'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Event / Deadline Title</label>
                <input
                  type="text"
                  value={formData.eventTitle}
                  onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                  placeholder="e.g. KCET 2026 Physics & Chemistry Examination"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Date & Time String</label>
                <input
                  type="text"
                  value={formData.dateOrDeadline}
                  onChange={(e) => setFormData({ ...formData, dateOrDeadline: e.target.value })}
                  placeholder="e.g. April 19, 2026 - 10:30 AM"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as DateCategory })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as DateStatus })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  {statuses.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-admin-heading mb-1">Description / Guidelines</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Important documents to bring, reporting time, login instructions..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="highDate"
                checked={formData.isHighlighted}
                onChange={(e) => setFormData({ ...formData, isHighlighted: e.target.checked })}
                className="w-4 h-4 text-admin-primary rounded"
              />
              <label htmlFor="highDate" className="text-sm font-bold text-admin-heading flex items-center gap-1 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Highlight on Student Home Screen Banner
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-bold bg-admin-primary hover:bg-indigo-700 text-white shadow-md"
              >
                Save Event Date
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Date List Items */}
      <div className="space-y-3">
        {filtered.map(d => (
          <div
            key={d.id}
            className={`bg-white rounded-card border p-5 shadow-sm hover:shadow transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              d.status === 'Crucial' ? 'border-red-300 ring-1 ring-red-100' : 'border-admin-cardBorder'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {d.category}
                </span>

                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  d.status === 'Crucial' ? 'bg-red-100 text-red-800 font-extrabold animate-pulse' :
                  d.status === 'Active Now' ? 'bg-emerald-100 text-emerald-800' :
                  d.status === 'Completed' ? 'bg-slate-100 text-slate-500' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {d.status}
                </span>

                {d.isHighlighted && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    Home Highlight
                  </span>
                )}
              </div>

              <h4 className="font-bold text-sm text-admin-heading mb-1">
                {d.eventTitle}
              </h4>
              <p className="text-sm text-admin-muted leading-relaxed mb-2">
                {d.description || 'No description added.'}
              </p>

              <div className="flex items-center gap-1.5 text-sm font-bold text-indigo-700">
                <Clock className="w-3.5 h-3.5" />
                <span>{d.dateOrDeadline}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => handleEdit(d)}
                className="p-2 rounded-lg text-slate-500 hover:text-admin-primary hover:bg-slate-100 transition-colors"
                title="Edit date"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={async () => {
                  const ok = await requestConfirm({
                    title: 'Delete Important Date',
                    itemName: d.eventTitle,
                    message: `Are you sure you want to remove "${d.eventTitle}" (${d.dateOrDeadline}) from the official timeline?`,
                    isDestructive: true
                  });
                  if (ok) {
                    await deleteDate(d.id);
                    notifySuccess(`Important Date "${d.eventTitle}" deleted.`, 'Date Deleted');
                  }
                }}
                className="p-2 rounded-lg text-slate-500 hover:text-admin-destructive hover:bg-red-50 transition-colors"
                title="Delete date"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

