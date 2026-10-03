import React, { useState, useMemo } from 'react';


import { 


  Compass, 


  Search, 


  MapPin, 


  ExternalLink, 


  Sparkles, 


  TrendingUp, 


  DollarSign, 


  Award, 


  CheckCircle2, 


  AlertTriangle, 


  ArrowRight, 


  Crown,


  FileText,


  RotateCcw,


  SlidersHorizontal,


  Flame,


  Building2,


  BookOpen


} from 'lucide-react';


import { useAdminData } from '../../context/AdminDataContext';


import { 


  DEMANDED_BRANCHES, 


  KARNATAKA_DISTRICTS, 


  CUTOFF_CATEGORIES, 


  CATEGORY_MULTIPLIERS,


  EngineeringBranch,


  College


} from '../../types';





interface StudentBranchExplorerProps {


  onBackToAdmin?: () => void;


}





export const StudentBranchExplorer: React.FC<StudentBranchExplorerProps> = ({ onBackToAdmin }) => {


  const { colleges, cutoffs, branches } = useAdminData();





  // Search & Filter State


  const [selectedBranchCode, setSelectedBranchCode] = useState<string>('CSE');


  const [userRank, setUserRank] = useState<number>(4500);


  const [userCategory, setUserCategory] = useState<string>('GM');


  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');


  const [selectedType, setSelectedType] = useState<string>('ALL');


  const [searchQuery, setSearchQuery] = useState<string>('');





  // Selected Branch Meta


  const currentBranch = useMemo(() => {


    return DEMANDED_BRANCHES.find(b => b.code === selectedBranchCode) || DEMANDED_BRANCHES[0];


  }, [selectedBranchCode]);





  const currentBranchGuide = useMemo(() => {


    return branches.find(b => b.branchCode === selectedBranchCode);


  }, [branches, selectedBranchCode]);





  // Reset Filters


  const handleResetFilters = () => {


    setUserRank(4500);


    setUserCategory('GM');


    setSelectedDistrict('ALL');


    setSelectedType('ALL');


    setSearchQuery('');


  };





  // Evaluation & Chance Predictor Engine


  // High Chance: R_user <= R_cutoff


  // Moderate Chance: R_cutoff < R_user <= R_rd2 (where R_rd2 = R_cutoff * 1.25)


  // Low Chance (Dream): R_user > R_rd2


  const evaluatedColleges = useMemo(() => {


    return colleges.map(col => {


      const cutoffObj = cutoffs.find(c => c.collegeId === col.id && c.branchCode === selectedBranchCode);


      


      let cutoffRank = 0;


      let categoryCutoffsMap: Record<string, number> = {};





      if (cutoffObj && cutoffObj.categoryCutoffs) {


        categoryCutoffsMap = { ...cutoffObj.categoryCutoffs };


        if (cutoffObj.categoryCutoffs[userCategory]) {


          cutoffRank = cutoffObj.categoryCutoffs[userCategory];


        } else if (cutoffObj.categoryCutoffs.GM) {


          const mult = CATEGORY_MULTIPLIERS[userCategory] || 1.0;


          cutoffRank = Math.round(cutoffObj.categoryCutoffs.GM * mult);


        }


      } else {


        const baseGM = Math.max(680, (col.nirfRank || 150) * 80);


        const mult = CATEGORY_MULTIPLIERS[userCategory] || 1.0;


        cutoffRank = Math.round(baseGM * mult);


        


        // Auto-fill mock map for display


        CUTOFF_CATEGORIES.forEach(cat => {


          const m = CATEGORY_MULTIPLIERS[cat] || 1.0;


          categoryCutoffsMap[cat] = Math.round(baseGM * m);


        });


      }





      const round2Cutoff = Math.round(cutoffRank * 1.25);





      let chanceStatus: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';


      if (userRank <= cutoffRank) {


        chanceStatus = 'HIGH';


      } else if (userRank <= round2Cutoff) {


        chanceStatus = 'MODERATE';


      } else {


        chanceStatus = 'LOW';


      }





      return {


        college: col,


        cutoffRank,


        round2Cutoff,


        chanceStatus,


        categoryCutoffsMap


      };


    });


  }, [colleges, cutoffs, selectedBranchCode, userRank, userCategory]);





  // Filtered Results


  const filteredColleges = useMemo(() => {


    return evaluatedColleges.filter(item => {


      const col = item.college;


      if (selectedDistrict !== 'ALL' && col.district !== selectedDistrict) return false;


      if (selectedType !== 'ALL' && col.collegeType !== selectedType) return false;


      if (searchQuery.trim()) {


        const q = searchQuery.toLowerCase();


        const matchName = col.name.toLowerCase().includes(q);


        const matchCode = col.code.toLowerCase().includes(q);


        if (!matchName && !matchCode) return false;


      }


      return true;


    }).sort((a, b) => {


      const rankOrder = { HIGH: 1, MODERATE: 2, LOW: 3 };


      if (rankOrder[a.chanceStatus] !== rankOrder[b.chanceStatus]) {


        return rankOrder[a.chanceStatus] - rankOrder[b.chanceStatus];


      }


      return a.cutoffRank - b.cutoffRank;


    });


  }, [evaluatedColleges, selectedDistrict, selectedType, searchQuery]);





  return (


    <div className="space-y-5 animate-fadeIn pb-12">


      {/* 1. Top Header Banner */}


      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">


        <div>


          <div className="flex items-center gap-2">


            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">


              <span>🌿</span> Engineering Branch Explorer


            </h1>


            <span className="px-2.5 py-0.5 rounded-full text-sm font-black bg-emerald-100 text-[#15803D] border border-emerald-300 shadow-sm">


              UGCET Aug 2026 Badge


            </span>


          </div>


          <p className="text-sm text-slate-500 font-semibold mt-0.5">


            KEA 2026 Cutoffs, August Fees & UGCET Tie-up Status


          </p>


        </div>





        {onBackToAdmin && (


          <button


            onClick={onBackToAdmin}


            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold transition-all active:scale-95"


          >


            <span>⚙️ Admin Panel</span>


            <ArrowRight className="w-3.5 h-3.5" />


          </button>


        )}


      </div>





      {/* 2. Premium VIP Banner */}


      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#B45309] text-white p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">


        <div className="flex items-center gap-3">


          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner shrink-0">


            👑


          </div>


          <div>


            <h3 className="font-black text-sm sm:text-base tracking-tight text-white flex items-center gap-2">


              KCET Premium Rank Intelligence


            </h3>


            <p className="text-sm text-amber-100 font-medium">


              Unlock 200+ Karnataka Engineering Colleges, Real-Time Round 2 Predictions & Multi-Category Cutoffs


            </p>


          </div>


        </div>





        <button className="px-4 py-2 rounded-xl bg-white text-[#B45309] hover:bg-amber-50 font-black text-sm shadow-md transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto">


          ⭐ Unlock All Cutoffs


        </button>


      </div>





      {/* 3. 🔍 SEARCH & FILTER CARD */}


      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">


        <div className="flex items-center justify-between border-b border-slate-100 pb-3">


          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">


            <Search className="w-4 h-4 text-[#0D9488]" />


            Search & Filter Engineering Streams


          </h3>


          <button


            onClick={handleResetFilters}


            className="inline-flex items-center gap-1 text-sm font-bold text-rose-600 hover:text-rose-800"


          >


            <RotateCcw className="w-3.5 h-3.5" />


            <span>Reset</span>


          </button>


        </div>





        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">


          {/* 1. Demanded Branch Dropdown */}


          <div>


            <label className="block text-[11px] font-bold text-slate-600 mb-1">


              1. Engineering Discipline


            </label>


            <select


              value={selectedBranchCode}


              onChange={(e) => setSelectedBranchCode(e.target.value)}


              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"


            >


              {DEMANDED_BRANCHES.map(b => (


                <option key={b.code} value={b.code}>


                  {b.emoji} {b.name} ({b.code})


                </option>


              ))}


            </select>


          </div>





          {/* 2. User KCET Rank */}


          <div>


            <label className="block text-[11px] font-bold text-slate-600 mb-1">


              2. Your KCET Rank (Chance Engine)


            </label>


            <input


              type="number"


              value={userRank}


              min={1}


              max={250000}


              onChange={(e) => setUserRank(Math.max(1, parseInt(e.target.value) || 1))}


              placeholder="e.g. 4500"


              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"


            />


          </div>





          {/* 3. Place / District */}


          <div>


            <label className="block text-[11px] font-bold text-slate-600 mb-1">


              3. Place / District


            </label>


            <select


              value={selectedDistrict}


              onChange={(e) => setSelectedDistrict(e.target.value)}


              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"


            >


              <option value="ALL">All Districts (31)</option>


              {KARNATAKA_DISTRICTS.map(d => (


                <option key={d} value={d}>{d}</option>


              ))}


            </select>


          </div>





          {/* 4. College Type */}


          <div>


            <label className="block text-[11px] font-bold text-slate-600 mb-1">


              4. College Type


            </label>


            <select


              value={selectedType}


              onChange={(e) => setSelectedType(e.target.value)}


              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"


            >


              <option value="ALL">All College Types</option>


              <option value="Autonomous">Autonomous</option>


              <option value="Government">Government</option>


              <option value="Private">Private</option>


              <option value="Deemed University">Deemed University</option>


              <option value="Private University">Private University</option>


            </select>


          </div>


        </div>





        {/* Search by Name */}


        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">


          <div className="relative flex-1 w-full">


            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />


            <input


              type="text"


              value={searchQuery}


              onChange={(e) => setSearchQuery(e.target.value)}


              placeholder="Search college name or code (e.g. RV College, E001)..."


              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white"


            />


          </div>





          <div className="flex items-center gap-2 shrink-0">


            <span className="text-[11px] font-bold text-slate-500">Category:</span>


            <select


              value={userCategory}


              onChange={(e) => setUserCategory(e.target.value)}


              className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-extrabold text-slate-900"


            >


              {CUTOFF_CATEGORIES.map(cat => (


                <option key={cat} value={cat}>{cat}</option>


              ))}


            </select>


          </div>


        </div>


      </div>





      {/* 4. 📖 ACTIVE BRANCH OVERVIEW & SCOPE CARD */}


      <div className="bg-white rounded-2xl border border-teal-200/80 p-5 shadow-sm space-y-3 bg-gradient-to-br from-teal-50/40 via-white to-white">


        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">


          <div className="flex items-center gap-3">


            <span className="text-3xl p-2 bg-white rounded-xl shadow-sm border border-teal-100">


              {currentBranch.emoji}


            </span>


            <div>


              <div className="flex items-center gap-2">


                <h3 className="text-base font-black text-slate-900">


                  {currentBranch.name} ({currentBranch.code})


                </h3>


                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white flex items-center gap-1 shadow-sm">


                  <Flame className="w-3 h-3" />


                  High Demand 🔥 Badge


                </span>


              </div>


              <p className="text-sm text-slate-500 font-semibold mt-0.5">


                • Branch Code: {currentBranch.code} • Tier 1 Demand in Karnataka KCET Counselling


              </p>


            </div>


          </div>





          <div className="flex items-center gap-2 text-sm font-bold text-teal-900">


            <span className="px-2.5 py-1 rounded-lg bg-teal-100/80 border border-teal-200">


              Avg Pkg: ₹{currentBranchGuide?.avgStartingSalaryLpa || 14.5} LPA


            </span>


            <span className="px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-950 border border-emerald-200">


              Showing: {filteredColleges.length} Colleges


            </span>


          </div>


        </div>





        <p className="text-sm text-slate-700 leading-relaxed">


          {currentBranchGuide?.overview || 'Premier engineering discipline covering software systems, scalable cloud infrastructure, and emerging AI technologies.'}


        </p>





        <div className="p-3 bg-white rounded-xl border border-teal-100 space-y-2 text-sm">


          <div className="flex items-start gap-2">


            <span className="font-extrabold text-slate-900 shrink-0">🚀 Future Scope:</span>


            <span className="text-slate-600">


              {currentBranchGuide?.futureScope || 'Massive expansion across Generative AI, Cloud Systems, Fintech & Cyber Defense.'}


            </span>


          </div>





          {currentBranchGuide?.careerOpportunities && (


            <div className="flex items-start gap-2 pt-1 border-t border-slate-100">


              <span className="font-extrabold text-slate-900 shrink-0">💼 Top Roles:</span>


              <div className="flex flex-wrap gap-1">


                {currentBranchGuide.careerOpportunities.map((role, i) => (


                  <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold">


                    {role}


                  </span>


                ))}


              </div>


            </div>


          )}





          {currentBranchGuide?.requiredSkills && (


            <div className="flex items-start gap-2 pt-1 border-t border-slate-100">


              <span className="font-extrabold text-slate-900 shrink-0">🧠 Core Skills:</span>


              <div className="flex flex-wrap gap-1">


                {currentBranchGuide.requiredSkills.map((skill, i) => (


                  <span key={i} className="px-2 py-0.5 rounded bg-teal-50 text-teal-900 font-bold text-[11px] border border-teal-200">


                    {skill}


                  </span>


                ))}


              </div>


            </div>


          )}


        </div>


      </div>





      {/* 5. 🏫 COLLEGE CUTOFFS & PREDICTOR CARDS */}


      <div className="space-y-4">


        <div className="flex items-center justify-between">


          <h3 className="font-black text-base text-slate-900 flex items-center gap-2">


            <Building2 className="w-4 h-4 text-[#16A34A]" />


            Top Colleges for {currentBranch.code} • Place: {selectedDistrict === 'ALL' ? 'All Districts' : selectedDistrict}


          </h3>


          <span className="text-sm font-bold text-slate-500">


            Category Selected: <strong className="text-emerald-800">{userCategory}</strong>


          </span>


        </div>





        {filteredColleges.length === 0 ? (


          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">


            <span className="text-3xl block mb-2">🔍</span>


            <h4 className="font-bold text-slate-800 text-sm">No engineering colleges found</h4>


            <p className="text-sm text-slate-500 mt-1">


              Try changing the district filter or clearing the search query.


            </p>


          </div>


        ) : (


          <div className="space-y-4">


            {filteredColleges.map(({ college, cutoffRank, round2Cutoff, chanceStatus, categoryCutoffsMap }) => {


              const isHigh = chanceStatus === 'HIGH';


              const isModerate = chanceStatus === 'MODERATE';





              return (


                <div 


                  key={college.id}


                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"


                >


                  {/* Card Header: Banner Image & Badges */}


                  <div className="relative h-44 sm:h-48 w-full bg-slate-100 overflow-hidden">


                    <img 


                      src={college.imageResUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'} 


                      alt={college.name} 


                      className="w-full h-full object-cover"


                      onError={(e) => {


                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80';


                      }}


                    />


                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />





                    {/* Top Badges */}


                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">


                      <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-slate-900 font-black text-sm shadow">


                        Code: {college.code}


                      </span>


                      <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white font-bold text-sm">


                        NAAC {college.naacGrade}


                      </span>


                      {college.nirfRank > 0 && (


                        <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white font-bold text-sm">


                          NIRF #{college.nirfRank}


                        </span>


                      )}


                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white font-extrabold text-sm">


                        ✅ UGCET 2026 KEA


                      </span>


                    </div>





                    {/* Cutoff Rank Top Right */}


                    <div className="absolute top-3 right-3">


                      <span className="px-3 py-1 rounded-xl bg-[#0D9488] text-white font-black text-sm shadow-lg border border-white/20">


                        {userCategory} Cutoff #{cutoffRank.toLocaleString()}


                      </span>


                    </div>





                    {/* College Title & Location Bottom */}


                    <div className="absolute bottom-3 left-4 right-4">


                      <h3 className="font-black text-white text-base sm:text-lg leading-snug drop-shadow-md">


                        {college.name}


                      </h3>


                      <div className="flex items-center gap-2 mt-1 text-sm text-white/90 font-medium">


                        <span className="flex items-center gap-1">


                          <MapPin className="w-3.5 h-3.5 text-rose-400" />


                          {college.district}


                        </span>


                        <span>•</span>


                        <span>{college.collegeType}</span>


                      </div>


                    </div>


                  </div>





                  {/* Body Content */}


                  <div className="p-4 sm:p-5 space-y-3.5">


                    {/* Metrics Bar */}


                    <div className="grid grid-cols-3 gap-2 text-center p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm">


                      <div>


                        <span className="block text-[10px] uppercase font-bold text-slate-500">💰 Aug 2026 Fee</span>


                        <span className="font-extrabold text-slate-900">


                          ₹{(college.tuitionFeePerYear / 1000).toFixed(0)}k/yr


                        </span>


                      </div>


                      <div>


                        <span className="block text-[10px] uppercase font-bold text-slate-500">💼 Avg Package</span>


                        <span className="font-extrabold text-emerald-700">


                          ₹{college.avgPackageLpa} LPA


                        </span>


                      </div>


                      <div>


                        <span className="block text-[10px] uppercase font-bold text-slate-500">📊 Placed</span>


                        <span className="font-extrabold text-teal-700">


                          {college.placementPercentage}%


                        </span>


                      </div>


                    </div>





                    {/* Chance Prediction Banner */}


                    <div className={`p-3 rounded-xl border flex items-center justify-between text-sm ${


                      isHigh


                        ? 'bg-[#F0FDF4] border-emerald-300 text-[#15803D]'


                        : isModerate


                        ? 'bg-[#FFFBEB] border-amber-300 text-[#B45309]'


                        : 'bg-[#FEE2E2] border-rose-300 text-[#B91C1C]'


                    }`}>


                      <div className="flex items-center gap-2 font-black">


                        {isHigh && <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />}


                        {isModerate && <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />}


                        {!isHigh && !isModerate && <span className="text-base shrink-0">🎯</span>}


                        <span>


                          {isHigh && `🟢 High Chance of Seat Allotment (Cutoff #${cutoffRank} ≥ Rank #${userRank})`}


                          {isModerate && `🟡 Likely in Round 2 / Extended (Cutoff #${cutoffRank} ~ Round 2 #${round2Cutoff})`}


                          {!isHigh && !isModerate && `🔴 Dream College / High Competition (Cutoff #${cutoffRank} < Rank #${userRank})`}


                        </span>


                      </div>





                      <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded-md bg-white border border-current">


                        {isHigh ? 'HIGH' : isModerate ? 'ROUND 2' : 'DREAM'}


                      </span>


                    </div>





                    {/* Complete Category Cutoffs Row */}


                    <div className="space-y-1.5 pt-1">


                      <span className="text-[11px] font-extrabold text-slate-700 block">


                        Complete Category Cutoffs:


                      </span>


                      <div className="flex flex-wrap gap-1.5">


                        {CUTOFF_CATEGORIES.map(cat => {


                          const r = categoryCutoffsMap[cat] || Math.round(cutoffRank * (CATEGORY_MULTIPLIERS[cat] || 1.0));


                          const isCurrent = userCategory === cat;


                          return (


                            <span 


                              key={cat}


                              className={`px-2.5 py-1 rounded-lg text-sm font-mono font-bold transition-all ${


                                isCurrent


                                  ? 'bg-[#0D9488] text-white shadow-sm'


                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'


                              }`}


                            >


                              {cat}: #{r.toLocaleString()}


                            </span>


                          );


                        })}


                      </div>


                    </div>





                    {/* Footer Action Buttons */}


                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">


                      <div className="flex items-center gap-2">


                        {/* 🌐 Website */}


                        {college.websiteUrl && (


                          <a


                            href={college.websiteUrl.startsWith('http') ? college.websiteUrl : `https://${college.websiteUrl}`}


                            target="_blank"


                            rel="noreferrer"


                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-colors"


                          >


                            <ExternalLink className="w-3.5 h-3.5 text-teal-700" />


                            <span>🌐 Website</span>


                          </a>


                        )}





                        {/* 📍 Google Map */}


                        <a


                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(college.mapLocationQuery || college.name + ' ' + college.district)}`}


                          target="_blank"


                          rel="noreferrer"


                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-colors"


                        >


                          <MapPin className="w-3.5 h-3.5 text-rose-500" />


                          <span>📍 Google Map</span>


                        </a>





                        {/* 📄 Brochure */}


                        <button


                          onClick={() => alert(`Brochure for ${college.name} (${currentBranch.code}) will open PDF.`)}


                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-colors"


                        >


                          <FileText className="w-3.5 h-3.5 text-sky-600" />


                          <span>📄 Brochure</span>


                        </button>


                      </div>





                      {college.websiteUrl && (


                        <a


                          href={college.websiteUrl.startsWith('http') ? college.websiteUrl : `https://${college.websiteUrl}`}


                          target="_blank"


                          rel="noreferrer"


                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-sm font-bold shadow-sm transition-all"


                        >


                          <span>Visit ↗</span>


                        </a>


                      )}


                    </div>


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


