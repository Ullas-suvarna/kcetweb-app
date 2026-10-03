import React, { useState, useEffect } from 'react';



import { 



  Compass, 



  Plus, 



  Edit3, 



  Trash2, 



  ExternalLink, 



  MapPin, 



  Sparkles, 



  CheckCircle2, 



  Building2, 



  Upload, 



  Globe, 



  Image as ImageIcon,



  RefreshCw,



  Search,



  ChevronDown



} from 'lucide-react';



import { useAdminData } from '../../context/AdminDataContext';



import { 



  College, 



  BranchCutoff, 



  EngineeringBranch, 



  DEMANDED_BRANCHES, 



  KARNATAKA_DISTRICTS, 



  CUTOFF_CATEGORIES, 



  CATEGORY_MULTIPLIERS,



  CollegeType,



  NaacGrade



} from '../../types';







export const BranchExplorerTab: React.FC = () => {



  const { 



    colleges, 



    cutoffs, 



    branches, 



    saveCollege, 



    saveCutoff, 



    deleteCutoff,



    deleteCollege 



  } = useAdminData();







  // Selected Branch Code



  const [selectedBranchCode, setSelectedBranchCode] = useState<string>('CSE');







  // Form Fields matching exact screenshot



  const [collegeName, setCollegeName] = useState<string>('RV College of Engineering');



  const [websiteUrl, setWebsiteUrl] = useState<string>('https://rvce.edu.in');



  const [mapLocation, setMapLocation] = useState<string>('RV College of Engineering Mysuru Road Bengaluru');



  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80');



  const [collegeType, setCollegeType] = useState<string>('Autonomous');



  const [district, setDistrict] = useState<string>('Bengaluru Urban');



  const [gmCutoff, setGmCutoff] = useState<number>(1500);



  const [augFee, setAugFee] = useState<number>(125000);



  const [avgSalary, setAvgSalary] = useState<number>(12.5);



  const [overview, setOverview] = useState<string>('');







  const [isSaving, setIsSaving] = useState(false);



  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);







  // Search filter for managed list below



  const [searchQuery, setSearchQuery] = useState('');



  const [filterBranch, setFilterBranch] = useState('ALL');







  // Preset Handlers



  const handlePreset = (presetName: string) => {



    if (presetName === 'Campus 1') {



      setImageUrl('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80');



    } else if (presetName === 'Tech Block') {



      setImageUrl('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80');



    } else if (presetName === 'Green Lawn') {



      setImageUrl('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80');



    }



  };







  // Gallery File Upload (Base64)



  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {



    const file = e.target.files?.[0];



    if (file) {



      const reader = new FileReader();



      reader.onloadend = () => {



        setImageUrl(reader.result as string);



      };



      reader.readAsDataURL(file);



    }



  };







  // Auto-fill form when choosing an existing college



  const handleSelectExistingCollege = (name: string) => {



    setCollegeName(name);



    const existing = colleges.find(c => c.name.toLowerCase().trim() === name.toLowerCase().trim());



    if (existing) {



      setWebsiteUrl(existing.websiteUrl || 'https://');



      setMapLocation(existing.mapLocationQuery || existing.name + ' ' + existing.district);



      if (existing.imageResUrl) setImageUrl(existing.imageResUrl);



      setCollegeType(existing.collegeType || 'Autonomous');



      setDistrict(existing.district || 'Bengaluru Urban');



      setAugFee(existing.tuitionFeePerYear || 125000);



      setAvgSalary(existing.avgPackageLpa || 12.5);







      const cut = cutoffs.find(c => c.collegeId === existing.id && c.branchCode === selectedBranchCode);



      if (cut && cut.categoryCutoffs?.GM) {



        setGmCutoff(cut.categoryCutoffs.GM);



      }



    }



  };







  // Save to Firebase Pipeline



  const handleSaveToBranchExplorer = async (e: React.FormEvent) => {



    e.preventDefault();



    if (!collegeName.trim()) {



      setStatusMessage({ text: 'Please enter a valid college name.', type: 'error' });



      return;



    }







    setIsSaving(true);



    setStatusMessage(null);







    try {



      // Find or generate college ID



      let existingCol = colleges.find(c => 



        c.name.toLowerCase().trim() === collegeName.toLowerCase().trim()



      );







      const colId = existingCol 



        ? existingCol.id 



        : `col_${collegeName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15)}_${Date.now()}`;







      // Derive code if new



      let code = existingCol?.code;



      if (!code) {



        const words = collegeName.trim().split(' ');



        code = ('E' + words.map(w => w[0]).join('').slice(0, 3)).toUpperCase();



      }







      const formattedWebsite = websiteUrl.trim().startsWith('http') 



        ? websiteUrl.trim() 



        : (websiteUrl.trim() ? `https://${websiteUrl.trim()}` : '');







      // 1. Write / Update /colleges/{colId} in Firestore



      const collegePayload: College = {



        id: colId,



        name: collegeName.trim(),



        code: code,



        district: district,



        collegeType: (collegeType as CollegeType) || 'Autonomous',



        imageResUrl: imageUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',



        logoResUrl: existingCol?.logoResUrl || '',



        naacGrade: existingCol?.naacGrade || 'A++',



        nirfRank: existingCol?.nirfRank || 100,



        tuitionFeePerYear: Number(augFee) || 125000,



        hostelFeePerYear: existingCol?.hostelFeePerYear || 85000,



        hasHostel: true,



        highestPackageLpa: Math.max(existingCol?.highestPackageLpa || 0, Number(avgSalary) * 2.5 || 45.0),



        avgPackageLpa: Number(avgSalary) || 12.5,



        placementPercentage: existingCol?.placementPercentage || 92,



        topRecruiters: existingCol?.topRecruiters || ['Microsoft', 'Google', 'Amazon', 'Infosys'],



        studentRating: existingCol?.studentRating || 4.8,



        websiteUrl: formattedWebsite,



        mapLocationQuery: mapLocation.trim() || `${collegeName} ${district}`,



        distanceKmFromBlr: existingCol?.distanceKmFromBlr || 12,



        brochureUrl: existingCol?.brochureUrl || ''



      };







      await saveCollege(collegePayload);







      // 2. Compute category cutoffs using standard KEA reservation multipliers



      const categoryCutoffsMap: Record<string, number> = {



        GM: Number(gmCutoff) || 1500



      };



      CUTOFF_CATEGORIES.forEach(cat => {



        if (cat !== 'GM') {



          const mult = CATEGORY_MULTIPLIERS[cat] || 1.0;



          categoryCutoffsMap[cat] = Math.round((Number(gmCutoff) || 1500) * mult);



        }



      });







      // 3. Write /branch_cutoffs/{colId_branchCode} in Firestore



      const branchMeta = DEMANDED_BRANCHES.find(b => b.code === selectedBranchCode);



      const cutoffId = `cut-${colId}-${selectedBranchCode.toLowerCase()}`;



      const cutoffPayload: BranchCutoff = {



        id: cutoffId,



        collegeId: colId,



        branchCode: selectedBranchCode,



        branchName: branchMeta?.name || selectedBranchCode,



        categoryCutoffs: categoryCutoffsMap



      };







      await saveCutoff(cutoffPayload);







      setStatusMessage({ 



        text: `Saved ${collegeName} (${selectedBranchCode}) successfully to Live Firebase!`, 



        type: 'success' 



      });







      // Clear overview field



      setOverview('');



    } catch (err: any) {



      setStatusMessage({ 



        text: 'Failed to save to Branch Explorer: ' + (err?.message || err), 



        type: 'error' 



      });



    } finally {



      setIsSaving(false);



    }



  };







  // Populate form with existing cutoff for editing



  const handleEditCutoff = (cutoff: BranchCutoff, col: College) => {



    setSelectedBranchCode(cutoff.branchCode);



    setCollegeName(col.name);



    setWebsiteUrl(col.websiteUrl || '');



    setMapLocation(col.mapLocationQuery || `${col.name} ${col.district}`);



    setImageUrl(col.imageResUrl || '');



    setCollegeType(col.collegeType || 'Autonomous');



    setDistrict(col.district || 'Bengaluru Urban');



    setGmCutoff(cutoff.categoryCutoffs?.GM || 1500);



    setAugFee(col.tuitionFeePerYear || 125000);



    setAvgSalary(col.avgPackageLpa || 12.5);



    window.scrollTo({ top: 0, behavior: 'smooth' });



  };







  // List of all managed offerings



  const allOfferings = cutoffs.map(cutoff => {



    const col = colleges.find(c => c.id === cutoff.collegeId);



    const branch = DEMANDED_BRANCHES.find(b => b.code === cutoff.branchCode);



    return { cutoff, col, branch };



  }).filter(item => item.col != null);







  const filteredOfferings = allOfferings.filter(({ cutoff, col, branch }) => {



    if (filterBranch !== 'ALL' && cutoff.branchCode !== filterBranch) return false;



    if (searchQuery.trim()) {



      const q = searchQuery.toLowerCase();



      const matchName = col?.name.toLowerCase().includes(q);



      const matchCode = col?.code.toLowerCase().includes(q);



      const matchBranch = branch?.name.toLowerCase().includes(q) || cutoff.branchCode.toLowerCase().includes(q);



      if (!matchName && !matchCode && !matchBranch) return false;



    }



    return true;



  });







  return (



    <div className="w-full space-y-6 animate-fadeIn pb-16">



      {/* Outer Card matching exact design */}



      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-5">



        {/* Title Header */}



        <div className="space-y-1">



          <div className="flex items-center gap-2">



            <span className="text-xl">🔬</span>



            <h2 className="text-lg font-black text-slate-900 tracking-tight">



              Add College to Branch Explorer



            </h2>



          </div>



          <p className="text-sm font-bold text-[#059669]">



            Connected in Real-Time to Student Engineering Branch Explorer



          </p>



        </div>







        {/* Status Message */}



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







        <form onSubmit={handleSaveToBranchExplorer} className="space-y-4">



          {/* 1. Branch Code (Demanded Branches) - Floating Notch Dropdown */}



          <div className="relative">



            <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">



              Branch Code (Demanded Branches)



            </label>



            <div className="relative">



              <select



                value={selectedBranchCode}



                onChange={(e) => setSelectedBranchCode(e.target.value)}



                className="w-full h-14 pl-4 pr-10 bg-white border border-slate-400 rounded-xl text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488]"



              >



                {DEMANDED_BRANCHES.map(b => (



                  <option key={b.code} value={b.code}>



                    {b.emoji} {b.code} — {b.name}



                  </option>



                ))}



              </select>



              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />



            </div>



          </div>







          {/* 2. College Name Field */}



          <div className="relative">



            <input



              type="text"



              value={collegeName}



              onChange={(e) => handleSelectExistingCollege(e.target.value)}



              placeholder="College Name (e.g. RV College of Engineering, BMS, PES)"



              className="w-full h-14 px-4 bg-white border border-slate-400 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488]"



              required



            />



          </div>







          {/* 3. College Official Website */}



          <div className="relative flex items-center">



            <div className="absolute left-4 text-teal-600 flex items-center justify-center pointer-events-none">



              <Globe className="w-5 h-5 text-[#0D9488]" />



            </div>



            <input



              type="text"



              value={websiteUrl}



              onChange={(e) => setWebsiteUrl(e.target.value)}



              placeholder="College Official Website (e.g. https://rvce.edu.in)"



              className="w-full h-14 pl-12 pr-4 bg-white border border-slate-400 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488]"



            />



          </div>







          {/* 4. College Map Location */}



          <div className="relative flex items-center">



            <div className="absolute left-4 text-rose-500 flex items-center justify-center pointer-events-none">



              <MapPin className="w-5 h-5 text-rose-500" />



            </div>



            <input



              type="text"



              value={mapLocation}



              onChange={(e) => setMapLocation(e.target.value)}



              placeholder="College Map Location (e.g. RV College of Engineering Mysuru Road Bengaluru)"



              className="w-full h-14 pl-12 pr-4 bg-white border border-slate-400 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488]"



            />



          </div>







          {/* 5. College Campus Banner / Screenshot Container */}



          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200 p-4 space-y-3">



            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">



              <ImageIcon className="w-4 h-4 text-sky-600" />



              <span>College Campus Banner / Screenshot</span>



            </div>







            {/* Upload Button */}



            <label className="cursor-pointer w-full h-12 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-bold shadow flex items-center justify-center gap-2 transition-all active:scale-98">



              <span className="text-sm">🖼️ 📸</span>



              <span>Upload Screenshot / Photo from Gallery</span>



              <input 



                type="file" 



                accept="image/*" 



                onChange={handleGalleryUpload} 



                className="hidden" 



              />



            </label>







            {/* URL Input */}



            <div className="relative">



              <input



                type="text"



                value={imageUrl}



                onChange={(e) => setImageUrl(e.target.value)}



                placeholder="Or Paste Image URL / Screenshot Link"



                className="w-full h-12 px-3 bg-white border border-slate-400 rounded-xl text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"



              />



            </div>







            {/* Presets Row */}



            <div className="flex items-center gap-2 pt-1 flex-wrap">



              <span className="text-sm font-bold text-slate-600">Presets:</span>



              <button



                type="button"



                onClick={() => handlePreset('Campus 1')}



                className="px-3.5 py-1.5 rounded-xl border border-slate-400 bg-white hover:bg-slate-100 text-sm font-semibold text-slate-800 transition-colors"



              >



                Campus 1



              </button>



              <button



                type="button"



                onClick={() => handlePreset('Tech Block')}



                className="px-3.5 py-1.5 rounded-xl border border-slate-400 bg-white hover:bg-slate-100 text-sm font-semibold text-slate-800 transition-colors"



              >



                Tech Block



              </button>



              <button



                type="button"



                onClick={() => handlePreset('Green Lawn')}



                className="px-3.5 py-1.5 rounded-xl border border-slate-400 bg-white hover:bg-slate-100 text-sm font-semibold text-slate-800 transition-colors"



              >



                Green Lawn



              </button>



            </div>







            {/* Thumbnail Preview */}



            {imageUrl && (



              <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-300">



                <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />



                <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow">



                  Active Banner



                </span>



              </div>



            )}



          </div>







          {/* 6. College Type (Private / Autonomous / Other) */}



          <div className="relative">



            <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">



              College Type (Private / Autonomous / Other)



            </label>



            <div className="relative">



              <select



                value={collegeType}



                onChange={(e) => setCollegeType(e.target.value)}



                className="w-full h-14 pl-4 pr-10 bg-white border border-slate-400 rounded-xl text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0D9488]"



              >



                <option value="Autonomous">Autonomous</option>



                <option value="Government">Government</option>



                <option value="Private">Private</option>



                <option value="Deemed University">Deemed University</option>



                <option value="Private University">Private University</option>



                <option value="Other">Other</option>



              </select>



              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />



            </div>



          </div>







          {/* 7. Place / District */}



          <div className="relative">



            <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">



              Place / District



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



              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />



            </div>



          </div>







          {/* 8. GM Cutoff Rank & August 2026 Fee (₹/ yr) Side by Side */}



          <div className="grid grid-cols-2 gap-3">



            {/* Left: GM Cutoff Rank */}



            <div className="relative">



              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">



                GM Cutoff Rank



              </label>



              <input



                type="number"



                value={gmCutoff}



                onChange={(e) => setGmCutoff(parseInt(e.target.value) || 1)}



                className="w-full h-14 px-4 bg-white border border-slate-400 rounded-xl text-sm font-extrabold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"



                required



              />



            </div>







            {/* Right: August 2026 Fee */}



            <div className="relative">



              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">



                August 2026 Fee (₹/ yr)



              </label>



              <input



                type="number"



                value={augFee}



                onChange={(e) => setAugFee(parseInt(e.target.value) || 0)}



                className="w-full h-14 px-4 bg-white border border-slate-400 rounded-xl text-sm font-extrabold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"



              />



            </div>



          </div>







          {/* 9. Average Starting Salary (LPA, e.g. 14.5) */}



          <div className="relative">



            <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">



              Average Starting Salary (LPA, e.g. 14.5)



            </label>



            <input



              type="number"



              step="0.1"



              value={avgSalary}



              onChange={(e) => setAvgSalary(parseFloat(e.target.value) || 0)}



              className="w-full h-14 px-4 bg-white border border-slate-400 rounded-xl text-sm font-extrabold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"



            />



          </div>







          {/* 10. Overview & Key Placement Highlights (Optional) */}



          <div className="relative">



            <textarea



              rows={3}



              value={overview}



              onChange={(e) => setOverview(e.target.value)}



              placeholder="Overview & Key Placement Highlights (Optional)"



              className="w-full p-3.5 bg-white border border-slate-400 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"



            />



          </div>







          {/* 11. Main Save Button */}



          <button



            type="submit"



            disabled={isSaving}



            className="w-full h-14 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"



          >



            {isSaving ? (



              <RefreshCw className="w-5 h-5 animate-spin" />



            ) : (



              <>



                <span className="text-base font-black">➕</span>



                <span>Save to Branch Explorer (Live for Students)</span>



              </>



            )}



          </button>



        </form>



      </div>







      {/* Admin Managed Engineering Branches & Colleges Header & List */}



      <div className="space-y-3">



        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">



          <h3 className="text-sm font-black text-slate-900">



            Admin Managed Engineering Branches & Colleges ({allOfferings.length})



          </h3>







          <div className="flex items-center gap-2">



            <select



              value={filterBranch}



              onChange={(e) => setFilterBranch(e.target.value)}



              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700"



            >



              <option value="ALL">All Branches ({allOfferings.length})</option>



              {DEMANDED_BRANCHES.map(b => (



                <option key={b.code} value={b.code}>



                  {b.emoji} {b.code} ({cutoffs.filter(c => c.branchCode === b.code).length})



                </option>



              ))}



            </select>



          </div>



        </div>







        {/* List of Managed Offerings */}



        {filteredOfferings.length === 0 ? (



          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">



            <p className="text-sm text-slate-500 font-medium">



              No colleges mapped yet. Use the form above to add your first college to Branch Explorer!



            </p>



          </div>



        ) : (



          <div className="space-y-3">



            {filteredOfferings.map(({ cutoff, col, branch }) => {



              if (!col) return null;



              return (



                <div 



                  key={cutoff.id}



                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"



                >



                  <div className="flex items-start gap-3">



                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">



                      <img 



                        src={col.imageResUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'} 



                        alt={col.name} 



                        className="w-full h-full object-cover" 



                      />



                    </div>







                    <div className="space-y-0.5">



                      <div className="flex items-center gap-1.5 flex-wrap">



                        <span className="font-extrabold text-sm text-slate-900">{col.name}</span>



                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-mono font-bold">



                          {col.code}



                        </span>



                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">



                          {branch?.emoji} {cutoff.branchCode}



                        </span>



                      </div>







                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium flex-wrap">



                        <span>📍 {col.district}</span>



                        <span>•</span>



                        <span>{col.collegeType}</span>



                        <span>•</span>



                        <span className="font-bold text-teal-800">



                          GM Cutoff: #{cutoff.categoryCutoffs?.GM?.toLocaleString()}



                        </span>



                        <span>•</span>



                        <span className="font-bold text-slate-800">



                          Fee: ₹{(col.tuitionFeePerYear/1000).toFixed(0)}k/yr



                        </span>



                      </div>



                    </div>



                  </div>







                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">



                    <button



                      onClick={() => handleEditCutoff(cutoff, col)}



                      className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0D9488] text-sm font-bold transition-colors"



                    >



                      Edit



                    </button>







                    <button



                      onClick={async () => {



                        if (confirm(`Delete ${cutoff.branchCode} cutoff for ${col.name}?`)) {



                          await deleteCutoff(cutoff.id);



                        }



                      }}



                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"



                      title="Delete Offering"



                    >



                      <Trash2 className="w-4 h-4" />



                    </button>



                  </div>



                </div>



              );



            })}



          </div>



        )}



      </div>



    </div>



  );



};



