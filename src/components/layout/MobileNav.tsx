import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Bot,
  Hourglass,
  Target,
  BarChart3,
  Settings,
} from 'lucide-react';
import { NavSection } from './Sidebar';

interface MobileNavProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  pendingCount: number;
}

export function MobileNav({
  currentSection,
  onSelectSection,
  pendingCount,
}: MobileNavProps) {
  const tabs = [
    { id: 'today' as NavSection, label: 'Today', icon: LayoutDashboard },
    { id: 'calendar' as NavSection, label: 'Calendar', icon: CalendarDays },
    { id: 'tasks' as NavSection, label: 'Tasks', icon: CheckSquare, badge: pendingCount },
    { id: 'waiting' as NavSection, label: 'Waiting', icon: Hourglass },
    { id: 'companion' as NavSection, label: 'AI', icon: Bot },
    { id: 'goals' as NavSection, label: 'Goals', icon: Target },
    { id: 'insights' as NavSection, label: 'Insights', icon: BarChart3 },
    { id: 'settings' as NavSection, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#E2E8F0] dark:border-[#262c37] bg-white/95 dark:bg-[#12151c]/95 backdrop-blur-md overflow-x-auto shadow-lg dark:shadow-2xl">
      <div className="flex items-center justify-around py-2 px-1 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectSection(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors relative cursor-pointer ${
                isActive
                  ? 'text-orange-600 dark:text-orange-400 font-bold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 transition-colors ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]"></span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
