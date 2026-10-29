import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Clock,
  RotateCw,
  ListOrdered,
  CalendarRange,
  Layers,
  Hourglass,
  Play,
  TrendingUp,
  Flame,
  CheckCircle2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  Task,
  CalendarCommitment,
  Category,
  Goal,
  UserSettings,
  WaitingItem,
  FocusSession,
} from '../../types';
import { TimelineView } from './TimelineView';
import { AgendaView } from './AgendaView';
import { PriorityView } from './PriorityView';
import { QuickTaskAdd } from './QuickTaskAdd';
import { GeminiService } from '../../services/gemini';
import {
  calculateAvailableMinutesBeforeNextCommitment,
  getSmartRecommendation,
} from '../../utils/scoring';
import { PriorityBadge } from '../common/Badge';

interface TodayViewProps {
  tasks: Task[];
  commitments: CalendarCommitment[];
  categories: Category[];
  goals: Goal[];
  waitingItems?: WaitingItem[];
  focusSessions?: FocusSession[];
  settings: UserSettings;
  onSelectTask: (t: Task) => void;
  onAddTask: (t: Partial<Task>) => void;
  onToggleComplete: (t: Task) => void;
  onStartFocus: (t: Task) => void;
  onOpenWhatNow: () => void;
  onOpenReplan: () => void;
  onOpenFocusModal: () => void;
  onNavigateSection?: (section: any) => void;
}

