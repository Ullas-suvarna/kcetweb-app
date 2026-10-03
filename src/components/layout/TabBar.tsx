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
  icon?: React.ElementType;
  badge: number | string;
  isPendingYellow?: boolean;
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
    notifications,
    students,
    helplines,
    receipts,
    colleges,
    branches
  } = useAdminData();

  const pendingReceiptsCount = receipts.filter(r => r.status === 'UNDER_VERIFICATION').length;

  const tabs: TabItem[] = [
    { 
      id: 'questions', 
      name: 'Questions', 
      badge: questions.length 
    },
    { 
      id: 'test-series', 
      name: '🏆 Test Series', 
      badge: testSeries.length 
    },
    { 
      id: 'mentors', 
      name: '💬 Mentors & Chat', 
      badge: `${mentors.length} M • ${bookings.length} B` 
    },
    { 
      id: 'resources', 
      name: '🔗 Resources & Links', 
      badge: resources.length 
    },
    { 
      id: 'dates', 
      name: 'Dates', 
      badge: dates.length 
    },
    { 
      id: 'rank-marks', 
      name: 'Rank vs Marks', 
      badge: rankTiers.length 
    },
    { 
      id: 'announcements', 
      name: '📢 Announce & Push', 
      badge: announcements.length + notifications.length 
    },
    { 
      id: 'students', 
      name: '👨‍🎓 Students', 
      badge: students.length 
    },
    { 
      id: 'helplines', 
      name: '📞 Helplines', 
      badge: helplines.length 
    },
    { 
      id: 'receipts', 
      name: '💳 Receipts', 
      badge: pendingReceiptsCount > 0 ? `${pendingReceiptsCount} PENDING` : `${receipts.length}`, 
      isPendingYellow: pendingReceiptsCount > 0 
    },
    { 
      id: 'colleges', 
      name: '🏛️ Colleges & Cutoffs', 
      badge: colleges.length 
    },
    { 
      id: 'branches', 
      name: '🔬 Branch Explorer', 
      badge: branches.length 
    }
  ];

  return (
    <div className="bg-[#312E81] border-b border-[#1E1B4B] sticky top-[57px] z-30 shadow-inner">
      <div className="max-w-7xl mx-auto overflow-x-auto dark-scrollbar flex items-center px-2 py-1.5 gap-1.5 no-wrap">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-bold whitespace-nowrap transition-all duration-150 shrink-0 ${
                isActive
                  ? 'bg-white text-[#1E1B4B] shadow-md scale-[1.02]'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-700/40'
              }`}
            >
              <span>{tab.name}</span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full transition-all ${
                  tab.isPendingYellow
                    ? 'bg-[#FCD34D] text-[#78350F] shadow-sm animate-pulse'
                    : isActive
                    ? 'bg-[#EEF2FF] text-[#4F46E5]'
                    : 'bg-[#1E1B4B]/80 text-indigo-200'
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
