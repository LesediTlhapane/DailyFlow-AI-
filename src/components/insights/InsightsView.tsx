import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Task, Category, Goal, FocusSession, DailyReflection, UserSettings } from '../../types';
import { useToast } from '../common/Toast';

interface InsightsViewProps {
  tasks: Task[];
  categories: Category[];
  goals: Goal[];
  focusSessions: FocusSession[];
  reflections: DailyReflection[];
  settings: UserSettings;
  onSaveReflections: (reflections: DailyReflection[]) => void;
  onUpdateTasks: (tasks: Task[]) => void;
}

export function InsightsView({
  tasks,
  categories,
  goals,
  reflections,
  settings,
  onSaveReflections,
  onUpdateTasks,
}: InsightsViewProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'analytics' | 'reflection' | 'weekly_review'>('analytics');

  // Daily Reflection state
  const [wentWell, setWentWell] = useState('');
  const [wasDifficult, setWasDifficult] = useState('');
  const [needsAttention, setNeedsAttention] = useState('');
  const [energyRating, setEnergyRating] = useState(4);

  // Compute analytics
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');

  const totalActualMinutes = tasks.reduce((s, t) => s + (t.actualMinutesSpent || 0), 0);

  // Category breakdown
  const categoryTimeMap: Record<string, number> = {};
  tasks.forEach((t) => {
    const mins = t.actualMinutesSpent || t.estimatedMinutes || 0;
    categoryTimeMap[t.categoryId] = (categoryTimeMap[t.categoryId] || 0) + mins;
  });

  const totalTrackedCategoryTime = Object.values(categoryTimeMap).reduce((a, b) => a + b, 0) || 1;

  // Estimation accuracy
  const evaluatedTasks = completedTasks.filter((t) => (t.actualMinutesSpent || 0) > 0);
  let estimationAccuracyRatio = 100;
  if (evaluatedTasks.length > 0) {
    const totalEst = evaluatedTasks.reduce((s, t) => s + t.estimatedMinutes, 0);
    const totalAct = evaluatedTasks.reduce((s, t) => s + t.actualMinutesSpent, 0);
    estimationAccuracyRatio = Math.round((Math.min(totalEst, totalAct) / Math.max(totalEst, totalAct)) * 100);
  }

  // Postponed / stalled tasks
  const postponedTasks = tasks.filter((t) => (t.postponeCount || 0) > 0);

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wentWell && !wasDifficult && !needsAttention) return;

    const newReflection: DailyReflection = {
      id: `ref-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      wentWell,
      wasDifficult,
      needsAttentionTomorrow: needsAttention,
      energyLevelRating: energyRating,
      createdAt: new Date().toISOString(),
    };

    onSaveReflections([newReflection, ...reflections]);
    setWentWell('');
    setWasDifficult('');
    setNeedsAttention('');
    showToast('Reflection Saved', 'Daily memory journal updated.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs">
        <div>
          <div className="text-[11px] font-semibold text-[#155EEF] uppercase tracking-wider">
            Review, Retention & Memory
          </div>
          <h2 className="text-xl font-bold text-[#102A56] tracking-tight mt-0.5">Insights & Personal Memory</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Ground-truth telemetry, estimation calibration, and non-punitive reflections
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F1F5F9] border border-[#DFE7F3] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white text-[#155EEF] font-bold shadow-xs'
                : 'text-[#64748B] hover:text-[#102A56]'
            }`}
          >
            Analytics & Memory
          </button>
          <button
            onClick={() => setActiveTab('reflection')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'reflection'
                ? 'bg-white text-[#155EEF] font-bold shadow-xs'
                : 'text-[#64748B] hover:text-[#102A56]'
            }`}
          >
            Daily Reflection
          </button>
          <button
            onClick={() => setActiveTab('weekly_review')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'weekly_review'
                ? 'bg-white text-[#155EEF] font-bold shadow-xs'
                : 'text-[#64748B] hover:text-[#102A56]'
            }`}
          >
            Weekly Review
          </button>
        </div>
      </div>

      {/* 1. ANALYTICS DASHBOARD */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Tasks Completed
              </span>
              <div className="text-2xl font-black font-mono text-[#102A56]">
                {completedTasks.length} <span className="text-xs font-normal text-[#64748B]">tasks</span>
              </div>
              <div className="text-[11px] text-[#0D9488] font-semibold">
                {Math.round((completedTasks.length / (tasks.length || 1)) * 100)}% completion rate
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Focus Time Logged
              </span>
              <div className="text-2xl font-black font-mono text-[#155EEF]">
                {Math.round(totalActualMinutes / 60)}h {totalActualMinutes % 60}m
              </div>
              <div className="text-[11px] text-[#64748B]">Across deep work sessions</div>
            </div>

            <div className="p-4 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Estimation Calibration
              </span>
              <div className="text-2xl font-black font-mono text-[#102A56]">
                {estimationAccuracyRatio}%
              </div>
              <div className="text-[11px] text-[#64748B]">Non-punitive pacing score</div>
            </div>

            <div className="p-4 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Strategic Goals Active
              </span>
              <div className="text-2xl font-black font-mono text-[#102A56]">
                {goals.length}
              </div>
              <div className="text-[11px] text-[#155EEF] font-semibold">
                Avg. {Math.round(goals.reduce((s, g) => s + g.progress, 0) / (goals.length || 1))}% progress
              </div>
            </div>
          </div>

          {/* Time Spent by Category */}
          <div className="p-6 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#102A56] uppercase tracking-wider">
              Time Distribution by Category & Life Area
            </h3>

            <div className="space-y-3">
              {categories
                .filter((c) => (categoryTimeMap[c.id] || 0) > 0)
                .map((cat) => {
                  const mins = categoryTimeMap[cat.id] || 0;
                  const pct = Math.round((mins / totalTrackedCategoryTime) * 100);

                  return (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-semibold text-[#102A56]">{cat.name}</span>
                        </div>
                        <span className="font-mono text-[#64748B] font-semibold">
                          {mins} mins ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Postponed / Rescheduled Tasks Tracker */}
          <div className="p-6 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#102A56] uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Tasks Postponed Multiple Times</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Identifies resistance, oversized scope, or unclear requirements so you can simplify.
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                {postponedTasks.length} flagged
              </span>
            </div>

            {postponedTasks.length === 0 ? (
              <p className="text-xs text-[#64748B] py-4 text-center">
                Zero tasks repeatedly postponed. Execution flow is clean!
              </p>
            ) : (
              <div className="space-y-2 pt-2">
                {postponedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#102A56]">{t.title}</span>
                      <span className="text-rose-600 text-[11px] ml-2 font-mono">
                        Postponed {t.postponeCount} times
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748B]">
                      {t.estimatedMinutes}m est.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DAILY REFLECTION */}
      {activeTab === 'reflection' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reflection Form */}
          <div className="lg:col-span-1 p-6 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#102A56]">End-of-Day Decompression</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                3 simple prompts to clear cognitive residue and plan tomorrow with confidence.
              </p>
            </div>

            <form onSubmit={handleSaveReflection} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                  1. What went well today?
                </label>
                <textarea
                  rows={3}
                  value={wentWell}
                  onChange={(e) => setWentWell(e.target.value)}
                  placeholder="Key wins, momentum, breakthrough insights..."
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] resize-none focus:outline-none focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                  2. What was difficult or draining?
                </label>
                <textarea
                  rows={2}
                  value={wasDifficult}
                  onChange={(e) => setWasDifficult(e.target.value)}
                  placeholder="Distractions, technical blockers, context switches..."
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] resize-none focus:outline-none focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                  3. What needs attention tomorrow?
                </label>
                <textarea
                  rows={2}
                  value={needsAttention}
                  onChange={(e) => setNeedsAttention(e.target.value)}
                  placeholder="Top priority, unblocking colleague, quiet morning..."
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] resize-none focus:outline-none focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                  Energy Rating (1-5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setEnergyRating(lvl)}
                      className={`flex-1 py-1.5 rounded-lg border font-mono font-bold transition-all cursor-pointer ${
                        energyRating === lvl
                          ? 'bg-[#155EEF] text-white border-[#155EEF] shadow-xs'
                          : 'border-[#DFE7F3] bg-[#F8FAFC] text-[#64748B] hover:text-[#102A56]'
                      }`}
                    >
                      {lvl}★
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold transition-all cursor-pointer shadow-xs"
              >
                Save Daily Reflection
              </button>
            </form>
          </div>

          {/* Past Reflection History */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider px-1">
              Historical Reflection Memory ({reflections.length}):
            </h3>

            {reflections.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-[#DFE7F3] bg-white text-xs text-[#64748B]">
                No daily reflections recorded yet. Complete today's prompts to begin your personal memory log.
              </div>
            ) : (
              reflections.map((ref) => (
                <div
                  key={ref.id}
                  className="p-5 rounded-2xl border border-[#DFE7F3] bg-white space-y-3 text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#DFE7F3]">
                    <span className="font-mono font-bold text-[#155EEF]">{ref.date}</span>
                    <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                      {ref.energyLevelRating}/5 Energy
                    </span>
                  </div>

                  {ref.wentWell && (
                    <div>
                      <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider block">
                        Went Well:
                      </span>
                      <p className="text-[#102A56] mt-0.5 leading-relaxed">{ref.wentWell}</p>
                    </div>
                  )}

                  {ref.wasDifficult && (
                    <div>
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                        Friction / Difficulty:
                      </span>
                      <p className="text-[#64748B] mt-0.5 leading-relaxed">{ref.wasDifficult}</p>
                    </div>
                  )}

                  {ref.needsAttentionTomorrow && (
                    <div>
                      <span className="text-[10px] font-bold text-[#155EEF] uppercase tracking-wider block">
                        Focus for Next Day:
                      </span>
                      <p className="text-[#102A56] mt-0.5 leading-relaxed">{ref.needsAttentionTomorrow}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. WEEKLY REVIEW RITUAL */}
      {activeTab === 'weekly_review' && (
        <div className="p-6 rounded-2xl border border-[#DFE7F3] bg-white space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#DFE7F3]">
            <div>
              <h3 className="text-base font-bold text-[#102A56]">End-of-Week Review & Protection Ritual</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Review completed work, consciously decide what moves, and protect weekend rest.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF4FF] text-[#155EEF] border border-blue-200">
              Weekend Policy: {settings.weekendPolicy === 'rest_first' ? 'Protected Rest' : 'Light Projects'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Achievements */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] space-y-3">
              <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Completed Achievements ({completedTasks.length})
              </span>
              <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                {completedTasks.slice(0, 8).map((t) => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-white border border-[#DFE7F3]">
                    <div className="font-semibold text-[#102A56]">{t.title}</div>
                    <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
                      {t.actualMinutesSpent}m spent • Completed
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unfinished Decisions */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] space-y-3">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Unfinished Commitments ({pendingTasks.length})
              </span>
              <p className="text-[11px] text-[#64748B]">
                Unfinished tasks are <strong>never automatically dumped into the weekend</strong>. Choose to move to next week, simplify, or cancel.
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                {pendingTasks.slice(0, 6).map((t) => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-white border border-[#DFE7F3] flex items-center justify-between gap-2">
                    <span className="font-medium text-[#102A56] truncate">{t.title}</span>
                    <button
                      onClick={() => {
                        const updated = tasks.map((item) =>
                          item.id === t.id
                            ? { ...item, scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), postponeCount: (item.postponeCount || 0) + 1 }
                            : item
                        );
                        onUpdateTasks(updated);
                        showToast('Rescheduled', 'Moved to Monday.', 'info');
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#EEF4FF] hover:bg-[#E0EAFF] text-[10px] font-semibold text-[#155EEF] shrink-0 cursor-pointer border border-[#DFE7F3]"
                    >
                      Move to Monday
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
