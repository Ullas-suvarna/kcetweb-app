import React from 'react';
import { 
  HelpCircle, 
  Layers, 
  Users2, 
  FileText, 
  CalendarDays, 
  TrendingUp, 
  Megaphone, 
  GraduationCap, 
  PhoneCall, 
  Receipt, 
  Building2, 
  Compass 
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';

export interface TabItem {
  id: string;
  name: string;
  shortName?: string;
  icon: React.ElementType;
  badge: number | string;
  isWarningBadge?: boolean;
}

interface TabBarProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onSelectTab }) => {
  const {
    questions,
    testSeries,
    mentors,
    bookings,
    resources,
    dates,
    rankTiers,
    announcements,
    students,
    helplines,
    receipts,
    colleges,
    branches
  } = useAdminData();

  const pendingReceiptsCount = receipts.filter(r => r.status === 'UNDER_VERIFICATION').length;

  const tabs: TabItem[] = [
    { id: 'questions', name: 'Questions', icon: HelpCircle, badge: questions.length },
    { id: 'test-series', name: 'Test Series', icon: Layers, badge: testSeries.length },
    { id: 'mentors', name: 'Mentors & Chat', icon: Users2, badge: `${mentors.length} • ${bookings.length}` },
    { id: 'resources', name: 'Resources & Links', icon: FileText, badge: resources.length },
    { id: 'dates', name: 'Dates', icon: CalendarDays, badge: dates.length },
    { id: 'rank-marks', name: 'Rank vs Marks', icon: TrendingUp, badge: rankTiers.length },
    { id: 'announcements', name: 'Announce & Push', icon: Megaphone, badge: announcements.length },
    { id: 'students', name: 'Students', icon: GraduationCap, badge: students.length },
    { id: 'helplines', name: 'Helplines', icon: PhoneCall, badge: helplines.length },
    { 
      id: 'receipts', 
      name: 'Receipts', 
      icon: Receipt, 
      badge: pendingReceiptsCount > 0 ? `${pendingReceiptsCount} Pending` : `${receipts.length}`, 
      isWarningBadge: pendingReceiptsCount > 0 
    },
    { id: 'colleges', name: 'Colleges & Cutoffs', icon: Building2, badge: colleges.length },
    { id: 'branches', name: 'Branch Explorer', icon: Compass, badge: branches.length }
  ];

  return (
    <div className="bg-[#312E81] border-b border-[#1E1B4B] sticky top-[57px] z-30 shadow-inner">
      <div className="max-w-7xl mx-auto overflow-x-auto dark-scrollbar flex items-center px-2 py-1.5 gap-1.5 no-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold whitespace-nowrap transition-all duration-150 shrink-0 ${
                isActive
                  ? 'bg-white text-[#1E1B4B] shadow-md scale-[1.02]'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-700/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#4F46E5]' : 'text-indigo-300'}`} />
              <span>{tab.name}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab.isWarningBadge
                    ? 'bg-amber-400 text-amber-950 font-black animate-pulse'
                    : isActive
                    ? 'bg-[#EEF2FF] text-[#4F46E5]'
                    : 'bg-[#1E1B4B]/70 text-indigo-200'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
