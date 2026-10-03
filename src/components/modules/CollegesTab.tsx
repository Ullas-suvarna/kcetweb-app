import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Upload, 
  DollarSign, 
  Award, 
  Home, 
  Layers,
  Sparkles,
  CheckCircle2,
  Table
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { 
  College, 
  BranchCutoff, 
  KARNATAKA_DISTRICTS, 
  CUTOFF_CATEGORIES, 
  STANDARD_BRANCHES, 
  CollegeType, 
  NaacGrade 
} from '../../types';

export const CollegesTab: React.FC = () => {
  const { colleges, cutoffs, saveCollege, deleteCollege, saveCutoff } = useAdminData();

  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<College>({
    id: `col-${Date.now()}`,
    name: '',
    code: 'E',
    district: 'Bengaluru Urban',
    collegeType: 'Autonomous',
    imageResUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    naacGrade: 'A++',
    nirfRank: 100,
    tuitionFeePerYear: 104000,
    hostelFeePerYear: 120000,
    highestPackageLpa: 45.0,
    avgPackageLpa: 11.5,
    placementPercentage: 92,
    topRecruiters: ['Microsoft', 'Amazon', 'Bosch', 'Infosys'],
    studentRating: 4.8,
    hasHostel: true,
    websiteUrl: 'https://',
    mapLocationQuery: '',
    distanceKmFromBlr: 10
  });

  // Cutoffs Manager Modal
  const [managingCutoffsCollege, setManagingCutoffsCollege] = useState<College | null>(null);
  const [selectedBranchCode, setSelectedBranchCode] = useState('CSE');
  const [currentCutoffMap, setCurrentCutoffMap] = useState<Record<string, number>>({
    GM: 1500,
    '2A': 3500,
    '2B': 3800,
    '3A': 2200,
    '3B': 2500,
    SC: 11000,
    ST: 14000
  });

  const collegeTypes: CollegeType[] = [
    'Autonomous', 
    'Government', 
    'Private', 
    'Deemed University', 
    'Private University'
  ];

  const naacGrades: NaacGrade[] = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'NA'];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      id: `col-${Date.now()}`,
      name: '',
      code: 'E',
      district: 'Bengaluru Urban',
      collegeType: 'Autonomous',
      imageResUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
      naacGrade: 'A++',
      nirfRank: 100,
      tuitionFeePerYear: 104000,
      hostelFeePerYear: 120000,
      highestPackageLpa: 45.0,
      avgPackageLpa: 11.5,
      placementPercentage: 92,
      topRecruiters: ['Microsoft', 'Amazon', 'Bosch'],
      studentRating: 4.8,
      hasHostel: true,
      websiteUrl: 'https://',
      mapLocationQuery: '',
      distanceKmFromBlr: 10
    });
    setIsFormOpen(true);
  };

  const handleEdit = (col: College) => {
    setEditingId(col.id);
    setFormData({ ...col });
    setIsFormOpen(true);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageResUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('College name and CET code are required.');
      return;
    }
    await saveCollege(formData);
    setIsFormOpen(false);
  };

  // Open Cutoff Editor
  const handleOpenCutoffEditor = (col: College) => {
    setManagingCutoffsCollege(col);
    // Find existing cutoff for default CSE
    const existing = cutoffs.find(c => c.collegeId === col.id && c.branchCode === 'CSE');
    if (existing) {
      setCurrentCutoffMap({ ...existing.categoryCutoffs });
    } else {
      setCurrentCutoffMap({
        GM: 2500,
        '2A': 5500,
        '2B': 6000,
        '3A': 3500,
        '3B': 4000,
        SC: 15000,
        ST: 19000
      });
    }
    setSelectedBranchCode('CSE');
  };

  const handleBranchChange = (code: string) => {
    setSelectedBranchCode(code);
    if (!managingCutoffsCollege) return;
    const existing = cutoffs.find(c => c.collegeId === managingCutoffsCollege.id && c.branchCode === code);
    if (existing) {
      setCurrentCutoffMap({ ...existing.categoryCutoffs });
    } else {
      setCurrentCutoffMap({
        GM: 5000,
        '2A': 10000,
        '2B': 11000,
        '3A': 7000,
        '3B': 8000,
        SC: 25000,
        ST: 30000
      });
    }
  };

  const handleSaveCutoffRecord = async () => {
    if (!managingCutoffsCollege) return;
    const branchMeta = STANDARD_BRANCHES.find(b => b.code === selectedBranchCode);
    const cutoffId = `cut-${managingCutoffsCollege.id}-${selectedBranchCode.toLowerCase()}`;
    const newCutoff: BranchCutoff = {
      id: cutoffId,
      collegeId: managingCutoffsCollege.id,
      branchCode: selectedBranchCode,
      branchName: branchMeta?.name || selectedBranchCode,
      categoryCutoffs: currentCutoffMap
    };
    await saveCutoff(newCutoff);
    alert(`Closing cutoffs for ${selectedBranchCode} at ${managingCutoffsCollege.name} saved!`);
  };

  const filtered = colleges.filter(c => {
    if (selectedDistrict !== 'ALL' && c.district !== selectedDistrict) return false;
    if (selectedType !== 'ALL' && c.collegeType !== selectedType) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-admin-cardBorder shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-admin-heading flex items-center gap-2">
            <Building2 className="w-5 h-5 text-admin-primary" />
            Karnataka Engineering Colleges & Cutoffs Database
          </h2>
          <p className="text-xs text-admin-muted mt-0.5">
            Manage all 31 districts across Karnataka, NIRF rankings, fees, and category-wise closing ranks.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-admin-royal hover:bg-blue-700 text-white font-bold text-xs shadow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Engineering College</span>
        </button>
      </div>

      {/* District & Type Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-card border border-admin-cardBorder shadow-sm">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter by District (31 Karnataka Districts)</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            <option value="ALL">All 31 Karnataka Districts</option>
            {KARNATAKA_DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">College Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            <option value="ALL">All College Types</option>
            {collegeTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Search by Name or CET Code</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. RV College or E001..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Add / Edit Form Modal (15 Fields) */}
      {isFormOpen && (
        <div className="bg-white rounded-card border-2 border-admin-primary/40 shadow-xl p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-admin-heading flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-50 text-admin-primary">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
              {editingId ? 'Edit College Details' : 'Add New Karnataka Engineering College (15 Fields)'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Name, Code, District, Type */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-admin-heading mb-1">College Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. R.V. College of Engineering"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">KEA CET Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. E001"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">District Preference</label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  {KARNATAKA_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: College Type, NAAC, NIRF, Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">College Type</label>
                <select
                  value={formData.collegeType}
                  onChange={(e) => setFormData({ ...formData, collegeType: e.target.value as CollegeType })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  {collegeTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">NAAC Grade</label>
                <select
                  value={formData.naacGrade}
                  onChange={(e) => setFormData({ ...formData, naacGrade: e.target.value as NaacGrade })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  {naacGrades.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">NIRF National Rank</label>
                <input
                  type="number"
                  value={formData.nirfRank}
                  onChange={(e) => setFormData({ ...formData, nirfRank: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Student Rating (out of 5)</label>
                <input
                  type="number"
                  step="0.1"
                  max="5.0"
                  value={formData.studentRating}
                  onChange={(e) => setFormData({ ...formData, studentRating: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Row 3: Fees & Placement stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Tuition Fee / Year (₹)</label>
                <input
                  type="number"
                  value={formData.tuitionFeePerYear}
                  onChange={(e) => setFormData({ ...formData, tuitionFeePerYear: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Hostel Fee / Year (₹)</label>
                <input
                  type="number"
                  value={formData.hostelFeePerYear}
                  onChange={(e) => setFormData({ ...formData, hostelFeePerYear: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Avg Package (LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.avgPackageLpa}
                  onChange={(e) => setFormData({ ...formData, avgPackageLpa: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Highest Package (LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.highestPackageLpa}
                  onChange={(e) => setFormData({ ...formData, highestPackageLpa: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-700"
                />
              </div>
            </div>

            {/* Row 4: Hostel switch & Placement % & Distance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Placement Percentage (%)</label>
                <input
                  type="number"
                  value={formData.placementPercentage}
                  onChange={(e) => setFormData({ ...formData, placementPercentage: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Distance from Bengaluru (km)</label>
                <input
                  type="number"
                  value={formData.distanceKmFromBlr}
                  onChange={(e) => setFormData({ ...formData, distanceKmFromBlr: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="hostelCheck"
                  checked={formData.hasHostel}
                  onChange={(e) => setFormData({ ...formData, hasHostel: e.target.checked })}
                  className="w-4 h-4 text-admin-primary rounded"
                />
                <label htmlFor="hostelCheck" className="text-xs font-bold text-admin-heading cursor-pointer">
                  In-Campus Hostel Available
                </label>
              </div>
            </div>

            {/* Row 5: Banner Image URL & Gallery Upload */}
            <div>
              <label className="block text-xs font-semibold text-admin-heading mb-1">
                Banner Image URL or Upload from Local Gallery
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={formData.imageResUrl}
                  onChange={(e) => setFormData({ ...formData, imageResUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... or data:image/..."
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer shrink-0 border border-slate-300">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Row 6: Website & Map query */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Official Website URL</label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://college.edu.in"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-admin-heading mb-1">Google Maps Location Query</label>
                <input
                  type="text"
                  value={formData.mapLocationQuery}
                  onChange={(e) => setFormData({ ...formData, mapLocationQuery: e.target.value })}
                  placeholder="e.g. RV College of Engineering Mysuru Road Bengaluru"
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
                Save College Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* College List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(c => {
          const collegeCutoffs = cutoffs.filter(cut => cut.collegeId === c.id);
          return (
            <div
              key={c.id}
              className="bg-white rounded-card border border-admin-cardBorder shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <img
                    src={c.imageResUrl}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded bg-amber-400 text-amber-950 shadow">
                        CET: {c.code}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/30 backdrop-blur-sm">
                        {c.collegeType}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/80">
                        NAAC {c.naacGrade}
                      </span>
                    </div>
                    <h3 className="font-bold text-base leading-tight drop-shadow">
                      {c.name}
                    </h3>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      {c.district} ({c.distanceKmFromBlr} km from BLR)
                    </span>
                    <span className="font-bold text-indigo-700">NIRF #{c.nirfRank}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Avg Package</span>
                      <strong className="text-indigo-700">{c.avgPackageLpa} LPA</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Placement</span>
                      <strong className="text-emerald-700">{c.placementPercentage}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Govt CET Fee</span>
                      <strong className="text-slate-800">₹{c.tuitionFeePerYear.toLocaleString()}</strong>
                    </div>
                  </div>

                  {collegeCutoffs.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        Sample Closing Ranks (GM)
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {collegeCutoffs.map(cut => (
                          <span key={cut.id} className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium">
                            <strong>{cut.branchCode}:</strong> {cut.categoryCutoffs['GM'] || '-'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                <button
                  onClick={() => handleOpenCutoffEditor(c)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Manage Cutoffs</span>
                </button>

                <div className="flex items-center gap-1">
                  {c.websiteUrl && (
                    <a
                      href={c.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                      title="Visit Website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-admin-primary hover:bg-slate-100"
                    title="Edit College"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete college "${c.name}" and its branch cutoffs?`)) {
                        deleteCollege(c.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-admin-destructive hover:bg-red-50"
                    title="Delete College"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cutoffs Manager Modal */}
      {managingCutoffsCollege && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-admin-heading">Branch Closing Cutoff Manager</h3>
                <p className="text-xs text-slate-500">{managingCutoffsCollege.name} ({managingCutoffsCollege.code})</p>
              </div>
              <button
                onClick={() => setManagingCutoffsCollege(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-admin-heading mb-1.5">Select Branch</label>
              <select
                value={selectedBranchCode}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                {STANDARD_BRANCHES.map(b => (
                  <option key={b.code} value={b.code}>{b.code} — {b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 mb-6">
              <span className="text-xs font-bold text-slate-700 block">
                Category Closing Ranks (General Merit & Reservations)
              </span>
              <div className="grid grid-cols-2 gap-3">
                {CUTOFF_CATEGORIES.map(cat => (
                  <div key={cat} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-[11px] font-bold text-indigo-700 mb-1">{cat} Category Rank</label>
                    <input
                      type="number"
                      value={currentCutoffMap[cat] || ''}
                      onChange={(e) => setCurrentCutoffMap({ ...currentCutoffMap, [cat]: Number(e.target.value) })}
                      placeholder="e.g. 1500"
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setManagingCutoffsCollege(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveCutoffRecord}
                className="px-5 py-2 text-xs font-bold text-white bg-admin-primary hover:bg-indigo-700 rounded-xl shadow"
              >
                Save Branch Cutoffs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
