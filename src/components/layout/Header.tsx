import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Moon,
  Sun,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
  LogIn,
} from 'lucide-react';
import { UserSettings, FocusSession } from '../../types';
import { NOTIFICATION_RESTRICTION_NOTE } from '../../utils/notifications';
import { useAuth } from '../../context/AuthContext';
import dayflowLogo from '../../assets/dayflow.jpg';

interface HeaderProps {
  settings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
  onOpenWhatNow: () => void;
  onOpenQuickAdd: () => void;
  onOpenFocusModal: () => void;
  onOpenProfileModal: () => void;
  onOpenCoverPage?: () => void;
  activeFocusSession: FocusSession | null;
  focusSecondsRemaining: number | null;
  unreadCount?: number;
}

export function Header({
  settings,
  onUpdateSettings,
  onOpenWhatNow,
  onOpenQuickAdd,
  onOpenFocusModal,
  onOpenProfileModal,
  onOpenCoverPage,
  activeFocusSession,
  focusSecondsRemaining,
}: HeaderProps) {
  const { currentUser, userProfile, openAuthModal } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClock = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    if (newTheme === 'dark') {
      localStorage.removeItem('dayflow_explicit_light');
      localStorage.setItem('dayflow_explicit_dark', 'true');
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      localStorage.setItem('dayflow_explicit_light', 'true');
      localStorage.removeItem('dayflow_explicit_dark');
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    onUpdateSettings({ ...settings, theme: newTheme });
  };

  // Format focus countdown mm:ss
  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const userInitials = (userProfile?.displayName || currentUser?.email || 'User')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3 border-b border-[#E2E8F0] dark:border-[#262c37] bg-white/95 dark:bg-[#12151c]/90 backdrop-blur-md transition-colors">
      {/* Left: Mobile Brand & Live Clock */}
      <div className="flex items-center gap-3">
        {/* Mobile Logo Branding */}
        <div className="md:hidden flex items-center gap-2 pr-1 border-r border-[#E2E8F0] dark:border-[#262c37]">
          <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-orange-500/40 shrink-0">
            <img src={dayflowLogo} alt="DayFlow Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-xs tracking-tight text-zinc-900 dark:text-zinc-100 hidden sm:inline">
            DayFlow
          </span>
        </div>

        {/* Live Clock & Date */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#2b313d] bg-zinc-50 dark:bg-[#171a22]">
          <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
          <span className="font-mono font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-100">
            {formatClock(currentTime)}
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 border-l border-[#E2E8F0] dark:border-[#2b313d] pl-2 hidden sm:inline font-medium">
            {formatDate(currentTime)}
          </span>
        </div>

        {/* Active Focus Session Banner with Fire Orange Pulse */}
        {activeFocusSession && focusSecondsRemaining !== null && (
          <button
            onClick={onOpenFocusModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/30 text-orange-700 dark:text-orange-300 hover:bg-orange-500/20 dark:hover:bg-orange-500/25 transition-all text-xs font-medium cursor-pointer shadow-xs dark:shadow-[0_0_12px_rgba(249,115,22,0.15)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="hidden md:inline font-semibold text-orange-800 dark:text-orange-200">Focus:</span>
            <span className="max-w-[130px] truncate">{activeFocusSession.taskTitle}</span>
            <span className="font-mono bg-white dark:bg-[#12151c] px-1.5 py-0.5 rounded text-[11px] font-bold border border-orange-500/30 text-orange-600 dark:text-orange-300">
              {formatCountdown(focusSecondsRemaining)}
            </span>
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Fire Orange "What should I do now?" Action */}
        <button
          onClick={onOpenWhatNow}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-sm hover:shadow-md active:scale-98 transition-all cursor-pointer border border-orange-400/20"
        >
          <Sparkles className="w-4 h-4 fill-white/20 text-orange-100" />
          <span className="hidden sm:inline">What should I do now?</span>
          <span className="sm:hidden font-bold">Decide</span>
        </button>

        {/* Quick Add Task */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-[#E2E8F0] dark:border-[#2b313d] bg-white dark:bg-[#171a22] hover:bg-zinc-50 dark:hover:bg-[#202531] text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <span className="hidden md:inline">Quick Add</span>
        </button>

        {/* Notification Center Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg border border-[#E2E8F0] dark:border-[#2b313d] bg-white dark:bg-[#171a22] hover:bg-zinc-50 dark:hover:bg-[#202531] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer relative shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#E2E8F0] dark:border-[#2f3644] bg-white dark:bg-[#161a22] shadow-xl dark:shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#262c37]">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
                  Reminders & Follow-through
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Close
                </button>
              </div>

              <div className="py-3 flex flex-col gap-2.5 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/25">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">Daily Focus Ritual Active</div>
                    <div className="text-zinc-600 dark:text-zinc-400 text-[11px] mt-0.5">
                      Your scheduled check-ins and break prompts will chime in-app.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-900 dark:text-amber-200 text-[11px]">System Limitation Notice</div>
                    <div className="text-amber-800 dark:text-amber-300/80 text-[11px] mt-0.5 leading-relaxed">
                      {NOTIFICATION_RESTRICTION_NOTE}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cover Page Link */}
        {onOpenCoverPage && (
          <button
            onClick={onOpenCoverPage}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#2b313d] bg-white dark:bg-[#171a22] hover:bg-zinc-50 dark:hover:bg-[#202531] text-zinc-600 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all cursor-pointer shadow-xs text-xs font-medium"
            title="View Liquid-Glass DailyFlow AI Cover Page"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden lg:inline">Cover Page</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-[#E2E8F0] dark:border-[#2b313d] bg-white dark:bg-[#171a22] hover:bg-zinc-50 dark:hover:bg-[#202531] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer shadow-xs"
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-orange-600" />
          )}
        </button>

        {/* User Account / Profile Button */}
        {currentUser ? (
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-zinc-200 dark:border-[#2b313d] bg-white dark:bg-[#171a22] hover:bg-orange-500/5 dark:hover:bg-[#202531] text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer shadow-xs group"
            title="Account & Memory Profile"
          >
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="w-6 h-6 rounded-lg object-cover ring-1 ring-orange-500/40"
              />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-[10px] ring-1 ring-orange-500/30">
                {userInitials}
              </div>
            )}
            <span className="text-xs font-semibold max-w-[100px] truncate hidden sm:inline">
              {userProfile?.displayName || currentUser.email?.split('@')[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={openAuthModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 transition-all cursor-pointer shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
