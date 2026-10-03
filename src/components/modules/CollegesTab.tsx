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
  CheckCircle2, 
  Bell, 
  ChevronDown, 
  BarChart2, 
  X,
  FileText,
  Image as ImageIcon,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { 
  College, 
  BranchCutoff, 
  KARNATAKA_DISTRICTS, 
  CUTOFF_CATEGORIES, 
  RANK_RANGES, 
  CATEGORY_MULTIPLIERS, 
  DEMANDED_BRANCHES, 
  CollegeType, 
  NaacGrade 
} from '../../types';
export const CollegesTab: React.FC = () => {
  const { 
    colleges, 
    cutoffs, 
    saveCollege, 
    deleteCollege, 
    saveCutoff, 
    deleteCutoff, 
    sendBroadcast,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    requestConfirm
  } = useAdminData();
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  // Cutoff Matching Matrix Top Box
  const [rankRange, setRankRange] = useState<string>('1 – 1,000');
  const [category, setCategory] = useState<string>('GM');
  const [closingRank, setClosingRank] = useState<number>(1200);
  // College Form Fields
  const [collegeName, setCollegeName] = useState<string>('RV College of Engineering');
  const [cetCode, setCetCode] = useState<string>('E001');
  const [district, setDistrict] = useState<string>('Bengaluru Urban');
  const [collegeType, setCollegeType] = useState<CollegeType>('Autonomous');
  const [tuitionFee, setTuitionFee] = useState<number>(118000);
  const [hasHostel, setHasHostel] = useState<boolean>(true);
  const [hostelFee, setHostelFee] = useState<number>(85000);
  const [naacGrade, setNaacGrade] = useState<NaacGrade>('A++');
  const [nirfRank, setNirfRank] = useState<number>(45);
  const [avgPackage, setAvgPackage] = useState<number>(14.5);
  const [highestPackage, setHighestPackage] = useState<number>(58.0);
  const [bannerUrl, setBannerUrl] = useState<string>('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80');
  const [websiteUrl, setWebsiteUrl] = useState<string>('https://rvce.edu.in');
  const [mapLocation, setMapLocation] = useState<string>('RV College of Engineering Bengaluru');
  const [notifyStudents, setNotifyStudents] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  // Filter & Search for list
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('ALL');
  // Cutoff Matrix Modal for a specific college (Exact Screenshot Layout & Real-Time Sync)
  const [cutoffModalCollege, setCutoffModalCollege] = useState<College | null>(null);
  const [modalBranchCode, setModalBranchCode] = useState('CSE');
  const [modalBranchName, setModalBranchName] = useState('Computer Science & Engineering');
  const [modalCategoryRanks, setModalCategoryRanks] = useState<Record<string, number | string>>({
    GM: 120,
    '2A': 210,
    '2B': 2300,
    '3A': 1400,
    '3B': 1500,
    SC: 12000,
    ST: 18000
  });

  // When branch code changes in the input, auto-fill if an existing cutoff for this college and branch exists
  const handleBranchCodeInputChange = (code: string) => {
    const cleanCode = code.toUpperCase();
    setModalBranchCode(cleanCode);
    
    // Auto populate branch name if known
    const demanded = DEMANDED_BRANCHES.find(b => b.code === cleanCode);
    if (demanded) {
      setModalBranchName(demanded.name);
    }

    if (cutoffModalCollege) {
      const existing = cutoffs.find(c => 
        c.collegeId === cutoffModalCollege.id && 
        c.branchCode.toUpperCase() === cleanCode
      );
      if (existing && existing.categoryCutoffs) {
        setModalBranchName(existing.branchName || demanded?.name || cleanCode);
        setModalCategoryRanks({
          GM: existing.categoryCutoffs.GM ?? '',
          '2A': existing.categoryCutoffs['2A'] ?? '',
          '2B': existing.categoryCutoffs['2B'] ?? '',
          '3A': existing.categoryCutoffs['3A'] ?? '',
          '3B': existing.categoryCutoffs['3B'] ?? '',
          SC: existing.categoryCutoffs.SC ?? '',
          ST: existing.categoryCutoffs.ST ?? ''
        });
      }
    }
  };

  const handleOpenCutoffModal = (col: College) => {
    setCutoffModalCollege(col);
    const existingList = cutoffs.filter(c => c && c.collegeId === col.id);
    if (existingList.length > 0) {
      const first = existingList[0];
      setModalBranchCode(first.branchCode);
      setModalBranchName(first.branchName || 'Computer Science & Engineering');
      setModalCategoryRanks({
        GM: first.categoryCutoffs?.GM ?? 120,
        '2A': first.categoryCutoffs?.['2A'] ?? 210,
        '2B': first.categoryCutoffs?.['2B'] ?? 2300,
        '3A': first.categoryCutoffs?.['3A'] ?? 1400,
        '3B': first.categoryCutoffs?.['3B'] ?? 1500,
        SC: first.categoryCutoffs?.SC ?? 12000,
        ST: first.categoryCutoffs?.ST ?? 18000
      });
    } else {
      setModalBranchCode('CSE');
      setModalBranchName('Computer Science & Engineering');
      setModalCategoryRanks({
        GM: 120,
        '2A': 210,
        '2B': 2300,
        '3A': 1400,
        '3B': 1500,
        SC: 12000,
        ST: 18000
      });
    }
  };

  const handleSelectExistingCutoffToEdit = (cut: BranchCutoff) => {
    setModalBranchCode(cut.branchCode);
    setModalBranchName(cut.branchName || cut.branchCode);
    setModalCategoryRanks({
      GM: cut.categoryCutoffs?.GM ?? '',
      '2A': cut.categoryCutoffs?.['2A'] ?? '',
      '2B': cut.categoryCutoffs?.['2B'] ?? '',
      '3A': cut.categoryCutoffs?.['3A'] ?? '',
      '3B': cut.categoryCutoffs?.['3B'] ?? '',
      SC: cut.categoryCutoffs?.SC ?? '',
      ST: cut.categoryCutoffs?.ST ?? ''
    });
  };

  const handleSaveModalCutoff = async () => {
    if (!cutoffModalCollege) return;
    if (!modalBranchCode.trim()) {
      notifyWarning('Please enter a valid branch code (e.g. CSE).');
      return;
    }

    const branchCodeClean = modalBranchCode.trim().toUpperCase();
    const docId = `${cutoffModalCollege.id}_${branchCodeClean}`;
    const newCutoff: BranchCutoff = {
      id: docId,
      collegeId: cutoffModalCollege.id,
      branchCode: branchCodeClean,
      branchName: modalBranchName.trim() || branchCodeClean,
      categoryCutoffs: {
        GM: Number(modalCategoryRanks.GM) || 1200,
        '2A': Number(modalCategoryRanks['2A']) || 2100,
        '2B': Number(modalCategoryRanks['2B']) || 2300,
        '3A': Number(modalCategoryRanks['3A']) || 1400,
        '3B': Number(modalCategoryRanks['3B']) || 1500,
        SC: Number(modalCategoryRanks.SC) || 12000,
        ST: Number(modalCategoryRanks.ST) || 18000
      }
    };

    try {
      await saveCutoff(newCutoff);
      alert(`💾 Cutoff saved for ${branchCodeClean} in ${cutoffModalCollege.name}!
Path: /branch_cutoffs/${docId}`);
    } catch (err: any) {
      notifyError(`Error saving cutoff: ${err.message || err}`);
    }
  };

  // Rank Range selection updates closing rank baseline
  const handleRankRangeChange = (range: string) => {
    setRankRange(range);
    const map: Record<string, number> = {
      '1 – 1,000': 680,
      '1,000 – 2,500': 1500,
      '2,500 – 5,000': 3500,
      '5,000 – 10,000': 7500,
      '10,000 – 15,000': 12500,
      '15,000 – 25,000': 19000,
      '25,000 – 50,000': 35000,
      '50,000 – 75,000': 60000,
      '75,000 – 100,000+': 85000
    };
    if (map[range]) {
      setClosingRank(map[range]);
    }
  };
  // Base64 Image Upload
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  // Reset Form for New Entry
  const handleResetForm = () => {
    setEditingId(null);
    setCollegeName('');
    setCetCode('E');
    setDistrict('Bengaluru Urban');
    setCollegeType('Autonomous');
    setTuitionFee(118000);
    setHasHostel(true);
    setHostelFee(85000);
    setNaacGrade('A++');
    setNirfRank(50);
    setAvgPackage(12.5);
    setHighestPackage(45.0);
    setBannerUrl('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80');
    setWebsiteUrl('https://');
    setMapLocation('');
    setClosingRank(1200);
  };
  // Populate Form for Editing
  const handleEditDetails = (col: College) => {
    setEditingId(col.id);
    setCollegeName(col.name);
    setCetCode(col.code);
    setDistrict(col.district);
    setCollegeType(col.collegeType);
    setTuitionFee(col.tuitionFeePerYear || 118000);
    setHasHostel(col.hasHostel);
    setHostelFee(col.hostelFeePerYear || 85000);
    setNaacGrade(col.naacGrade);
    setNirfRank(col.nirfRank);
    setAvgPackage(col.avgPackageLpa);
    setHighestPackage(col.highestPackageLpa);
    setBannerUrl(col.imageResUrl || '');
    setWebsiteUrl(col.websiteUrl || '');
    setMapLocation(col.mapLocationQuery || `${col.name} ${col.district}`);
    // Fetch existing CSE cutoff if available
    const cut = cutoffs.find(c => c.collegeId === col.id && c.branchCode === 'CSE');
    if (cut && cut.categoryCutoffs?.GM) {
      setClosingRank(cut.categoryCutoffs.GM);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // Save to Firebase Pipeline
  const handleSaveCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeName.trim() || !cetCode.trim()) {
      setStatusMessage({ text: 'College name and CET code are required.', type: 'error' });
      return;
    }
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const colId = editingId || `col_${cetCode.toLowerCase().trim()}_${Date.now()}`;
      const formattedWebsite = websiteUrl.trim().startsWith('http') 
        ? websiteUrl.trim() 
        : (websiteUrl.trim() ? `https://${websiteUrl.trim()}` : '');
      const collegePayload: College = {
        id: colId,
        name: collegeName.trim(),
        code: cetCode.trim().toUpperCase(),
        district,
        collegeType,
        imageResUrl: bannerUrl,
        logoResUrl: '',
        naacGrade,
        nirfRank: Number(nirfRank) || 0,
        tuitionFeePerYear: Number(tuitionFee) || 118000,
        hostelFeePerYear: hasHostel ? (Number(hostelFee) || 85000) : 0,
        hasHostel,
        highestPackageLpa: Number(highestPackage) || 45.0,
        avgPackageLpa: Number(avgPackage) || 12.0,
        placementPercentage: 92,
        topRecruiters: ['Microsoft', 'Amazon', 'Bosch', 'Infosys'],
        studentRating: 4.8,
        websiteUrl: formattedWebsite,
        mapLocationQuery: mapLocation.trim() || `${collegeName} ${district}`,
        distanceKmFromBlr: 12,
        brochureUrl: ''
      };
      // 1. Write / Update /colleges/{colId} in Firestore
      await saveCollege(collegePayload);
      // 2. Compute default category cutoffs for CSE
      const baseGM = Number(closingRank) || 1200;
      const categoryMap: Record<string, number> = { GM: baseGM };
      CUTOFF_CATEGORIES.forEach(cat => {
        if (cat !== 'GM') {
          const mult = CATEGORY_MULTIPLIERS[cat] || 1.0;
          categoryMap[cat] = Math.round(baseGM * mult);
        }
      });
      const cutoffPayload: BranchCutoff = {
        id: `cut-${colId}-cse`,
        collegeId: colId,
        branchCode: 'CSE',
        branchName: 'Computer Science & Engineering',
        categoryCutoffs: categoryMap
      };
      await saveCutoff(cutoffPayload);
      // 3. Trigger Broadcast Notification if checked
      if (notifyStudents) {
        await sendBroadcast({
          title: '🏛️ New College & Cutoffs Updated',
          message: `${collegeName} (${cetCode}) cutoffs & August 2026 fee updated. Check your admission probability now!`,
          type: 'COUNSELLING',
          actionType: 'NAV_COUNSELLING'
        });
      }
      setStatusMessage({ 
        text: `College ${collegeName} (${cetCode}) saved successfully to Live Firestore!`, 
        type: 'success' 
      });
      handleResetForm();
    } catch (err: any) {
      setStatusMessage({ 
        text: 'Error saving college: ' + (err?.message || err), 
        type: 'error' 
      });
    } finally {
      setIsSaving(false);
    }
  };
