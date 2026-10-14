import React, { useState } from 'react';
import {
  Target,
  Plus,
  Sparkles,
  CheckCircle2,
  Circle,
  Calendar,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { Goal, Category, Task, GoalMilestone } from '../../types';
import { GeminiService } from '../../services/gemini';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface GoalsViewProps {
  goals: Goal[];
  categories: Category[];
  tasks: Task[];
  onSaveGoals: (goals: Goal[]) => void;
  onAddTasks: (newTasks: Partial<Task>[]) => void;
}

export function GoalsView({
  goals,
  categories,
  tasks,
  onSaveGoals,
  onAddTasks,
}: GoalsViewProps) {
  const { showToast } = useToast();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [loadingNudge, setLoadingNudge] = useState<string | null>(null);

  // New goal state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalCategory, setGoalCategory] = useState('cat-ai-research');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalImportance, setGoalImportance] = useState<'core' | 'supporting' | 'aspirational'>('core');
  const [milestonesInput, setMilestonesInput] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const milestones: GoalMilestone[] = milestonesInput
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean)
      .map((m, idx) => ({ id: `m-${Date.now()}-${idx}`, title: m, completed: false }));

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: goalTitle.trim(),
      description: goalDesc.trim(),
      categoryId: goalCategory,
      area: 'work',
      targetDate: goalTargetDate || new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
      progress: 0,
      importance: goalImportance,
      reviewFrequency: 'weekly',
      milestones,
    };

    onSaveGoals([newGoal, ...goals]);
    setShowAddGoal(false);
    setGoalTitle('');
    setGoalDesc('');
    setMilestonesInput('');
    showToast('Goal Created', `Created goal: "${newGoal.title}".`, 'success');
  };

  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    const updated = goals.map((g) => {
      if (g.id !== goalId) return g;
      const updatedMilestones = g.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      const doneCount = updatedMilestones.filter((m) => m.completed).length;
      const progress = updatedMilestones.length > 0 ? Math.round((doneCount / updatedMilestones.length) * 100) : g.progress;
      return { ...g, milestones: updatedMilestones, progress };
    });

    onSaveGoals(updated);
  };

  const handleDeleteGoal = (goalId: string) => {
    onSaveGoals(goals.filter((g) => g.id !== goalId));
    if (selectedGoal?.id === goalId) setSelectedGoal(null);
    showToast('Goal Removed', 'Goal deleted.', 'info');
  };

  // AI next action suggestion
  const handleAIBreakdown = async (goal: Goal) => {
    setLoadingNudge(goal.id);
    try {
      const suggestions = await GeminiService.breakdownGoal(
        goal.title,
        goal.description,
        goal.categoryId,
        60
      );
      if (suggestions && suggestions.length > 0) {
        onAddTasks(suggestions.map((s) => ({ ...s, goalId: goal.id, categoryId: goal.categoryId })));
        showToast('Tasks Created', `DayFlow generated ${suggestions.length} actionable tasks for "${goal.title}".`, 'success');
      } else {
        showToast('Suggestions Generated', 'Review your milestone roadmap.', 'info');
      }
    } catch (e: any) {
      showToast('AI Breakdown', e.message, 'error');
    } finally {
      setLoadingNudge(null);
    }
  };

  const getCat = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs">
        <div>
          <div className="text-[11px] font-semibold text-[#155EEF] uppercase tracking-wider">
            Long-Term Horizons & OKRs
          </div>
          <h2 className="text-xl font-bold text-[#102A56] tracking-tight mt-0.5">Goals & Strategic Projects</h2>
          <p className="text-xs text-[#64748B] mt-0.5">High-leverage ventures broken into clear actionable milestones</p>
        </div>

        <button
          onClick={() => setShowAddGoal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold text-xs active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const cat = getCat(goal.categoryId);
          const relatedTasks = tasks.filter((t) => t.goalId === goal.id);
          const completedTasks = relatedTasks.filter((t) => t.status === 'completed');

          return (
            <div
              key={goal.id}
              className="p-5 rounded-2xl border border-[#DFE7F3] bg-white hover:border-[#155EEF] transition-all flex flex-col justify-between gap-4 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                  <div className="flex items-center gap-2">
                    {cat && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#102A56] border border-[#DFE7F3]">
                        {cat.name}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        goal.importance === 'core'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-[#EEF4FF] text-[#155EEF] border border-blue-200'
                      }`}
                    >
                      {goal.importance}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-[#64748B] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#155EEF]" /> Due {goal.targetDate}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#102A56] tracking-tight">
                  {goal.title}
                </h3>

                {goal.description && (
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    {goal.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-[#64748B]">Progress</span>
                    <span className="font-mono text-[#155EEF] font-bold">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div
                      className="h-full bg-[#155EEF] transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Checklist */}
                {goal.milestones.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#DFE7F3] space-y-2">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Milestones ({goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length}):
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {goal.milestones.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleToggleMilestone(goal.id, m.id)}
                          className="flex items-center gap-2 text-xs p-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                        >
                          {m.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#CBD5E1] shrink-0" />
                          )}
                          <span className={`truncate ${m.completed ? 'line-through text-[#94A3B8]' : 'text-[#102A56]'}`}>
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#DFE7F3] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#64748B]">
                  {relatedTasks.length} linked tasks ({completedTasks.length} done)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1.5 rounded text-[#94A3B8] hover:text-rose-600 cursor-pointer"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleAIBreakdown(goal)}
                    disabled={loadingNudge === goal.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF4FF] border border-[#DFE7F3] text-[#155EEF] font-semibold text-xs hover:bg-[#E0EAFF] transition-all cursor-pointer shadow-xs"
                  >
                    {loadingNudge === goal.id ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>AI Break Down</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      <Modal
        isOpen={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        title="Create Strategic Goal"
        subtitle="Set long-term objectives and break them into milestones"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              required
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g. Ship Autonomous n8n AI Mentoring Pipeline"
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] focus:outline-none focus:border-[#155EEF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                Category
              </label>
              <select
                value={goalCategory}
                onChange={(e) => setGoalCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={goalTargetDate}
                onChange={(e) => setGoalTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56]"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Importance Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['core', 'supporting', 'aspirational'] as const).map((imp) => (
                <button
                  type="button"
                  key={imp}
                  onClick={() => setGoalImportance(imp)}
                  className={`py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
                    goalImportance === imp
                      ? 'bg-[#155EEF] text-white border-[#155EEF] shadow-xs'
                      : 'border-[#DFE7F3] bg-[#F8FAFC] text-[#64748B] hover:text-[#102A56]'
                  }`}
                >
                  {imp}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Description & Motivation
            </label>
            <textarea
              rows={2}
              value={goalDesc}
              onChange={(e) => setGoalDesc(e.target.value)}
              placeholder="Why does this matter? Core vision..."
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Key Milestones (one per line)
            </label>
            <textarea
              rows={3}
              value={milestonesInput}
              onChange={(e) => setMilestonesInput(e.target.value)}
              placeholder="Milestone 1: System prompt & guardrails&#10;Milestone 2: Token throughput benchmark&#10;Milestone 3: Beta test with learners"
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE7F3]">
            <button
              type="button"
              onClick={() => setShowAddGoal(false)}
              className="px-4 py-2 rounded-xl text-[#64748B] hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold transition-all cursor-pointer shadow-xs"
            >
              Save Goal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
