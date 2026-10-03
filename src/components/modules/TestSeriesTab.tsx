import React, { useState } from 'react';
import { Layers, Plus, Clock, FileQuestion, Crown, Edit3, Trash2, Calendar, CheckCircle } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { TestSeriesSet, TestCategory } from '../../types';

export const TestSeriesTab: React.FC = () => {
  const { testSeries, saveTestSeries, deleteTestSeries } = useAdminData();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<TestSeriesSet>({
    id: `set-${Date.now()}`,
    title: '',
    category: 'Full Mock Tests',
    questionCount: 180,
    durationMins: 180,
    isPremium: false,
    description: '',
    createdDate: new Date().toISOString().split('T')[0]
  });

  const categories: TestCategory[] = [
    'Full Mock Tests',
    'Previous Year Papers',
    'Chapter-wise Tests',
    'Daily Practice'
  ];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      id: `set-${Date.now()}`,
      title: '',
      category: 'Full Mock Tests',
      questionCount: 180,
      durationMins: 180,
      isPremium: false,
      description: '',
      createdDate: new Date().toISOString().split('T')[0]
    });
    setIsFormOpen(true);
  };

  const handleEdit = (ts: TestSeriesSet) => {
    setEditingId(ts.id);
    setFormData({ ...ts });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    await saveTestSeries(formData);
    setIsFormOpen(false);
  };

  const filtered = testSeries.filter(ts => {
    if (selectedCategory === 'ALL') return true;
    return ts.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-admin-cardBorder shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-admin-heading flex items-center gap-2">
            <Layers className="w-5 h-5 text-admin-primary" />
            Mock Test Series Packages
          </h2>
          <p className="text-xs text-admin-muted mt-0.5">
            Configure CBT examinations, previous year papers, chapter tests, and daily practice sets.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-admin-royal hover:bg-blue-700 text-white font-bold text-xs shadow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Test Package</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-admin-tab text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-admin-cardBorder'
          }`}
        >
          All Categories ({testSeries.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
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
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-admin-heading flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-50 text-admin-primary">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
              {editingId ? 'Edit Test Package' : 'Create New Test Package'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Package Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. KCET 2026 Grand Simulation #2"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as TestCategory })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Question Count</label>
                <input
                  type="number"
                  value={formData.questionCount}
                  onChange={(e) => setFormData({ ...formData, questionCount: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={formData.durationMins}
                  onChange={(e) => setFormData({ ...formData, durationMins: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="premTest"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="w-4 h-4 rounded text-admin-primary focus:ring-admin-primary"
                />
                <label htmlFor="premTest" className="text-xs font-bold text-admin-heading flex items-center gap-1.5 cursor-pointer">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  Premium Only Access
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-admin-heading mb-1">Description & Instructions</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Include syllabus topics covered, marking scheme (+1, 0 negative marking), etc."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
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
                Save Test Set
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Test Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(ts => (
          <div
            key={ts.id}
            className="bg-white rounded-card border border-admin-cardBorder p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {ts.category}
                  </span>
                  {ts.isPremium ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      <Crown className="w-3 h-3 text-amber-600" />
                      PREMIUM
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      FREE ACCESS
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(ts)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-admin-primary hover:bg-slate-100 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete test set "${ts.title}"?`)) {
                        deleteTestSeries(ts.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-admin-destructive hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-sm text-admin-heading mb-1.5">
                {ts.title}
              </h3>
              <p className="text-xs text-admin-muted leading-relaxed line-clamp-2 mb-4">
                {ts.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <FileQuestion className="w-3.5 h-3.5 text-indigo-500" />
                  {ts.questionCount} Questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {ts.durationMins} Mins
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Created: {ts.createdDate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
