import React, { useState } from 'react';



import { 



  Trophy, 



  Plus, 



  Trash2, 



  CheckCircle2, 



  Crown, 



  Clock, 



  FileText, 



  Zap, 



  Bell, 



  Eye, 



  ChevronDown,



  X,



  RefreshCw,



  Search



} from 'lucide-react';



import { useAdminData } from '../../context/AdminDataContext';



import { TestSeriesSet, Question, SubjectType, CorrectOption, TestCategory } from '../../types';







export const TestSeriesTab: React.FC = () => {



  const { 



    testSeries, 



    questions, 



    saveTestSeries, 



    deleteTestSeries, 



    saveQuestion, 



    deleteQuestion, 



    sendBroadcast, 



    notifySuccess, 



    notifyError, 



    notifyWarning, 



    notifyInfo, 



    requestConfirm 



  } = useAdminData();







  // Test Series Form Fields (Card 1)



  const [title, setTitle] = useState('');



  const [category, setCategory] = useState<TestCategory>('Full Mock Tests');



  const [durationMins, setDurationMins] = useState<number>(20);



  const [isPremium, setIsPremium] = useState<boolean>(false);



  const [description, setDescription] = useState<string>('');



  const [notifyStudents, setNotifyStudents] = useState<boolean>(true);







  // Staged Questions for this Test Series



  const [stagedQuestions, setStagedQuestions] = useState<Question[]>([]);







  // Current Question Input Fields (Nested Box)



  const [currentSubject, setCurrentSubject] = useState<SubjectType>('PHYSICS');



  const [questionText, setQuestionText] = useState('');



  const [optionA, setOptionA] = useState('');



  const [optionB, setOptionB] = useState('');



  const [optionC, setOptionC] = useState('');



  const [optionD, setOptionD] = useState('');



  const [correctOption, setCorrectOption] = useState<CorrectOption>('A');



  const [explanation, setExplanation] = useState('');







  const [isSaving, setIsSaving] = useState(false);



  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);







  // Modal: View / Manage questions in a Test Series



  const [viewingSet, setViewingSet] = useState<TestSeriesSet | null>(null);



  const [isAddingQuestionToExisting, setIsAddingQuestionToExisting] = useState<TestSeriesSet | null>(null);







  // Add Question to Staging



  const handleAddQuestionToStaging = (e: React.FormEvent) => {



    e.preventDefault();



    if (!questionText.trim() || !optionA.trim() || !optionB.trim()) {



      setStatusMsg({ text: 'Please fill question text, Option A, and Option B.', type: 'error' });



      return;



    }







    const newQ: Question = {



      id: Date.now() + Math.floor(Math.random() * 1000),



      subject: currentSubject,



      questionText: questionText.trim(),



      optionA: optionA.trim(),



      optionB: optionB.trim(),



      optionC: optionC.trim() || 'None of the above',



      optionD: optionD.trim() || 'All of the above',



      correctOption,



      explanation: explanation.trim() || 'Standard KCET conceptual formula and step-by-step evaluation.',



      testSetId: '', // Will be assigned on test series save



      isPremium



    };







    setStagedQuestions(prev => [...prev, newQ]);



    setStatusMsg({ text: `Added question (${currentSubject}) to stage! Total staged: ${stagedQuestions.length + 1}`, type: 'success' });







    // Clear question fields



    setQuestionText('');



    setOptionA('');



    setOptionB('');



    setOptionC('');



    setOptionD('');



    setExplanation('');



  };







  // Save Test Series Set to Firebase Pipeline



  const handleSaveTestSeries = async (e: React.FormEvent) => {



    e.preventDefault();



    if (!title.trim()) {



      setStatusMsg({ text: 'Please enter a valid Test Series Title.', type: 'error' });



      return;



    }







    setIsSaving(true);



    setStatusMsg(null);







    try {



      const setId = `set-${Date.now()}`;



      const newSet: TestSeriesSet = {



        id: setId,



        title: title.trim(),



        category,



        questionCount: stagedQuestions.length > 0 ? stagedQuestions.length : 20,



        durationMins: Number(durationMins) || 20,



        isPremium,



        description: description.trim() || 'Physics, Chemistry & Mathematics combined entrance paper with full answer key.',



        createdDate: new Date().toISOString().split('T')[0]



      };







      // 1. Save Test Series Set in Firestore



      await saveTestSeries(newSet);







      // 2. Save any staged questions



      for (const q of stagedQuestions) {



        await saveQuestion({ ...q, testSetId: setId });



      }







      // 3. Broadcast Notification if checked



      if (notifyStudents) {



        await sendBroadcast({



          title: `🏆 New CBT Test Live: ${title}`,



          message: `${title} (${category}, ${durationMins} mins) is now available on KCET Practice Pro. Test your ranking now!`,



          type: 'EXAM_ALERT',



          actionType: 'NAV_TEST_SERIES'



        });



      }







      setStatusMsg({ text: `Test Series "${title}" saved to Live Firebase!`, type: 'success' });







      // Reset Form



      setTitle('');



      setCategory('Full Mock Tests');



      setDurationMins(20);



      setIsPremium(false);



      setDescription('');



      setStagedQuestions([]);



    } catch (err: any) {



      setStatusMsg({ text: 'Failed to save test series: ' + (err?.message || err), type: 'error' });



    } finally {



      setIsSaving(false);



    }



  };







  // Auto-generate 180 Qs (60 Physics + 60 Chemistry + 60 Mathematics)



  const handleAutoGenerate180Qs = async (set: TestSeriesSet) => {



    if (!confirm(`Auto-generate and save 180 KCET Questions (60 Physics, 60 Chemistry, 60 Maths) for "${set.title}" to Live Firebase?`)) {



      return;



    }







    setIsSaving(true);



    try {



      const pcmSubjects: { name: SubjectType; count: number; prefix: string }[] = [



        { name: 'PHYSICS', count: 60, prefix: 'Physics' },



        { name: 'CHEMISTRY', count: 60, prefix: 'Chemistry' },



        { name: 'MATHEMATICS', count: 60, prefix: 'Mathematics' }



      ];







      for (const subj of pcmSubjects) {



        for (let i = 1; i <= subj.count; i++) {



          const opt: CorrectOption = (['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]) as CorrectOption;



          const q: Question = {



            id: Date.now() + Math.floor(Math.random() * 100000) + i,



            subject: subj.name,



            questionText: `${subj.prefix} Q${i}: Standard KCET exam problem on ${subj.prefix} kinematics, equations and theoretical laws for ${set.title}.`,



            optionA: `Formula evaluation result ${i * 2} rad/s or units`,



            optionB: `Derived standard constant ${i * 3}.5 N/m`,



            optionC: `Equilibrium state value ${i * 4} J`,



            optionD: `None of the above`,



            correctOption: opt,



            explanation: `Step-by-step solution for ${subj.prefix} Q${i}: Apply standard Karnataka State Board & NCERT syllabus relation.`,



            testSetId: set.id,



            isPremium: set.isPremium



          };



          await saveQuestion(q);



        }



      }







      await saveTestSeries({ ...set, questionCount: 180 });



      notifySuccess(`180 Questions (PCM) auto-generated and saved in Firestore for ${set.title}!`, 'Questions Generated');



    } catch (err: any) {



      notifyError('Error generating questions: ' + err?.message);



    } finally {



      setIsSaving(false);



    }



  };







  return (



    <div className="w-full space-y-6 animate-fadeIn pb-16">



      {/* Global Status Message */}



      {statusMsg && (



        <div className={`p-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm ${



          statusMsg.type === 'success' 



            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 



            : 'bg-rose-50 text-rose-800 border border-rose-300'



        }`}>



          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : '⚠️'}



          <span>{statusMsg.text}</span>



        </div>



      )}







      {/* ============================================================ */}



      {/* 1. Main Form Card: Add New Test Series with Questions        */}



      {/* ============================================================ */}



      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-5">



        {/* Title Header */}



        <div className="flex items-center gap-3">



          <div className="w-10 h-10 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center text-lg shadow shrink-0">



            🏆



          </div>



          <div>



            <h2 className="text-base font-black text-slate-900 tracking-tight">



              Add New Test Series with Questions



            </h2>



            <p className="text-sm text-slate-500 font-medium mt-0.5">



              Set test details and add questions, options, correct answer & solution explanations



            </p>



          </div>



        </div>







        <form onSubmit={handleSaveTestSeries} className="space-y-4">



          {/* Test Series Title */}



          <div className="relative">



            <input



              type="text"



              value={title}



              onChange={(e) => setTitle(e.target.value)}



              placeholder="Test Series Title (e.g. KCET Grand Mock Test 2026 #1)"



              className="w-full h-14 px-4 bg-white border border-slate-400 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"



              required



            />



          </div>







          {/* Category & Duration Side-by-Side */}



          <div className="grid grid-cols-2 gap-3">



            {/* Category Dropdown */}



            <div className="relative">



              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">



                Category (Full Mock / Subject / Chapter)



              </label>



              <div className="relative">



                <select



                  value={category}



                  onChange={(e) => setCategory(e.target.value as TestCategory)}



                  className="w-full h-14 pl-4 pr-10 bg-white border border-slate-400 rounded-2xl text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"



                >



                  <option value="Full Mock Tests">Full Mock Tests</option>



                  <option value="Previous Year Papers">Previous Year Papers</option>



                  <option value="Chapter-wise Tests">Chapter-wise Tests</option>



                  <option value="Daily Practice">Daily Practice</option>



                </select>



                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />



              </div>



            </div>







            {/* Duration (Mins) */}



            <div className="relative">



              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600 z-10">



                Duration (Mins)



              </label>



              <input



                type="number"



                value={durationMins}



                onChange={(e) => setDurationMins(parseInt(e.target.value) || 1)}



                className="w-full h-14 px-4 bg-white border border-slate-400 rounded-2xl text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"



                required



              />



            </div>



          </div>







          {/* Premium Set Checkbox Box & Questions Staged Badge */}



          <div className="grid grid-cols-2 gap-3">



            {/* Premium Toggle Box (Light Yellow Container) */}



            <div className="p-3.5 bg-[#FEF9C3] rounded-2xl border border-[#FDE047] flex items-center gap-3">



              <input



                type="checkbox"



                id="is-premium-set"



                checked={isPremium}



                onChange={(e) => setIsPremium(e.target.checked)}



                className="w-5 h-5 rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"



              />



              <label htmlFor="is-premium-set" className="cursor-pointer text-sm font-black text-[#854D0E] flex items-center gap-1.5">



                <span>👑</span>



                <span>Premium Set</span>



              </label>



            </div>







            {/* Questions Staged Box (Light Blue Container) */}



            <div className="p-3.5 bg-[#EFF6FF] rounded-2xl border border-[#DBEAFE] flex items-center justify-center text-sm font-bold text-indigo-900">



              <span>Questions Staged: <strong className="font-mono text-base font-black text-[#4F46E5]">{stagedQuestions.length}</strong></span>



            </div>



          </div>







          {/* Description & Instructions */}



          <div className="relative">



            <input



              type="text"



              value={description}



              onChange={(e) => setDescription(e.target.value)}



              placeholder="Description & Instructions (Optional)"



              className="w-full h-14 px-4 bg-white border border-slate-400 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"



            />



          </div>







          {/* ======================================================== */}



          {/* NESTED BOX: ✍️ Add Questions to this Test Series           */}



          {/* ======================================================== */}



          <div className="bg-[#F8FAFC] rounded-3xl border border-indigo-200 p-4 sm:p-5 space-y-4">



            <div className="flex items-center justify-between">



              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">



                <span>✍️</span> Add Questions to this Test Series



              </h3>



              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-indigo-50 text-[#4F46E5] border border-indigo-200">



                {stagedQuestions.length} Questions Added



              </span>



            </div>







            {/* Subject Selector Tabs */}



            <div className="space-y-1">



              <label className="block text-[11px] font-bold text-slate-600">Select Subject:</label>



              <div className="grid grid-cols-4 gap-2">



                {(['PHYSICS', 'CHEMISTRY', 'MATHEMATICS', 'BIOLOGY'] as SubjectType[]).map(subj => {



                  const labelMap: Record<SubjectType, string> = {



                    PHYSICS: 'PHYS',



                    CHEMISTRY: 'CHEM',



                    MATHEMATICS: 'MATH',



                    BIOLOGY: 'BIOL'



                  };



                  const isSelected = currentSubject === subj;



                  return (



                    <button



                      key={subj}



                      type="button"



                      onClick={() => setCurrentSubject(subj)}



                      className={`h-11 rounded-2xl text-sm font-black transition-all ${



                        isSelected



                          ? 'bg-[#4F46E5] text-white shadow-md'



                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'



                      }`}



                    >



                      {labelMap[subj]}



                    </button>



                  );



                })}



              </div>



            </div>







            {/* Question Text / Problem Statement */}



            <div className="relative">



              <textarea



                rows={3}



                value={questionText}



                onChange={(e) => setQuestionText(e.target.value)}



                placeholder="Question Text / Problem Statement *"



                className="w-full p-3.5 bg-white border border-slate-400 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"



              />



            </div>







            {/* Options (A, B, C, D) */}



            <div className="space-y-2">



              <label className="block text-[11px] font-bold text-slate-600">Options (A, B, C, D):</label>



              <input



                type="text"



                value={optionA}



                onChange={(e) => setOptionA(e.target.value)}



                placeholder="Option A *"



                className="w-full h-12 px-4 bg-white border border-slate-400 rounded-2xl text-sm font-medium text-slate-900"



              />



              <input



                type="text"



                value={optionB}



                onChange={(e) => setOptionB(e.target.value)}



                placeholder="Option B *"



                className="w-full h-12 px-4 bg-white border border-slate-400 rounded-2xl text-sm font-medium text-slate-900"



              />



              <input



                type="text"



                value={optionC}



                onChange={(e) => setOptionC(e.target.value)}



                placeholder="Option C"



                className="w-full h-12 px-4 bg-white border border-slate-400 rounded-2xl text-sm font-medium text-slate-900"



              />



              <input



                type="text"



                value={optionD}



                onChange={(e) => setOptionD(e.target.value)}



                placeholder="Option D"



                className="w-full h-12 px-4 bg-white border border-slate-400 rounded-2xl text-sm font-medium text-slate-900"



              />



            </div>







            {/* Correct Option Selector */}



            <div className="space-y-1.5">



              <label className="block text-[11px] font-bold text-slate-600">Select Correct Option (Answer Key) *:</label>



              <div className="grid grid-cols-4 gap-2">



                {(['A', 'B', 'C', 'D'] as CorrectOption[]).map(opt => {



                  const isSelected = correctOption === opt;



                  return (



                    <button



                      key={opt}



                      type="button"



                      onClick={() => setCorrectOption(opt)}



                      className={`h-11 rounded-2xl text-sm font-black transition-all ${



                        isSelected



                          ? 'bg-[#16A34A] text-white shadow-md'



                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'



                      }`}



                    >



                      {isSelected ? `✓ Option ${opt}` : `Option ${opt}`}



                    </button>



                  );



                })}



              </div>



            </div>







            {/* Solution / Explanation */}



            <div className="relative">



              <textarea



                rows={2}



                value={explanation}



                onChange={(e) => setExplanation(e.target.value)}



                placeholder="Solution / Step-by-Step Explanation"



                className="w-full p-3.5 bg-white border border-slate-400 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"



              />



            </div>







            {/* Add Question to Set Button */}



            <button



              type="button"



              onClick={handleAddQuestionToStaging}



              className="w-full h-12 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"



            >



              <span>➕</span>



              <span>Add This Question to Set ({stagedQuestions.length} Added)</span>



            </button>



          </div>







          {/* Broadcast Notification Checkbox Box */}



          <div className="p-4 bg-[#EEF2FF] rounded-2xl border border-[#C7D2FE] flex items-start gap-3">



            <input



              type="checkbox"



              id="notify-test-check"



              checked={notifyStudents}



              onChange={(e) => setNotifyStudents(e.target.checked)}



              className="mt-1 w-5 h-5 rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"



            />



            <label htmlFor="notify-test-check" className="cursor-pointer">



              <span className="text-sm font-bold text-indigo-950 block flex items-center gap-1.5">



                <span>📢</span> Notify all students about this new Test Series Set



              </span>



              <span className="text-[11px] text-indigo-800 block mt-0.5 font-medium">



                Sends instant push notification with direct link to Practice tab



              </span>



            </label>



          </div>







          {/* Main Action Button: Save Test Series to Firebase */}



          <button



            type="submit"



            disabled={isSaving}



            className="w-full h-14 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"



          >



            {isSaving ? (



              <RefreshCw className="w-5 h-5 animate-spin" />



            ) : (



              <>



                <CheckCircle2 className="w-5 h-5" />



                <span>Save Test Series Set to Firebase</span>



              </>



            )}



          </button>



        </form>



      </div>







      {/* ============================================================ */}



      {/* 2. List: Live Test Series Question Sets in Firebase          */}



      {/* ============================================================ */}



      <div className="space-y-4">



        <h3 className="text-sm font-black text-slate-900 px-1">



          Live Test Series Question Sets in Firebase ({testSeries.length})



        </h3>







        {testSeries.length === 0 ? (



          <div className="text-center py-10 bg-white rounded-3xl border border-slate-200 p-6">



            <p className="text-sm text-slate-500 font-medium">No test series sets added yet.</p>



          </div>



        ) : (



          <div className="space-y-4">



            {testSeries.map((set) => {



              const questionsInSet = questions.filter(q => q.testSetId === set.id);



              return (



                <div 



                  key={set.id}



                  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-3 relative"



                >



                  {/* Top Header: Title, Badge, and Delete */}



                  <div className="flex items-start justify-between gap-3">



                    <div>



                      <div className="flex items-center gap-2 flex-wrap">



                        <h4 className="font-extrabold text-base text-slate-900">



                          {set.title}



                        </h4>



                        {set.isPremium ? (



                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047] flex items-center gap-1">



                            <span>👑</span> Premium



                          </span>



                        ) : (



                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-[#15803D] border border-emerald-200">



                            Free



                          </span>



                        )}



                      </div>







                      {/* Subtitle stats line */}



                      <p className="text-sm font-bold text-[#4F46E5] mt-1">



                        {set.isPremium ? 'Premium Mock Test' : 'Free Mock Test'} • Target {set.questionCount} Questions • {set.durationMins} mins



                      </p>







                      <p className="text-sm font-bold text-[#15803D] mt-0.5 flex items-center gap-1">



                        <span>🔥</span> Stored in Firebase: {questionsInSet.length} Questions (Options & Explanations)



                      </p>



                    </div>







                    <button



                      onClick={async () => {



                        if (confirm(`Delete test series "${set.title}" and all its questions?`)) {



                          await deleteTestSeries(set.id);



                          // Also remove questions



                          for (const q of questionsInSet) {



                            await deleteQuestion(q.id);



                          }



                        }



                      }}



                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"



                      title="Delete Test Series"



                    >



                      <Trash2 className="w-4 h-4" />



                    </button>



                  </div>







                  {/* Description */}



                  <p className="text-sm text-slate-600 leading-relaxed">



                    {set.description}



                  </p>







                  {/* Action Buttons Grid */}



                  <div className="space-y-2 pt-2 border-t border-slate-100">



                    {/* Row 1: + Add Question | 👁️ Questions (Count) */}



                    <div className="grid grid-cols-2 gap-3">



                      <button



                        onClick={() => setIsAddingQuestionToExisting(set)}



                        className="h-11 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-black shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"



                      >



                        <span>➕ Add Question</span>



                      </button>







                      <button



                        onClick={() => setViewingSet(set)}



                        className="h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"



                      >



                        <span>👁️ Questions ({questionsInSet.length})</span>



                      </button>



                    </div>







                    {/* Row 2: ➕ ⚡ Auto-Generate & Save 180 Qs (PCM) to Firebase */}



                    <button



                      onClick={() => handleAutoGenerate180Qs(set)}



                      className="w-full h-12 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white text-sm font-black shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98"



                    >



                      <span>➕ ⚡</span>



                      <span>Auto-Generate & Save 180 Qs (PCM) to Firebase</span>



                    </button>







                    {/* Row 3: 🔔 📢 Send Notification to Students for this Test */}



                    <button



                      onClick={async () => {



                        await sendBroadcast({



                          title: `📢 Test Alert: ${set.title}`,



                          message: `Full Mock Test (${set.durationMins} mins, ${questionsInSet.length} Questions) is active. Take your mock exam now!`,



                          type: 'EXAM_ALERT',



                          actionType: 'NAV_TEST_SERIES'



                        });



                        notifySuccess(`Notification broadcasted to all students for "${set.title}"!`, 'Notification Sent');



                      }}



                      className="w-full h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98"



                    >



                      <span>🔔 📢</span>



                      <span>Send Notification to Students for this Test</span>



                    </button>



                  </div>



                </div>



              );



            })}



          </div>



        )}



      </div>







      {/* Modal: View Questions in Set */}



      {viewingSet && (



        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">



          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">



            <div className="flex items-center justify-between pb-3 border-b border-slate-100">



              <div>



                <h3 className="font-black text-base text-slate-900">



                  Questions in "{viewingSet.title}"



                </h3>



                <span className="text-sm text-indigo-600 font-bold">



                  {questions.filter(q => q.testSetId === viewingSet.id).length} Questions Stored in Firestore



                </span>



              </div>



              <button



                onClick={() => setViewingSet(null)}



                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"



              >



                ✕



              </button>



            </div>







            <div className="space-y-3">



              {questions.filter(q => q.testSetId === viewingSet.id).length === 0 ? (



                <p className="text-sm text-slate-500 text-center py-6">No questions added to this test yet.</p>



              ) : (



                questions.filter(q => q.testSetId === viewingSet.id).map((q, idx) => (



                  <div key={q.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-sm">



                    <div className="flex items-start justify-between gap-2">



                      <span className="font-extrabold text-slate-900">Q{idx + 1}. [{q.subject}] {q.questionText}</span>



                      <button



                        onClick={async () => {



                          await deleteQuestion(q.id);



                        }}



                        className="text-rose-500 hover:text-rose-700 p-1"



                      >



                        <Trash2 className="w-3.5 h-3.5" />



                      </button>



                    </div>







                    <div className="grid grid-cols-2 gap-1 text-[11px]">



                      <span className={q.correctOption === 'A' ? 'font-black text-emerald-700' : 'text-slate-600'}>A: {q.optionA}</span>



                      <span className={q.correctOption === 'B' ? 'font-black text-emerald-700' : 'text-slate-600'}>B: {q.optionB}</span>



                      <span className={q.correctOption === 'C' ? 'font-black text-emerald-700' : 'text-slate-600'}>C: {q.optionC}</span>



                      <span className={q.correctOption === 'D' ? 'font-black text-emerald-700' : 'text-slate-600'}>D: {q.optionD}</span>



                    </div>







                    <div className="p-2 bg-emerald-50 rounded-xl text-[10px] text-emerald-900 font-semibold">



                      💡 Correct: Option {q.correctOption} • {q.explanation}



                    </div>



                  </div>



                ))



              )}



            </div>







            <div className="pt-2 flex justify-end">



              <button



                onClick={() => setViewingSet(null)}



                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm"



              >



                Close



              </button>



            </div>



          </div>



        </div>



      )}







      {/* Modal: Quick Add Question to Existing Set */}



      {isAddingQuestionToExisting && (



        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">



          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">



            <div className="flex items-center justify-between pb-3 border-b border-slate-100">



              <h3 className="font-black text-base text-slate-900">



                Add Question to "{isAddingQuestionToExisting.title}"



              </h3>



              <button



                onClick={() => setIsAddingQuestionToExisting(null)}



                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"



              >



                ✕



              </button>



            </div>







            <form



              onSubmit={async (e) => {



                e.preventDefault();



                const q: Question = {



                  id: Date.now(),



                  subject: currentSubject,



                  questionText,



                  optionA,



                  optionB,



                  optionC: optionC || 'None of the above',



                  optionD: optionD || 'All of the above',



                  correctOption,



                  explanation: explanation || 'Standard KCET solution.',



                  testSetId: isAddingQuestionToExisting.id,



                  isPremium: isAddingQuestionToExisting.isPremium



                };



                await saveQuestion(q);



                notifySuccess(`Question added to ${isAddingQuestionToExisting.title}!`, 'Question Added');



                setQuestionText('');



                setOptionA('');



                setOptionB('');



                setOptionC('');



                setOptionD('');



                setExplanation('');



                setIsAddingQuestionToExisting(null);



              }}



              className="space-y-3 text-sm"



            >



              <textarea



                rows={2}



                value={questionText}



                onChange={(e) => setQuestionText(e.target.value)}



                placeholder="Question Text *"



                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl"



                required



              />



              <input



                type="text"



                value={optionA}



                onChange={(e) => setOptionA(e.target.value)}



                placeholder="Option A *"



                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"



                required



              />



              <input



                type="text"



                value={optionB}



                onChange={(e) => setOptionB(e.target.value)}



                placeholder="Option B *"



                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"



                required



              />



              <input



                type="text"



                value={optionC}



                onChange={(e) => setOptionC(e.target.value)}



                placeholder="Option C"



                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"



              />



              <input



                type="text"



                value={optionD}



                onChange={(e) => setOptionD(e.target.value)}



                placeholder="Option D"



                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"



              />







              <div className="flex items-center gap-2">



                <span className="font-bold">Correct Option:</span>



                {(['A', 'B', 'C', 'D'] as CorrectOption[]).map(o => (



                  <button



                    key={o}



                    type="button"



                    onClick={() => setCorrectOption(o)}



                    className={`px-3 py-1 rounded-lg font-bold ${correctOption === o ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}



                  >



                    {o}



                  </button>



                ))}



              </div>







              <div className="pt-2 flex justify-end gap-2 border-t">



                <button



                  type="button"



                  onClick={() => setIsAddingQuestionToExisting(null)}



                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold"



                >



                  Cancel



                </button>



                <button



                  type="submit"



                  className="px-5 py-2 rounded-xl bg-[#4F46E5] text-white font-bold"



                >



                  Save Question



                </button>



              </div>



            </form>



          </div>



        </div>



      )}



    </div>



  );



};