export function TodayView({
  tasks,
  commitments,
  categories,
  goals,
  waitingItems = [],
  focusSessions = [],
  settings,
  onSelectTask,
  onAddTask,
  onToggleComplete,
  onStartFocus,
  onOpenWhatNow,
  onOpenReplan,
  onNavigateSection,
}: TodayViewProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'agenda' | 'priority'>('timeline');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [briefing, setBriefing] = useState<string>('');
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((t) => !t.scheduledDate || t.scheduledDate === todayStr);
  const todayCommitments = commitments.filter((c) => c.date === todayStr);

  const completedCount = todayTasks.filter((t) => t.status === 'completed').length;
  const totalCount = todayTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalMinutesSpent = todayTasks.reduce((sum, t) => sum + (t.actualMinutesSpent || 0), 0);

  // Compute greeting dynamically based on hour
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Next commitment calculation
  const { availableMinutes, nextCommitment } = calculateAvailableMinutesBeforeNextCommitment(
    currentTime,
    todayCommitments,
    settings.workEndTime
  );

  // Active top recommendation for the Intelligence Panel
  const topRecommendation = useMemo(() => {
    return getSmartRecommendation(tasks, commitments, goals, [], settings);
  }, [tasks, commitments, goals, settings]);

  // Load briefing on mount or refresh
  const loadBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const text = await GeminiService.getDailyBriefing({
        userName: settings.name,
        todayTasks,
        commitments: todayCommitments,
        goals,
      });
      setBriefing(text);
    } catch {
      setBriefing(
        `Welcome, ${settings.name}. Prioritize your deep-work windows this morning, protect uninterrupted focus for high-leverage deliverables, and pace cognitive energy.`
      );
    } finally {
      setLoadingBriefing(false);
    }
  };

  useEffect(() => {
    loadBriefing();
  }, [settings.name]);

  const activeWaitingList = waitingItems.filter((w) => !w.resolved).slice(0, 3);

  // Weekly progress calculation (Current Week: Monday to Sunday)
  const weeklyData = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMon);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      const dStr = d.toISOString().slice(0, 10);
      const isToday = dStr === todayStr;

      // Focus minutes on this day from sessions
      const daySessions = focusSessions.filter((s) => s.startedAt?.slice(0, 10) === dStr);
      const focusMins = daySessions.reduce((sum, s) => sum + (s.actualMinutes || 0), 0);

      // Tasks completed on this day
      const tasksDone = tasks.filter((t) => t.completedAt?.slice(0, 10) === dStr).length;

      return {
        day: dayName,
        dateStr: dStr,
        isToday,
        focusMins: focusMins || (isToday ? totalMinutesSpent : 0),
        tasksDone,
      };
    });

    const totalWeeklyFocusMins = days.reduce((sum, d) => sum + d.focusMins, 0);
    const totalWeeklyTasksDone = tasks.filter((t) => {
      if (!t.completedAt) return false;
      const monStr = monday.toISOString().slice(0, 10);
      const sun = new Date(monday);
      sun.setDate(monday.getDate() + 6);
      const sunStr = sun.toISOString().slice(0, 10);
      return t.completedAt.slice(0, 10) >= monStr && t.completedAt.slice(0, 10) <= sunStr;
    }).length;

    // Target: 20 hours (1200 mins)
    const weeklyTargetMins = 1200;
    const weeklyPercent = Math.min(100, Math.round((totalWeeklyFocusMins / weeklyTargetMins) * 100));

    return {
      days,
      totalWeeklyFocusMins,
      totalWeeklyTasksDone,
      weeklyPercent,
    };
  }, [focusSessions, tasks, todayStr, totalMinutesSpent]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* ======================================================== */}
      {/* ZONE 2: CENTRAL DAILY COMMAND CENTRE (Span 8 cols on XL)  */}
      {/* ======================================================== */}
      <div className="xl:col-span-8 space-y-6">
        {/* Refined Greeting & AI Briefing Card */}
        <div className="p-6 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold text-[#155EEF] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#155EEF]" />
                <span>Executive Daily Briefing</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#102A56] tracking-tight mt-1">
                {getGreeting()}, {settings.name}
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                {currentTime.toLocaleDateString([], {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                • {settings.roleContext}
              </p>
            </div>

            <button
              onClick={loadBriefing}
              disabled={loadingBriefing}
              className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DFE7F3] bg-[#F8FAFC] hover:bg-[#EEF4FF] text-xs font-semibold text-[#102A56] transition-colors cursor-pointer"
              title="Refresh AI briefing"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#155EEF] ${loadingBriefing ? 'animate-spin' : ''}`} />
              <span>Refresh Brief</span>
            </button>
          </div>

          {/* AI Briefing Message */}
          <div className="p-4 rounded-xl bg-[#EEF4FF] border border-[#DFE7F3] text-[#102A56] text-xs sm:text-sm font-medium leading-relaxed">
            {loadingBriefing ? (
              <span className="inline-flex items-center gap-2 text-[#64748B]">
                <RotateCw className="w-3.5 h-3.5 animate-spin text-[#155EEF]" />
                Synthesizing daily priority briefing...
              </span>
            ) : (
              briefing
            )}
          </div>

          {/* Compact 4-Metric Indicators Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* 1. Next Commitment */}
            <div className="p-3 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC]">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Next Commitment
              </span>
              <div className="text-xs font-bold text-[#102A56] truncate mt-1">
                {nextCommitment ? (
                  <span title={`${nextCommitment.title} at ${nextCommitment.startTime}`}>
                    {nextCommitment.startTime} • {nextCommitment.title}
                  </span>
                ) : (
                  'No upcoming events'
                )}
              </div>
            </div>

            {/* 2. Available Window */}
            <div className="p-3 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC]">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Available Window
              </span>
              <div className="text-xs font-bold text-[#155EEF] mt-1 font-mono">
                {availableMinutes} mins free
              </div>
            </div>

            {/* 3. Focus Time Tracked */}
            <div className="p-3 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC]">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Focus Time Logged
              </span>
              <div className="text-xs font-bold text-[#102A56] mt-1 font-mono">
                {totalMinutesSpent} mins
              </div>
            </div>

            {/* 4. Task Progress */}
            <div className="p-3 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC]">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                <span>Task Progress</span>
                <span className="text-[#0D9488] font-mono">{completedCount}/{totalCount} ({progressPercent}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#0D9488] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Bar */}
        <QuickTaskAdd categories={categories} onAddTask={onAddTask} defaultDate={todayStr} />

        {/* Schedule Header & View Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#102A56] dark:text-zinc-100">Today's Schedule</h2>
            <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-full bg-orange-500/10 dark:bg-orange-500/15 text-[#EA580C] dark:text-orange-400 border border-orange-500/20 dark:border-orange-500/30">
              {todayTasks.filter((t) => t.status !== 'completed').length} pending
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F1F5F9] dark:bg-[#181C26] border border-[#DFE7F3] dark:border-[#262C38] text-xs font-semibold">
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-[#EA580C] text-white font-bold shadow-xs'
                    : 'text-[#64748B] dark:text-zinc-400 hover:text-[#102A56] dark:hover:text-white'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>

              <button
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-[#EA580C] text-white font-bold shadow-xs'
                    : 'text-[#64748B] dark:text-zinc-400 hover:text-[#102A56] dark:hover:text-white'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Agenda</span>
              </button>

              <button
                onClick={() => setViewMode('priority')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'priority'
                    ? 'bg-[#EA580C] text-white font-bold shadow-xs'
                    : 'text-[#64748B] dark:text-zinc-400 hover:text-[#102A56] dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Priority</span>
              </button>
            </div>

            {/* Replan Day Button */}
            <button
              onClick={onOpenReplan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DFE7F3] dark:border-[#262C38] bg-white dark:bg-[#181C26] hover:bg-[#F8FAFC] dark:hover:bg-[#202533] text-xs font-semibold text-[#102A56] dark:text-zinc-200 transition-colors cursor-pointer"
              title="Rebalance today's timeline"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#EA580C]" />
              <span className="hidden sm:inline">Replan Day</span>
            </button>
          </div>
        </div>

        {/* Active Schedule View */}
        {viewMode === 'timeline' && (
          <TimelineView
            tasks={todayTasks}
            commitments={todayCommitments}
            categories={categories}
            currentTime={currentTime}
            onSelectTask={onSelectTask}
            onStartFocus={onStartFocus}
            onToggleComplete={onToggleComplete}
          />
        )}

        {viewMode === 'agenda' && (
          <AgendaView
            tasks={todayTasks}
            categories={categories}
            onSelectTask={onSelectTask}
            onStartFocus={onStartFocus}
            onToggleComplete={onToggleComplete}
          />
        )}

        {viewMode === 'priority' && (
          <PriorityView
            tasks={todayTasks}
            categories={categories}
            onSelectTask={onSelectTask}
            onStartFocus={onStartFocus}
            onToggleComplete={onToggleComplete}
          />
        )}
      </div>

      {/* ======================================================== */}
      {/* ZONE 3: AI INTELLIGENCE PANEL (Span 4 cols on XL)         */}
      {/* ======================================================== */}
      <div className="xl:col-span-4 space-y-5">
        {/* 1. Prominent "Recommended Next" Card */}
        <div className="p-5 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE7F3]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#EEF4FF] text-[#155EEF] flex items-center justify-center font-bold">
                <Sparkles className="w-3.5 h-3.5 fill-[#155EEF]/20" />
              </div>
              <span className="text-xs font-bold text-[#102A56] uppercase tracking-wider">
                Recommended Next
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF4FF] text-[#155EEF]">
              Confidence {topRecommendation?.score || 90}%
            </span>
          </div>

          {topRecommendation ? (
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <PriorityBadge priority={topRecommendation.task.priority} />
                  <span className="text-[11px] font-mono text-[#64748B]">
                    {topRecommendation.suggestedDuration} mins
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#102A56] leading-snug">
                  {topRecommendation.task.title}
                </h3>
              </div>

              {/* Rationale & Expected outcome */}
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Why it is recommended:
                  </span>
                  <p className="text-[#102A56] text-[11px] font-medium leading-relaxed mt-0.5">
                    {topRecommendation.reason}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Expected outcome:
                  </span>
                  <p className="text-[#64748B] text-[11px] leading-relaxed mt-0.5">
                    {topRecommendation.expectedOutcome}
                  </p>
                </div>
              </div>

              {/* Primary Focus Button */}
              <button
                onClick={() => onStartFocus(topRecommendation.task)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Focus Session ({topRecommendation.suggestedDuration}m)</span>
              </button>

              <button
                onClick={onOpenWhatNow}
                className="w-full text-center text-[11px] font-semibold text-[#155EEF] hover:underline cursor-pointer pt-1"
              >
                Inspect scoring breakdown & alternatives →
              </button>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[#64748B] dark:text-zinc-400 space-y-1.5">
              <div className="font-semibold text-[#102A56] dark:text-zinc-200">
                {todayTasks.length === 0
                  ? 'No tasks queued for today yet'
                  : 'All scheduled tasks completed. Great job!'}
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-zinc-400">
                {todayTasks.length === 0
                  ? 'Add your first task above or ask AI Chief of Staff to structure your day.'
                  : 'Take a break or review your goals for tomorrow.'}
              </p>
            </div>
          )}
        </div>

        {/* 2. Compact Weekly Progress Visualisation */}
        <div className="p-5 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE7F3]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#EEF4FF] text-[#155EEF] flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[#102A56] uppercase tracking-wider">
                Weekly Momentum
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>5-Day Streak</span>
            </div>
          </div>

          {/* Weekly Summary Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
                Focus Logged
              </span>
              <span className="text-sm font-bold text-[#155EEF] font-mono mt-0.5 block">
                {(weeklyData.totalWeeklyFocusMins / 60).toFixed(1)}h / 20h
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
                Tasks Completed
              </span>
              <span className="text-sm font-bold text-[#102A56] font-mono mt-0.5 block">
                {weeklyData.totalWeeklyTasksDone} done
              </span>
            </div>
          </div>

          {/* Days Mon-Sun Bar Visualization */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] text-[#64748B] font-semibold">
              <span>Daily Focus Activity</span>
              <span className="font-mono text-[#155EEF]">{weeklyData.weeklyPercent}% weekly target</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 items-end pt-2 pb-1">
              {weeklyData.days.map((d) => {
                // Height based on focus mins, max scale 180m
                const heightPercent = Math.min(100, Math.max(14, Math.round((d.focusMins / 180) * 100)));
                return (
                  <div key={d.day} className="flex flex-col items-center gap-1">
                    <div className="w-full h-14 bg-[#F1F5F9] rounded-md flex items-end justify-center p-0.5 overflow-hidden">
                      <div
                        className={`w-full rounded-sm transition-all duration-300 ${
                          d.isToday
                            ? 'bg-[#155EEF]'
                            : d.focusMins > 0
                            ? 'bg-[#155EEF]/50'
                            : 'bg-transparent'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                        title={`${d.day}: ${d.focusMins}m focus`}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-semibold ${
                        d.isToday ? 'text-[#155EEF] font-bold' : 'text-[#64748B]'
                      }`}
                    >
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Waiting for Input Follow-up Card */}
        <div className="p-5 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE7F3]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <Hourglass className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[#102A56] uppercase tracking-wider">
                Waiting on Input ({activeWaitingList.length})
              </span>
            </div>
            {onNavigateSection && (
              <button
                onClick={() => onNavigateSection('waiting')}
                className="text-[11px] font-semibold text-[#155EEF] hover:underline cursor-pointer"
              >
                View all
              </button>
            )}
          </div>

          {activeWaitingList.length === 0 ? (
            <p className="text-xs text-[#64748B] py-2">
              No pending blockers. You are free to proceed independently!
            </p>
          ) : (
            <div className="space-y-2.5">
              {activeWaitingList.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                    <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      On: {item.waitingOn}
                    </span>
                    <span className="font-mono">Follow up: {item.expectedFollowUp}</span>
                  </div>
                  <div className="font-semibold text-[#102A56] truncate mt-1">
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
