import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Bot,
  Target,
  BarChart3,
  Settings,
  Hourglass,
} from 'lucide-react';
import { UserSettings } from '../../types';
import dayflowLogo from '../../assets/dayflow.jpg';

export type NavSection =
  | 'today'
  | 'calendar'
  | 'tasks'
  | 'waiting'
  | 'companion'
  | 'goals'
  | 'insights'
  | 'settings';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  pendingTasksCount: number;
  waitingCount: number;
  activeGoalsCount: number;
  settings?: UserSettings;
}

export function Sidebar({
  currentSection,
  onSelectSection,
  pendingTasksCount,
  waitingCount,
  activeGoalsCount,
  settings,
}: SidebarProps) {
  const navItems = [
    {
      id: 'today' as NavSection,
      label: 'Today',
      icon: LayoutDashboard,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'calendar' as NavSection,
      label: 'Calendar',
      icon: CalendarDays,
    },
    {
      id: 'tasks' as NavSection,
      label: 'Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'waiting' as NavSection,
      label: 'Waiting & Backlog',
      icon: Hourglass,
      badge: waitingCount > 0 ? waitingCount : undefined,
      badgeColor: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-600/30',
    },
    {
      id: 'companion' as NavSection,
      label: 'AI Companion',
      icon: Bot,
      highlight: true,
    },
    {
      id: 'goals' as NavSection,
      label: 'Goals & Projects',
      icon: Target,
      badge: activeGoalsCount > 0 ? activeGoalsCount : undefined,
    },
    {
      id: 'insights' as NavSection,
      label: 'Insights & Review',
      icon: BarChart3,
    },
    {
      id: 'settings' as NavSection,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-[#E2E8F0] dark:border-[#262c37] bg-white/95 dark:bg-[#12151c]/90 backdrop-blur-md min-h-screen transition-colors z-20">
      {/* Brand Header with dayflow.jpg Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E2E8F0] dark:border-[#262c37]">
        <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-orange-500/40 shadow-sm shrink-0 bg-zinc-100 dark:bg-zinc-900">
          <img
            src={dayflowLogo}
            alt="DayFlow AI Logo"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            DayFlow AI
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 dark:border-orange-500/30">
              PRO
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-none mt-0.5">
            AI Chief of Staff
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/30 shadow-xs dark:shadow-[0_0_12px_rgba(249,115,22,0.12)]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-[#1a1e27] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                      : item.badgeColor || 'bg-zinc-100 dark:bg-[#1e232e] text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-[#2b3240]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Operating Identity Footer */}
      <div
        onClick={() => onSelectSection('settings')}
        className="p-3 border-t border-[#E2E8F0] dark:border-[#262c37] m-2 rounded-xl bg-zinc-50 dark:bg-[#171a22] hover:bg-orange-500/5 dark:hover:bg-[#1e232e] border border-zinc-200/80 dark:border-zinc-800/60 transition-all cursor-pointer group"
        title="Account & Operating Preferences"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-300 flex items-center justify-center font-bold text-xs shrink-0 group-hover:border-orange-500/50 transition-colors">
            {settings?.name?.slice(0, 2).toUpperCase() || 'LS'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors truncate">
              {settings?.name || 'Lesedi'}
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operating System
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-500 transition-colors" />
        </div>
      </div>
    </aside>
  );
}