// Filtered Colleges List
  const filteredColleges = colleges.filter(c => {
    if (filterDistrict !== 'ALL' && c.district !== filterDistrict) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchCode = c.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    return true;
  });
  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">
      {/* Outer Card matching exact Android/Material design */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-5">
        {/* Title Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {editingId ? 'Edit College & Cutoffs' : 'Add New College & Cutoffs'}
            </h2>
          </div>
          <p className="text-sm font-bold text-[#0D9488]">
            Directly connected to Student College Recommendation & Predictor
          </p>
        </div>
        {/* Status Alert */}
        {statusMessage && (
          <div className={`p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
              : 'bg-rose-50 text-rose-800 border border-rose-300'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : '⚠️'}
            <span>{statusMessage.text}</span>
          </div>
        )}
        <form onSubmit={handleSaveCollege} className="space-y-4">
          {/* 1. Cutoff Rank Range & Category Matching (Light Teal Container) */}
          <div className="bg-[#F0FDFA] rounded-2xl border border-[#99F6E4] p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#0F766E]">
              <span>🎯</span>
              <span>Cutoff Rank Range & Category Matching</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Rank Range Dropdown */}
              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-[#F0FDFA] px-1.5 text-[11px] font-semibold text-slate-600 z-10">
                  Rank Range
                </label>
                <div className="relative">
                  <select
                    value={rankRange}
                    onChange={(e) => handleRankRangeChange(e.target.value)}
                    className="w-full h-14 pl-4 pr-10 bg-white border border-slate-400 rounded-xl text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  >
                    {RANK_RANGES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              {/* Category Dropdown */}
              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-[#F0FDFA] px-1.5 text-[11px] font-semibold text-slate-600 z-10">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-14 pl-4 pr-10 bg-white border border-slate-400 rounded-xl text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  >
                    {CUTOFF_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            {/* Cutoff Closing Rank (#) */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-[#F0FDFA] px-1.5 text-[11px] font-semibold text-slate-600 z-10">
                Cutoff Closing Rank (#)
              </label>
              <input
                type="number"
                value={closingRank}
                onChange={(e) => setClosingRank(parseInt(e.target.value) || 1)}
                className="w-full h-14 px-4 bg-white border border-slate-400 rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                required
              />
            </div>
          </div>
          {/* 2. College Name */}
          <div className="relative">
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="College Name"
              className="w-full h-14 px-4 bg-white border border-slate-400 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              required
            />
          </div>
          {/* 3. CET Code & District Preference */}
          <div className="grid grid-cols-2 gap-3">
            {/* CET Code */}
            <div className="relative">
              <input
                type="text"
                value={cetCode}
                onChange={(e) => setCetCode(e.target.value.toUpperCase())}
                placeholder="CET Code (e.g. E001)"
                className="w-full h-14 px-4 bg-white border border-slate-400 rounded-xl text-sm font-bold font-mono text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                required
              />
            </div>
            {/* District Preference */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">
                District Preference
              </label>
              <div className="relative">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-14 pl-4 pr-10 bg-white border border-slate-400 rounded-xl text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                >
                  {KARNATAKA_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
          {/* 4. College Type & Tuition Fee */}
          <div className="grid grid-cols-2 gap-3">
            {/* College Type */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">
                College Type
              </label>
              <div className="relative">
                <select
                  value={collegeType}
                  onChange={(e) => setCollegeType(e.target.value as CollegeType)}
                  className="w-full h-14 pl-4 pr-10 bg-white border border-slate-400 rounded-xl text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                >
                  <option value="Autonomous">Autonomous</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Deemed University">Deemed University</option>
                  <option value="Private University">Private University</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            {/* Tuition Fee */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">
                Tuition Fee (₹/yr)
              </label>
              <input
                type="number"
                value={tuitionFee}
                onChange={(e) => setTuitionFee(parseInt(e.target.value) || 0)}
                className="w-full h-14 px-4 bg-white border border-slate-400 rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
            </div>
          </div>
          {/* 5. In-Campus Hostel Container */}
          <div className="bg-white rounded-2xl border border-slate-300 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">In-Campus Hostel</h4>
                <p className="text-[11px] text-slate-500">Available on campus</p>
              </div>
              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setHasHostel(!hasHostel)}
                className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center ${
                  hasHostel ? 'bg-[#4F46E5] justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
              </button>
            </div>
            {hasHostel && (
              <div className="relative pt-1">
                <label className="absolute -top-1 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">
                  Hostel Fee (₹/yr)
                </label>
                <input
                  type="number"
                  value={hostelFee}
                  onChange={(e) => setHostelFee(parseInt(e.target.value) || 0)}
                  className="w-full h-14 px-4 bg-white border border-slate-400 rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>
            )}
          </div>
          {/* 6. NAAC Grade & NIRF Rank */}
          <div className="grid grid-cols-2 gap-3">
            {/* NAAC Grade */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">
                NAAC Grade
              </label>
              <div className="relative">
                <select
                  value={naacGrade}
                  onChange={(e) => setNaacGrade(e.target.value as NaacGrade)}
                  className="w-full h-14 pl-4 pr-10 bg-white border border-slate-400 rounded-xl text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                >
                  {['A++', 'A+', 'A', 'B++', 'B+', 'B', 'NA'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            {/* NIRF Rank */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">
                NIRF Rank (#)
              </label>
              <input
                type="number"
                value={nirfRank}
                onChange={(e) => setNirfRank(parseInt(e.target.value) || 0)}
                className="w-full h-14 px-4 bg-white border border-slate-400 rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
            </div>
          </div>
          {/* 7. Avg Package & Highest Package */}
          <div className="grid grid-cols-2 gap-3">
            {/* Avg Package */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">
                Avg Package (LPA)
              </label>
              <input
                type="number"
                step="0.1"
                value={avgPackage}
                onChange={(e) => setAvgPackage(parseFloat(e.target.value) || 0)}
                className="w-full h-14 px-4 bg-white border border-slate-400 rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
            </div>
            {/* Highest Pkg */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">
                Highest Pkg (LPA)
              </label>
              <input
                type="number"
                step="0.1"
                value={highestPackage}
                onChange={(e) => setHighestPackage(parseFloat(e.target.value) || 0)}
                className="w-full h-14 px-4 bg-white border border-slate-400 rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
            </div>
          </div>
          {/* 8. College Banner Image Container */}
          <div className="bg-[#EEF2FF]/50 rounded-2xl border border-indigo-200/70 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-900">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <span>College Banner Image</span>
            </div>
            {/* URL Input */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-[#F5F7FF] px-1.5 text-[11px] font-semibold text-slate-600 z-10">
                College Banner Image URL
              </label>
              <textarea
                rows={2}
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full p-3 bg-white border border-slate-400 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
            </div>
            {/* Upload Button */}
            <label className="cursor-pointer w-full h-12 rounded-xl bg-white hover:bg-slate-50 text-indigo-900 border border-slate-300 text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98">
              <span>📄 📸</span>
              <span>Upload from Gallery / Files</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleGalleryUpload} 
                className="hidden" 
              />
            </label>
            {/* Preview with Delete Badge */}
            {bannerUrl && (
              <div className="relative h-44 w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm">
                <img src={bannerUrl} alt="College Banner" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setBannerUrl('')}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center font-bold text-sm shadow-md transition-colors"
                  title="Remove Image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          {/* 9. College Website URL */}
          <div className="relative">
            <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">
              College Website URL
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://rvce.edu.in"
              className="w-full h-14 px-4 bg-white border border-slate-400 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            />
          </div>
          {/* 10. Google College Map */}
          <div className="relative">
            <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">
              Google College Map (URL or Location Name)
            </label>
            <input
              type="text"
              value={mapLocation}
              onChange={(e) => setMapLocation(e.target.value)}
              placeholder="RV College of Engineering Bengaluru"
              className="w-full h-14 px-4 bg-white border border-slate-400 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            />
          </div>
          {/* 11. Broadcast Notification Checkbox */}
          <div className="p-4 bg-[#F0FDF4] rounded-2xl border border-emerald-300 flex items-start gap-3">
            <input
              type="checkbox"
              id="notify-students-check"
              checked={notifyStudents}
              onChange={(e) => setNotifyStudents(e.target.checked)}
              className="mt-1 w-5 h-5 rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
            />
            <label htmlFor="notify-students-check" className="cursor-pointer">
              <span className="text-sm font-bold text-emerald-950 block flex items-center gap-1.5">
                <span>📢</span> Notify all students about this college / cutoff update
              </span>
              <span className="text-[11px] text-emerald-800 block mt-0.5 font-medium">
                Sends push notification with direct link to College Predictor
              </span>
            </label>
          </div>
          {/* 12. Main Add College Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-14 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="text-base font-black">➕</span>
                <span>{editingId ? 'Save College Changes' : 'Add College'}</span>
              </>
            )}
          </button>
          {/* 13. Send Notification Secondary Button */}
          <button
            type="button"
            onClick={async () => {
              await sendBroadcast({
                title: '📢 KCET College Cutoffs Updated',
                message: 'New college closing ranks & August 2026 fee updates are now live. Explore your eligible colleges now!',
                type: 'COUNSELLING',
                actionType: 'NAV_COUNSELLING'
              });
              notifySuccess('Notification pushed to all students successfully!', 'Broadcast Sent');
            }}
            className="w-full h-14 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-black shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <span className="text-base">🔔</span>
            <span>📢 Send Notification to Students (Cutoffs Update)</span>
          </button>
        </form>
      </div>
      {/* Database Colleges Header & List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <h3 className="text-base font-black text-slate-900">
            Database Colleges ({colleges.length})
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search colleges..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none"
              />
            </div>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700"
            >
              <option value="ALL">All Districts</option>
              {KARNATAKA_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
        {/* College Cards List */}
        {filteredColleges.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500 font-medium">No colleges match your filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredColleges.map((col) => (
              <div 
                key={col.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {col.name} {col.code ? `(${col.code})` : ''}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                      Code: {col.code} • {col.district} • {col.collegeType}
                    </p>
                    <p className="text-sm font-bold text-[#4F46E5] mt-1">
                      Fee: ₹{col.tuitionFeePerYear.toLocaleString()}/yr • NAAC {col.naacGrade} • NIRF #{col.nirfRank || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm(`Are you sure you want to delete ${col.name}?`)) {
                        await deleteCollege(col.id);
                      }
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete College"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {/* 2 Bottom Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleEditDetails(col)}
                    className="h-11 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"
                  >
                    <span>✏️</span>
                    <span>Edit Details</span>
                  </button>
                  <button
                    onClick={() => handleOpenCutoffModal(col)}
                    className="h-11 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"
                  >
                    <span>📊</span>
                    <span>Edit Cutoffs</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
            {/* Cutoff Management Modal (Exact Screenshot Layout & Real-time Database Connection) */}
      {cutoffModalCollege && (() => {
        const collegeCutoffs = cutoffs.filter(c => c && c.collegeId === cutoffModalCollege.id);

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#F5F4FA] rounded-[30px] max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-4 max-h-[90vh] overflow-y-auto flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                  Cutoffs for {cutoffModalCollege.name}
                </h3>
              </div>

              {/* Section 1: Set Category Cutoff Ranks */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900">
                  Set Category Cutoff Ranks
                </h4>

                {/* Row 1: Branch Code & Branch Name */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="relative bg-white rounded-2xl border border-slate-300 p-2.5 pt-1.5 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 shadow-sm">
                    <label className="text-[11px] font-bold text-slate-500 block leading-tight">
                      Branch Code (e.g. CSE)
                    </label>
                    <input
                      type="text"
                      value={modalBranchCode}
                      onChange={(e) => handleBranchCodeInputChange(e.target.value)}
                      placeholder="CSE"
                      className="w-full font-black text-slate-900 text-sm focus:outline-none bg-transparent mt-0.5"
                    />
                  </div>

                  <div className="relative bg-white rounded-2xl border border-slate-300 p-2.5 pt-1.5 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 shadow-sm">
                    <label className="text-[11px] font-bold text-slate-500 block leading-tight">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={modalBranchName}
                      onChange={(e) => setModalBranchName(e.target.value)}
                      placeholder="Computer Science & Engineering"
                      className="w-full font-black text-slate-900 text-sm focus:outline-none bg-transparent mt-0.5 truncate"
                    />
                  </div>
                </div>

                {/* Row 2: GM Rank | 2A Rank | 2B Rank */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative bg-white rounded-2xl border border-slate-300 p-2.5 pt-1.5 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 shadow-sm">
                    <label className="text-[11px] font-bold text-slate-500 block leading-tight">GM Rank</label>
                    <input
                      type="number"
                      value={modalCategoryRanks.GM ?? ''}
                      onChange={(e) => setModalCategoryRanks({ ...modalCategoryRanks, GM: e.target.value })}
                      placeholder="120"
                      className="w-full font-black text-slate-900 text-sm focus:outline-none bg-transparent mt-0.5"
                    />
                  </div>

                  <div className="relative bg-white rounded-2xl border border-slate-300 p-2.5 pt-1.5 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 shadow-sm">
                    <label className="text-[11px] font-bold text-slate-500 block leading-tight">2A Rank</label>
                    <input
                      type="number"
                      value={modalCategoryRanks['2A'] ?? ''}
                      onChange={(e) => setModalCategoryRanks({ ...modalCategoryRanks, '2A': e.target.value })}
                      placeholder="210"
                      className="w-full font-black text-slate-900 text-sm focus:outline-none bg-transparent mt-0.5"
                    />
                  </div>

                  <div className="relative bg-white rounded-2xl border border-slate-300 p-2.5 pt-1.5 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 shadow-sm">
                    <label className="text-[11px] font-bold text-slate-500 block leading-tight">2B Rank</label>
                    <input
                      type="number"
                      value={modalCategoryRanks['2B'] ?? ''}
                      onChange={(e) => setModalCategoryRanks({ ...modalCategoryRanks, '2B': e.target.value })}
                      placeholder="2300"
                      className="w-full font-black text-slate-900 text-sm focus:outline-none bg-transparent mt-0.5"
                    />
                  </div>
                </div>

                {/* Row 3: 3A Rank | 3B Rank | SC Rank */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative bg-white rounded-2xl border border-slate-300 p-2.5 pt-1.5 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 shadow-sm">
                    <label className="text-[11px] font-bold text-slate-500 block leading-tight">3A Rank</label>
                    <input
                      type="number"
                      value={modalCategoryRanks['3A'] ?? ''}
                      onChange={(e) => setModalCategoryRanks({ ...modalCategoryRanks, '3A': e.target.value })}
                      placeholder="1400"
                      className="w-full font-black text-slate-900 text-sm focus:outline-none bg-transparent mt-0.5"
                    />
                  </div>

                  <div className="relative bg-white rounded-2xl border border-slate-300 p-2.5 pt-1.5 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 shadow-sm">
                    <label className="text-[11px] font-bold text-slate-500 block leading-tight">3B Rank</label>
                    <input
                      type="number"
                      value={modalCategoryRanks['3B'] ?? ''}
                      onChange={(e) => setModalCategoryRanks({ ...modalCategoryRanks, '3B': e.target.value })}
                      placeholder="1500"
                      className="w-full font-black text-slate-900 text-sm focus:outline-none bg-transparent mt-0.5"
                    />
                  </div>

                  <div className="relative bg-white rounded-2xl border border-slate-300 p-2.5 pt-1.5 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 shadow-sm">
                    <label className="text-[11px] font-bold text-slate-500 block leading-tight">SC Rank</label>
                    <input
                      type="number"
                      value={modalCategoryRanks.SC ?? ''}
                      onChange={(e) => setModalCategoryRanks({ ...modalCategoryRanks, SC: e.target.value })}
                      placeholder="12000"
                      className="w-full font-black text-slate-900 text-sm focus:outline-none bg-transparent mt-0.5"
                    />
                  </div>
                </div>

                {/* Row 4: ST Rank (Full Width) */}
                <div className="relative bg-white rounded-2xl border border-slate-300 p-2.5 pt-1.5 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 shadow-sm">
                  <label className="text-[11px] font-bold text-slate-500 block leading-tight">ST Rank</label>
                  <input
                    type="number"
                    value={modalCategoryRanks.ST ?? ''}
                    onChange={(e) => setModalCategoryRanks({ ...modalCategoryRanks, ST: e.target.value })}
                    placeholder="18000"
                    className="w-full font-black text-slate-900 text-sm focus:outline-none bg-transparent mt-0.5"
                  />
                </div>

                {/* Save Button (Green Pill) */}
                <button
                  type="button"
                  onClick={handleSaveModalCutoff}
                  className="w-full py-3 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <span className="text-base">💾</span>
                  <span>Save Branch Cutoff</span>
                </button>
              </div>

              {/* Section 2: Existing Saved Cutoffs List */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200/80">
                <h4 className="font-extrabold text-sm text-slate-900">
                  Existing Saved Cutoffs ({collegeCutoffs.length})
                </h4>

                {collegeCutoffs.length === 0 ? (
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center text-xs font-semibold text-slate-500">
                    No cutoffs saved for this college yet. Use the form above to add branch cutoffs.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {collegeCutoffs.map((cut) => (
                      <div
                        key={cut.id}
                        className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
                          {cut.branchCode}: GM #{cut.categoryCutoffs?.GM ?? 0} | 2A #{cut.categoryCutoffs?.['2A'] ?? 0} | SC #{cut.categoryCutoffs?.SC ?? 0}
                        </span>

                        <button
                          type="button"
                          onClick={async () => {
                            const ok = await requestConfirm({
                              title: 'Delete Branch Cutoff',
                              itemName: `${cut.branchCode} - ${cutoffModalCollege?.name || 'College'}`,
                              message: `Are you sure you want to delete the cutoff matrix for ${cut.branchCode}? Both Web and Android apps will no longer show these cutoffs.`,
                              isDestructive: true
                            });
                            if (ok) {
                              await deleteCutoff(cut.id);
                              notifySuccess(`Deleted ${cut.branchCode} cutoff from ${cutoffModalCollege?.name || 'college'}.`, 'Cutoff Deleted');
                            }
                          }}
                          className="p-1.5 text-[#DC2626] hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                          title="Delete Cutoff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Done Button */}
              <div className="flex justify-end pt-2 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setCutoffModalCollege(null)}
                  className="px-8 py-2.5 rounded-2xl bg-[#5B4DFB] hover:bg-[#4E3EF8] text-white font-black text-sm shadow-md transition-all active:scale-95"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
