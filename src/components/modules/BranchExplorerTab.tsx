import React, { useState } from 'react';
import { Compass, Plus, Edit3, Trash2, Briefcase, GraduationCap, Sparkles, TrendingUp, Cpu } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { EngineeringBranch, BranchCategory } from '../../types';

export const BranchExplorerTab: React.FC = () => {
  const { branches, saveBranch, deleteBranch } = useAdminData();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<EngineeringBranch>({
    id: `br-${Date.now()}`,
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    iconEmoji: '💻',
    category: 'Tech & AI',
    overview: 'Flagship engineering branch in Karnataka covering algorithms, cloud architecture, and systems engineering.',
    futureDemandLevel: 'Very High (95%+ Placements)',
    futureScope: 'Rapid expansion driven by generative AI, fintech, and enterprise tech innovation.',
    careerOpportunities: ['Full Stack Engineer', 'Cloud Architect', 'DevOps Specialist'],
    higherStudiesOptions: ['M.Tech in CS (IISc/IIT)', 'MS in Computer Science'],
    requiredSkills: ['Data Structures', 'Algorithms', 'Java / Python', 'SQL'],
    avgStartingSalaryLpa: 11.5,
    topOfferingCollegesCount: 190,
    districtOrPlace: 'Bengaluru, Mysuru, Mangaluru'
  });

  const categories: BranchCategory[] = ['Tech & AI', 'Core', 'Allied & Emerging'];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      id: `br-${Date.now()}`,
      branchCode: '',
      branchName: '',
      iconEmoji: '⚙️',
      category: 'Tech & AI',
      overview: '',
      futureDemandLevel: 'High',
      futureScope: '',
      careerOpportunities: [],
      higherStudiesOptions: [],
      requiredSkills: [],
      avgStartingSalaryLpa: 8.0,
      topOfferingCollegesCount: 100,
      districtOrPlace: 'Bengaluru'
    });
    setIsFormOpen(true);
  };

  const handleEdit = (b: EngineeringBranch) => {
    setEditingId(b.id);
    setFormData({ ...b });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branchCode.trim() || !formData.branchName.trim()) return;
    await saveBranch(formData);
    setIsFormOpen(false);
  };

  const filtered = branches.filter(b => {
    if (selectedCategory === 'ALL') return true;
    return b.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-admin-cardBorder shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-admin-heading flex items-center gap-2">
            <Compass className="w-5 h-5 text-admin-primary" />
            Engineering Branch Explorer & Career Guide
          </h2>
          <p className="text-xs text-admin-muted mt-0.5">
            Maintain Karnataka engineering disciplines, placement scopes, required skill sets, and industry salaries.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-admin-royal hover:bg-blue-700 text-white font-bold text-xs shadow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Engineering Branch</span>
        </button>
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-admin-tab text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-admin-cardBorder'
          }`}
        >
          All Disciplines ({branches.length})
        </button>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === c
                ? 'bg-admin-tab text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-admin-cardBorder'
            }`}
          >
            {c}
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
              {editingId ? 'Edit Branch Roadmap' : 'Add Engineering Branch Guide'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Branch Code</label>
                <input
                  type="text"
                  value={formData.branchCode}
                  onChange={(e) => setFormData({ ...formData, branchCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. CSE or AIML"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-admin-heading mb-1">Branch Full Name</label>
                <input
                  type="text"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  placeholder="e.g. Artificial Intelligence & Machine Learning"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Emoji Icon</label>
                <input
                  type="text"
                  value={formData.iconEmoji}
                  onChange={(e) => setFormData({ ...formData, iconEmoji: e.target.value })}
                  placeholder="e.g. 💻 or 🤖"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center text-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as BranchCategory })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Future Demand Level</label>
                <input
                  type="text"
                  value={formData.futureDemandLevel}
                  onChange={(e) => setFormData({ ...formData, futureDemandLevel: e.target.value })}
                  placeholder="e.g. Skyrocketing / High"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Avg Starting Salary (LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.avgStartingSalaryLpa}
                  onChange={(e) => setFormData({ ...formData, avgStartingSalaryLpa: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-admin-heading mb-1">Overview & Curriculum Highlights</label>
              <textarea
                rows={2}
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                placeholder="What does a student study in this branch over 4 years?"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-admin-heading mb-1">Future Scope & Industry Demand</label>
              <textarea
                rows={2}
                value={formData.futureScope}
                onChange={(e) => setFormData({ ...formData, futureScope: e.target.value })}
                placeholder="Market trends, automation impacts, semiconductor investments..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Career Opportunities (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.careerOpportunities.join(', ')}
                  onChange={(e) => setFormData({ ...formData, careerOpportunities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="Full Stack, Cloud Architect, AI Scientist..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Higher Studies (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.higherStudiesOptions.join(', ')}
                  onChange={(e) => setFormData({ ...formData, higherStudiesOptions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="M.Tech in CSE, MS in USA, MBA..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Required Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.requiredSkills.join(', ')}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="DSA, Python, Circuits, Math..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
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
                Save Branch Information
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(b => (
          <div
            key={b.id}
            className="bg-white rounded-card border border-admin-cardBorder p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{b.iconEmoji || '⚙️'}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-admin-heading">{b.branchName}</h4>
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {b.branchCode}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {b.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(b)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-admin-primary hover:bg-slate-100"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete branch guide for "${b.branchName}"?`)) {
                        deleteBranch(b.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-admin-destructive hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">
                {b.overview}
              </p>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Demand Level:</span>
                  <strong className="text-indigo-700">{b.futureDemandLevel}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Avg Starting Package:</span>
                  <strong className="text-emerald-700">{b.avgStartingSalaryLpa} LPA</strong>
                </div>
              </div>

              {b.requiredSkills.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mb-2">
                  {b.requiredSkills.map(s => (
                    <span key={s} className="text-[10px] px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>{b.topOfferingCollegesCount} Karnataka Colleges</span>
              <span>Hub: {b.districtOrPlace}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
