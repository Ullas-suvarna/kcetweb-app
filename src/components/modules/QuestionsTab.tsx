import React, { useState } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Sparkles, 
  CheckCircle2, 
  Crown, 
  Image as ImageIcon,
  BookOpen
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { Question, SubjectType, CorrectOption } from '../../types';

export const QuestionsTab: React.FC = () => {
  const { questions, saveQuestion, deleteQuestion, testSeries, notifySuccess, notifyError, notifyWarning, notifyInfo, requestConfirm } = useAdminData();

  // Filters & Search
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<Question>({
    id: Date.now() % 100000,
    subject: 'PHYSICS',
    questionText: '',
    imageUrl: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    explanation: '',
    testSetId: testSeries[0]?.id || 'mock-full-01',
    isPremium: false
  });

  const subjects: { label: string; value: string; color: string }[] = [
    { label: 'All Subjects', value: 'ALL', color: 'bg-slate-100 text-slate-700' },
    { label: 'Physics', value: 'PHYSICS', color: 'bg-blue-100 text-blue-800' },
    { label: 'Chemistry', value: 'CHEMISTRY', color: 'bg-emerald-100 text-emerald-800' },
    { label: 'Mathematics', value: 'MATHEMATICS', color: 'bg-purple-100 text-purple-800' },
    { label: 'Biology', value: 'BIOLOGY', color: 'bg-amber-100 text-amber-800' }
  ];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      id: Math.floor(100 + Math.random() * 9000),
      subject: 'PHYSICS',
      questionText: '',
      imageUrl: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      explanation: '',
      testSetId: testSeries[0]?.id || 'mock-full-01',
      isPremium: false
    });
    setIsFormOpen(true);
  };

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setFormData({ ...q });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionText.trim()) {
      notifyWarning('Question text cannot be empty');
      return;
    }
    await saveQuestion(formData);
    setIsFormOpen(false);
  };

  const handleAIGenerate = () => {
    const aiSamples: Partial<Question>[] = [
      {
        subject: formData.subject,
        questionText: `A 2 kg block placed on a rough horizontal surface (\\mu = 0.4) is pulled by a horizontal force of 12 N. If g = 10 m/s^2, what is the acceleration of the block?`,
        optionA: '1.0 m/s^2',
        optionB: '2.0 m/s^2',
        optionC: '4.0 m/s^2',
        optionD: '0.5 m/s^2',
        correctOption: 'B',
        explanation: 'Friction f_k = \\mu N = 0.4 \\times (2 \\times 10) = 8 N. Net force = 12 - 8 = 4 N. Acceleration a = F_net / m = 4 / 2 = 2.0 m/s^2.'
      },
      {
        subject: 'CHEMISTRY',
        questionText: 'What is the IUPAC name of the complex compound [Co(NH3)5(CO3)]Cl?',
        optionA: 'Pentaamminecarbonatocobalt(III) chloride',
        optionB: 'Carbonatopentaamminecobalt(II) chloride',
        optionC: 'Pentaamminecobalt(III) carbonate chloride',
        optionD: 'Pentacarbonatoamminecobalt(III) chloride',
        correctOption: 'A',
        explanation: 'Ligands are named alphabetically: ammine before carbonato. Oxidation state of Co: x + 0 + (-2) - 1 = 0 => x = +3. Hence Pentaamminecarbonatocobalt(III) chloride.'
      }
    ];

    const pick = aiSamples[Math.floor(Math.random() * aiSamples.length)];
    setFormData(prev => ({
      ...prev,
      ...pick
    } as Question));
  };

  const filtered = questions.filter(q => {
    const matchSubject = selectedSubject === 'ALL' || q.subject === selectedSubject;
    const matchSearch = searchQuery === '' || 
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-admin-cardBorder shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-admin-heading flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-admin-primary" />
            CBT Question Bank Management
          </h2>
          <p className="text-sm text-admin-muted mt-0.5">
            Author and configure multiple-choice questions across Karnataka CET subjects with LaTeX support.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-admin-royal hover:bg-blue-700 text-white font-bold text-sm shadow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {subjects.map(sub => (
            <button
              key={sub.value}
              onClick={() => setSelectedSubject(sub.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                selectedSubject === sub.value
                  ? 'bg-admin-tab text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-admin-cardBorder'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-admin-cardBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary"
          />
        </div>
      </div>

      {/* Add / Edit Question Form Modal/Card */}
      {isFormOpen && (
        <div className="bg-white rounded-card border-2 border-admin-primary/40 shadow-lg p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-admin-heading flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-50 text-admin-primary">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
              {editingId ? `Edit Question #${editingId}` : 'Add New Multiple Choice Question'}
            </h3>
            <button
              type="button"
              onClick={handleAIGenerate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-sm font-bold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Generate with AI</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value as SubjectType })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-admin-primary"
                >
                  <option value="PHYSICS">PHYSICS</option>
                  <option value="CHEMISTRY">CHEMISTRY</option>
                  <option value="MATHEMATICS">MATHEMATICS</option>
                  <option value="BIOLOGY">BIOLOGY</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Question ID</label>
                <input
                  type="number"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Test Set ID</label>
                <input
                  type="text"
                  value={formData.testSetId}
                  onChange={(e) => setFormData({ ...formData, testSetId: e.target.value })}
                  placeholder="e.g. mock-full-01"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-admin-heading mb-1">
                Question Text (Supports LaTeX e.g. \frac&#123;a&#125;&#123;b&#125;, \sqrt&#123;&#125;)
              </label>
              <textarea
                rows={3}
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                placeholder="Enter complete question statement here..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-admin-heading mb-1">
                Diagram / Image URL (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://... image link for circuit/diagram"
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
                {formData.imageUrl && (
                  <a href={formData.imageUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 rounded-xl text-sm font-semibold text-blue-600 hover:underline">
                    Preview
                  </a>
                )}
              </div>
            </div>

            {/* Options A, B, C, D */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Option A</label>
                <input
                  type="text"
                  value={formData.optionA}
                  onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                  placeholder="Option A text"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Option B</label>
                <input
                  type="text"
                  value={formData.optionB}
                  onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                  placeholder="Option B text"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Option C</label>
                <input
                  type="text"
                  value={formData.optionC}
                  onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                  placeholder="Option C text"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Option D</label>
                <input
                  type="text"
                  value={formData.optionD}
                  onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                  placeholder="Option D text"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-semibold text-admin-heading mb-1">Correct Option</label>
                <select
                  value={formData.correctOption}
                  onChange={(e) => setFormData({ ...formData, correctOption: e.target.value as CorrectOption })}
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-sm font-bold text-emerald-900"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="premQuestion"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="w-4 h-4 rounded text-admin-primary focus:ring-admin-primary"
                />
                <label htmlFor="premQuestion" className="text-sm font-bold text-admin-heading flex items-center gap-1.5 cursor-pointer">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  Premium Only Access
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-admin-heading mb-1">
                Detailed Step-by-Step Explanation
              </label>
              <textarea
                rows={3}
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Include formulas, theorems and step-by-step derivation..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                required
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
                Save Question
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Question List Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-card border border-admin-cardBorder text-slate-500">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No questions found matching the filter.</p>
          </div>
        ) : (
          filtered.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-card border border-admin-cardBorder p-5 shadow-sm hover:shadow transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    #{q.id}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    q.subject === 'PHYSICS' ? 'bg-blue-100 text-blue-800' :
                    q.subject === 'CHEMISTRY' ? 'bg-emerald-100 text-emerald-800' :
                    q.subject === 'MATHEMATICS' ? 'bg-purple-100 text-purple-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {q.subject}
                  </span>
                  {q.isPremium && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      <Crown className="w-3 h-3 text-amber-600" />
                      PREMIUM
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500">
                    Set: {q.testSetId}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleEdit(q)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-admin-primary hover:bg-slate-100 transition-colors"
                    title="Edit question"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete question #${q.id}?`)) {
                        deleteQuestion(q.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-admin-destructive hover:bg-red-50 transition-colors"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Statement */}
              <p className="text-sm font-semibold text-admin-heading leading-relaxed mb-3">
                {q.questionText}
              </p>

              {q.imageUrl && (
                <div className="mb-3">
                  <img src={q.imageUrl} alt="Diagram" className="max-h-48 rounded-lg border border-slate-200" />
                </div>
              )}

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                <div className={`p-2.5 rounded-lg border ${
                  q.correctOption === 'A' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="font-bold mr-1.5">(A)</span> {q.optionA}
                </div>
                <div className={`p-2.5 rounded-lg border ${
                  q.correctOption === 'B' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="font-bold mr-1.5">(B)</span> {q.optionB}
                </div>
                <div className={`p-2.5 rounded-lg border ${
                  q.correctOption === 'C' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="font-bold mr-1.5">(C)</span> {q.optionC}
                </div>
                <div className={`p-2.5 rounded-lg border ${
                  q.correctOption === 'D' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="font-bold mr-1.5">(D)</span> {q.optionD}
                </div>
              </div>

              {/* Explanation Note */}
              <div className="bg-slate-50 border-l-4 border-emerald-500 p-2.5 rounded-r-lg text-sm text-slate-700">
                <span className="font-bold text-emerald-800">Explanation (Correct: {q.correctOption}): </span>
                {q.explanation}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

