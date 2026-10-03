import React from 'react';
import { Bell, LogOut, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';

interface AdminHeaderProps {
  onOpenBroadcast: () => void;
  onOpenFirebaseConfig?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenBroadcast }) => {
  const { logoutAdmin, syncStatus, seedDefaultsToFirebase, adminEmail } = useAdminData();
  const [isSeeding, setIsSeeding] = React.useState(false);

  const handleSeed = async () => {
    if (confirm("Do you want to seed default Karnataka KCET data into Firestore collections?")) {
      setIsSeeding(true);
      await seedDefaultsToFirebase();
      setIsSeeding(false);
    }
  };

  return (
    <header className="bg-[#1E1B4B] text-white border-b border-[#312E81] sticky top-0 z-40 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center font-black text-amber-300 shadow">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-bold text-white tracking-tight leading-tight">
                KCET Admin Panel
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#312E81] text-indigo-200 border border-indigo-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Live Console
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-indigo-300">
              <span className="truncate max-w-[180px] sm:max-w-none">{adminEmail}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden md:inline text-[10px] text-indigo-300/80">{syncStatus}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Seed Firestore Tooltip/Button */}
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            title="Seed Firestore collections with Karnataka mock data"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#312E81] hover:bg-[#3730A3] text-indigo-200 text-xs font-semibold border border-indigo-500/30 transition-colors"
          >
            {isSeeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            <span>{isSeeding ? 'Seeding...' : 'Seed Data'}</span>
          </button>

          {/* 📢 SEND NOTIF Button */}
          <button
            onClick={onOpenBroadcast}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[12px] font-extrabold shadow transition-all active:scale-95"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>📢 SEND NOTIF</span>
          </button>

          {/* EXIT Button */}
          <button
            onClick={logoutAdmin}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[12px] font-extrabold shadow transition-all active:scale-95"
            title="Exit Admin Panel"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>EXIT</span>
          </button>
        </div>
      </div>
    </header>
  );
};
