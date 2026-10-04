import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Users, 
  ShieldCheck, 
  FileSpreadsheet, 
  Eye, 
  Lock 
} from 'lucide-react';
import { 
  StudentDossierRecord, 
  generateDossierTxt, 
  generateDossierCsv, 
  downloadFile, 
  printStudentDossier 
} from '../../utils/studentDossierExporter';

interface StudentDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: StudentDossierRecord[];
  onNotify?: (msg: string, title?: string) => void;
}

export const StudentDossierModal: React.FC<StudentDossierModalProps> = ({
  isOpen,
  onClose,
  records,
  onNotify
}) => {
  const [activeTab, setActiveTab] = useState<'ACTIONS' | 'PREVIEW_TXT' | 'PREVIEW_CSV'>('ACTIONS');
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    printStudentDossier(records);
    if (onNotify) onNotify(`Preparing print / PDF for ${records.length} students...`, 'Printing Dossier');
  };

  const handleDownloadTxt = () => {
    const txt = generateDossierTxt(records);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(txt, `KCET_Students_Dossier_${dateStr}.txt`, 'text/plain');
    if (onNotify) onNotify(`Downloaded TXT dossier for ${records.length} students!`, 'File Downloaded');
  };

  const handleDownloadCsv = () => {
    const csv = generateDossierCsv(records);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(csv, `KCET_Students_Credentials_${dateStr}.csv`, 'text/csv');
    if (onNotify) onNotify(`Downloaded CSV spreadsheet for ${records.length} students!`, 'CSV Exported');
  };

  const handleCopyClipboard = async () => {
    const txt = generateDossierTxt(records);
    try {
      await navigator.clipboard.writeText(txt);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
      if (onNotify) onNotify(`All ${records.length} student dossiers copied to clipboard!`, 'Copied');
    } catch (e) {
      if (onNotify) onNotify('Could not copy to clipboard. Please try downloading TXT.', 'Notice');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-indigo-100 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E1B4B] to-[#312E81] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-2xl shadow-inner">
              📥
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Download & Print Student Dossier</span>
                <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full">
                  {records.length} Students
                </span>
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-indigo-200">
                Exports complete personal info, official student IDs, login passwords, and test performance.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-100/80 px-6 py-2.5 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('ACTIONS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'ACTIONS'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ Export Options
          </button>
          <button
            onClick={() => setActiveTab('PREVIEW_TXT')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'PREVIEW_TXT'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📄 Formatted Text Preview
          </button>
          <button
            onClick={() => setActiveTab('PREVIEW_CSV')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'PREVIEW_CSV'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 CSV Data Preview
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'ACTIONS' && (
            <div className="space-y-6">
              {/* Highlight summary card */}
              <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Synchronized with Cloud Firestore & Realtime DB</span>
                  </div>
                  <div className="text-xs text-indigo-800 font-medium">
                    Every exported file contains student names, IDs, verified contact emails, phone numbers, assigned credentials, and latest CBT test metrics.
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-bold">Total Enrolled</div>
                    <div className="text-lg font-black text-slate-900">{records.length} Profiles</div>
                  </div>
                </div>
              </div>

              {/* 4 Export Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Print / PDF */}
                <div className="p-5 rounded-2xl border-2 border-indigo-100 hover:border-indigo-400 bg-white shadow-sm flex flex-col justify-between space-y-4 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl">
                      🖨️
                    </div>
                    <h3 className="text-base font-black text-slate-900">Print / Save as PDF</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Opens system print dialog formatted for A4 portrait with clean page breaks for each student dossier card.
                    </p>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="w-full py-2.5 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Open Print / PDF Dialog</span>
                  </button>
                </div>

                {/* 2. Spreadsheet CSV */}
                <div className="p-5 rounded-2xl border-2 border-emerald-100 hover:border-emerald-400 bg-white shadow-sm flex flex-col justify-between space-y-4 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
                      📊
                    </div>
                    <h3 className="text-base font-black text-slate-900">Spreadsheet (.csv)</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Complete spreadsheet with 19 columns. Opens directly in Microsoft Excel, Google Sheets, or Apple Numbers.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadCsv}
                    className="w-full py-2.5 px-4 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download CSV Spreadsheet</span>
                  </button>
                </div>

                {/* 3. Text Document (.txt) */}
                <div className="p-5 rounded-2xl border-2 border-slate-200 hover:border-slate-400 bg-white shadow-sm flex flex-col justify-between space-y-4 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xl">
                      📄
                    </div>
                    <h3 className="text-base font-black text-slate-900">Formatted Document (.txt)</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Clean ASCII formatted report with card borders for archiving, offline backups, or manual terminal review.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadTxt}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .TXT File</span>
                  </button>
                </div>

                {/* 4. Copy to Clipboard */}
                <div className="p-5 rounded-2xl border-2 border-amber-100 hover:border-amber-400 bg-white shadow-sm flex flex-col justify-between space-y-4 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl">
                      📋
                    </div>
                    <h3 className="text-base font-black text-slate-900">Copy to Clipboard</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Copies the complete formatted dossiers to your clipboard for instant pasting into emails, WhatsApp, or notes.
                    </p>
                  </div>
                  <button
                    onClick={handleCopyClipboard}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                      hasCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    }`}
                  >
                    {hasCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Dossier Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PREVIEW_TXT' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Live ASCII Text Document Output:</span>
                <button
                  onClick={handleCopyClipboard}
                  className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{hasCopied ? 'Copied!' : 'Copy Preview'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto max-h-[50vh] border border-slate-800 leading-tight">
                {generateDossierTxt(records)}
              </pre>
            </div>
          )}

          {activeTab === 'PREVIEW_CSV' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Live CSV Comma-Separated Values:</span>
                <button
                  onClick={handleDownloadCsv}
                  className="text-xs font-black text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .csv</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-50 text-slate-700 rounded-2xl font-mono text-xs overflow-x-auto max-h-[50vh] border border-slate-200">
                {generateDossierCsv(records)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-semibold">
            Confidential student credentials directory • KCET Gen Z Admin
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
