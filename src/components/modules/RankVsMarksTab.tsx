import React, { useState } from 'react';
import { TrendingUp, Plus, Edit3, Trash2, Award, ArrowUpRight } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { RankVsMarksTier } from '../../types';

export const RankVsMarksTab: React.FC = () => {
  const { rankTiers, saveRankTier, deleteRankTier, notifySuccess, requestConfirm } = useAdminData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<RankVsMarksTier>({
    id: `tier-${Date.now()}`,
    marksRange: '140  155 Marks',
    expectedRankRange: '500  1,200 Rank',
    year: '2025 / 2026 Prediction',
    minMarks: 140,
    maxMarks: 155,
    description: 'Strong chances for top circuit branches in RVCE, BMSCE, and MSRIT.'
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      id: `tier-${Date.now()}`,
      marksRange: '',
      expectedRankRange: '',
      year: '2026 Prediction',
      minMarks: 100,
      maxMarks: 120,
      description: ''
    });
    setIsFormOpen(true);
  };

  const handleEdit = (tier: RankVsMarksTier) => {
    setEditingId(tier.id);
    setFormData({ ...tier });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.marksRange.trim()) return;
    await saveRankTier(formData);
    notifySuccess(editingId ? `Rank Tier "${formData.marksRange}" updated!` : `Rank Tier "${formData.marksRange}" created!`, editingId ? 'Tier Updated' : 'Tier Added');
    setIsFormOpen(false);
  };

  // Sort tiers by max marks descending
  const sortedTiers = [...rankTiers].sort((a, b) => b.maxMarks - a.maxMarks);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-admin-cardBorder shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-admin-heading flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-admin-primary" />
            Rank vs Marks Predictor Bands
          </h2>
          <p className="text-sm text-admin-muted mt-0.5">
            Configure expected Karnataka state ranks according to total PCM / PCB aggregate scores.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-admin-royal hover:bg-blue-700 text-white font-bold text-sm shadow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Rank Tier</span>
        </button>
      </div>

      {/* Add / Edit Form Card */}
      {isFormOpen && (
        <div className="bg-white rounded-card border-2 border-admin-primary/40 shadow-lg p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-admin-heading flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-50 text-admin-primary">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
              {editingId ? 'Edit Rank Tier' : 'Add Rank vs Marks Tier'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Marks Range Label</label>
                <input
                  type="text"
                  value={formData.marksRange}
                  onChange={(e) => setFormData({ ...formData, marksRange: e.target.value })}
                  placeholder="e.g. 150  165 Marks"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Expected Rank Range</label>
                <input
                  type="text"
                  value={formData.expectedRankRange}
                  onChange={(e) => setFormData({ ...formData, expectedRankRange: e.target.value })}
                  placeholder="e.g. 120  650 Rank"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Year / Cohort</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2026 Prediction"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Minimum Marks Threshold</label>
                <input
                  type="number"
                  value={formData.minMarks}
                  onChange={(e) => setFormData({ ...formData, minMarks: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Maximum Marks Threshold</label>
                <input
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-admin-heading mb-1">Counseling Scope & College Recommendations</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Expected colleges: RVCE, BMSCE, Dayananda Sagar, UVCE..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              />
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
                Save Tier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rank Tiers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedTiers.map((tier, idx) => (
          <div
            key={tier.id}
            className="bg-white rounded-card border border-admin-cardBorder p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Tier #{idx + 1}  {tier.year}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(tier)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-admin-primary hover:bg-slate-100 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      const ok = await requestConfirm({
                        title: 'Delete Rank vs Marks Tier',
                        itemName: `${tier.marksRange} → ${tier.expectedRankRange}`,
                        message: `Are you sure you want to delete this prediction band?`,
                        isDestructive: true
                      });
                      if (ok) {
                        await deleteRankTier(tier.id);
                        notifySuccess(`Rank Tier "${tier.marksRange}" deleted.`, 'Tier Deleted');
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-admin-destructive hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-sm text-slate-500 font-medium">Marks Range</span>
                  <div className="text-base font-extrabold text-admin-heading">{tier.marksRange}</div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-slate-500 font-medium">Predicted Rank</span>
                  <div className="text-base font-extrabold text-emerald-600">{tier.expectedRankRange}</div>
                </div>
              </div>

              <p className="text-sm text-admin-muted leading-relaxed line-clamp-2 mb-2">
                {tier.description || 'No advice notes added.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>Threshold: {tier.minMarks} - {tier.maxMarks} marks</span>
              <span className="font-mono text-[10px]">ID: {tier.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

