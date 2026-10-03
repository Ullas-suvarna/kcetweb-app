import React, { useState } from 'react';
import { FileText, Plus, ExternalLink, Trash2, Edit3, Download, Bell, FileSpreadsheet } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { Resource, ResourceCategory } from '../../types';

export const ResourcesTab: React.FC = () => {
  const { resources, saveResource, deleteResource } = useAdminData();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notifyStudents, setNotifyStudents] = useState(true);

  const [formData, setFormData] = useState<Resource>({
    id: `res-${Date.now()}`,
    title: '',
    category: 'Formula',
    fileFormat: 'PDF',
    fileSize: '3.5 MB',
    yearOrSubject: 'Physics (PUC II)',
    downloadUrl: '',
    description: ''
  });

  const categories: ResourceCategory[] = ['Syllabus', 'PYQ', 'Formula', 'Tips', 'Notes'];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      id: `res-${Date.now()}`,
      title: '',
      category: 'Formula',
      fileFormat: 'PDF',
      fileSize: '3.5 MB',
      yearOrSubject: 'Physics (PUC II)',
      downloadUrl: '',
      description: ''
    });
    setNotifyStudents(true);
    setIsFormOpen(true);
  };

  const handleEdit = (r: Resource) => {
    setEditingId(r.id);
    setFormData({ ...r });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    await saveResource(formData, notifyStudents);
    setIsFormOpen(false);
  };

  const filtered = resources.filter(r => {
    if (selectedCategory === 'ALL') return true;
    return r.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-admin-cardBorder shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-admin-heading flex items-center gap-2">
            <FileText className="w-5 h-5 text-admin-primary" />
            Study Materials, Syllabus & PDF Handbooks
          </h2>
          <p className="text-xs text-admin-muted mt-0.5">
            Upload and broadcast formula sheets, chapter revision notes, and official KEA question papers.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-admin-royal hover:bg-blue-700 text-white font-bold text-xs shadow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Resource</span>
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
          All Resources ({resources.length})
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

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="bg-white rounded-card border-2 border-admin-primary/40 shadow-lg p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-admin-heading flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-50 text-admin-primary">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
              {editingId ? 'Edit Resource' : 'Add New PDF / Study Resource'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Resource Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. KCET Chemistry Reaction Mechanisms Chart"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ResourceCategory })}
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
                <label className="block text-xs font-semibold text-admin-heading mb-1">File Format</label>
                <input
                  type="text"
                  value={formData.fileFormat}
                  onChange={(e) => setFormData({ ...formData, fileFormat: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">File Size</label>
                <input
                  type="text"
                  value={formData.fileSize}
                  onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                  placeholder="e.g. 4.2 MB"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Year / Subject Tag</label>
                <input
                  type="text"
                  value={formData.yearOrSubject}
                  onChange={(e) => setFormData({ ...formData, yearOrSubject: e.target.value })}
                  placeholder="e.g. 2026 / Mathematics"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-admin-heading mb-1">Download / Cloud Storage URL</label>
              <input
                type="url"
                value={formData.downloadUrl}
                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                placeholder="https://drive.google.com/... or https://cetonline..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-admin-heading mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Key takeaways, chapters summarized, formula index..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="notifyCheck"
                checked={notifyStudents}
                onChange={(e) => setNotifyStudents(e.target.checked)}
                className="w-4 h-4 text-admin-primary rounded"
              />
              <label htmlFor="notifyCheck" className="text-xs font-bold text-admin-heading flex items-center gap-1 cursor-pointer">
                <Bell className="w-3.5 h-3.5 text-indigo-600" />
                Notify all students via in-app push notification upon upload
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
                Save Resource
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(r => (
          <div
            key={r.id}
            className="bg-white rounded-card border border-admin-cardBorder p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {r.category}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(r)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-admin-primary hover:bg-slate-100 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete resource "${r.title}"?`)) {
                        deleteResource(r.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-admin-destructive hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-sm text-admin-heading mb-1.5">
                {r.title}
              </h4>
              <p className="text-xs text-admin-muted leading-relaxed line-clamp-2 mb-3">
                {r.description || 'No description available.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-mono font-bold text-slate-700">
                  {r.fileFormat} • {r.fileSize}
                </span>
                <span className="text-slate-400 text-[11px]">{r.yearOrSubject}</span>
              </div>

              <a
                href={r.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-admin-primary hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>Download</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
