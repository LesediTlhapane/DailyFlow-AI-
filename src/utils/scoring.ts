import {
  Task,
  CalendarCommitment,
  Goal,
  OpportunityBacklogItem,
  UserSettings,
  RecommendationResult,
} from '../types';

export interface RecommendationOptions {
  currentTime?: Date;
  energyLevel?: 'high' | 'medium' | 'low';
  preferredArea?: string;
}

export function parseMinutesFromTimeString(timeStr: string): number {
  const [h, m] = timeStr.split(':').map((x) => parseInt(x, 10));
  return (h || 0) * 60 + (m || 0);
}

export function formatMinutesToTimeString(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(23 * 60 + 59, Math.round(totalMinutes)));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function calculateAvailableMinutesBeforeNextCommitment(
  now: Date,
  commitments: CalendarCommitment[],
  workEndTimeStr: string
): { availableMinutes: number; nextCommitment?: CalendarCommitment } {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;

  // Filter today's future fixed commitments or scheduled items
  const upcoming = commitments
    .filter((c) => c.date === todayStr && parseMinutesFromTimeString(c.startTime) > currentMinutes)
    .sort((a, b) => parseMinutesFromTimeString(a.startTime) - parseMinutesFromTimeString(b.startTime));

  if (upcoming.length > 0) {
    const next = upcoming[0];
    const diff = parseMinutesFromTimeString(next.startTime) - currentMinutes;
    return { availableMinutes: Math.max(5, diff), nextCommitment: next };
  }

  // If no upcoming commitment, compute time until work end or end of day
  const workEndMin = parseMinutesFromTimeString(workEndTimeStr || '18:00');
  if (currentMinutes < workEndMin) {
    return { availableMinutes: Math.max(15, workEndMin - currentMinutes) };
  }

  return { availableMinutes: 120 }; // Evening free buffer
}

export function scoreTaskForRecommendation(
  task: Task,
  availableMinutes: number,
  energyLevel: 'high' | 'medium' | 'low' = 'medium',
  activeGoals: Goal[],
  settings: UserSettings
): { totalScore: number; breakdown: { factor: string; weight: string; score: number }[]; reason: string } {
  const breakdown: { factor: string; weight: string; score: number }[] = [];
  let totalScore = 0;

  // 1. Available Time Window Fit (Max 35 points)
  // Perfectly fits window without overrun
  let timeScore = 0;
  if (task.estimatedMinutes <= availableMinutes) {
    // bonus if it makes good use of available time
    const ratio = task.estimatedMinutes / availableMinutes;
    if (ratio >= 0.6 && ratio <= 1.0) {
      timeScore = 35; // Perfect fit
    } else if (ratio >= 0.3) {
      timeScore = 28;
    } else {
      timeScore = 20; // Quick task
    }
  } else {
    // Task is longer than current available window before next meeting
    timeScore = Math.max(5, 30 - (task.estimatedMinutes - availableMinutes) * 0.8);
  }
  breakdown.push({
    factor: `Fits available ${availableMinutes}m window (${task.estimatedMinutes}m est.)`,
    weight: '35 max',
    score: Math.round(timeScore),
  });
  totalScore += timeScore;

  // 2. Priority & Deadline Urgency (Max 30 points)
  let priorityScore = 10;
  if (task.priority === 'critical') priorityScore = 30;
  else if (task.priority === 'high') priorityScore = 22;
  else if (task.priority === 'normal') priorityScore = 14;
  else priorityScore = 8;

  if (task.deadline) {
    const today = new Date().toISOString().slice(0, 10);
    if (task.deadline <= today) {
      priorityScore = Math.min(30, priorityScore + 10);
    }
  }
  breakdown.push({
    factor: `Priority (${task.priority}) & deadline status`,
    weight: '30 max',
    score: Math.round(priorityScore),
  });
  totalScore += priorityScore;

  // 3. Independent Execution capability (Max 20 points)
  // If not waiting on anyone and isIndependent
  let independenceScore = 0;
  if (task.status === 'blocked' || task.status === 'waiting') {
    independenceScore = -50; // Ineligible
  } else if (task.isIndependent) {
    independenceScore = 20;
  } else {
    independenceScore = 8;
  }
  breakdown.push({
    factor: task.isIndependent ? '100% Independent (no external blocker)' : 'Requires collaboration',
    weight: '20 max',
    score: Math.round(independenceScore),
  });
  totalScore += independenceScore;

  // 4. Energy Match (Max 15 points)
  let energyScore = 10;
  const isDeepCategory = ['cat-ai-research', 'cat-dev', 'cat-learning'].includes(task.categoryId);
  if (energyLevel === 'high') {
    energyScore = isDeepCategory ? 15 : 8;
  } else if (energyLevel === 'low') {
    energyScore = !isDeepCategory || task.estimatedMinutes <= 25 ? 15 : 4;
  } else {
    energyScore = 12;
  }
  breakdown.push({
    factor: `Energy level fit (${energyLevel} energy)`,
    weight: '15 max',
    score: Math.round(energyScore),
  });
  totalScore += energyScore;

  // 5. Active Goal Alignment (Max 10 points)
  let goalScore = 0;
  if (task.goalId) {
    const matchedGoal = activeGoals.find((g) => g.id === task.goalId);
    if (matchedGoal) {
      goalScore = matchedGoal.importance === 'core' ? 10 : 6;
    }
  }
  if (goalScore > 0) {
    breakdown.push({
      factor: 'Directly advances active core goal',
      weight: '10 max',
      score: goalScore,
    });
    totalScore += goalScore;
  }

  // 6. Procrastination / Postpone Nudge (+5 points)
  if (task.postponeCount && task.postponeCount > 0) {
    const nudge = Math.min(6, task.postponeCount * 2);
    breakdown.push({
      factor: `Previously postponed ${task.postponeCount}x (proactive nudge)`,
      weight: '+6 bonus',
      score: nudge,
    });
    totalScore += nudge;
  }

  // 7. Status Bonus
  if (task.status === 'in_progress') {
    totalScore += 15;
    breakdown.push({
      factor: 'Already in progress (finish momentum)',
      weight: '+15 bonus',
      score: 15,
    });
  }

  // Synthesize concise reason
  let reason = '';
  if (task.status === 'in_progress') {
    reason = `You have already commenced this task. Continuing now will preserve your context and complete it before the next break.`;
  } else if (task.estimatedMinutes <= availableMinutes && task.priority === 'critical') {
    reason = `Critical priority task with a deadline that fits comfortably within your next ${availableMinutes}-minute available block.`;
  } else if (task.isIndependent && task.estimatedMinutes <= availableMinutes) {
    reason = `Can be completed 100% independently in ${task.estimatedMinutes} minutes without waiting on anyone.`;
  } else if (energyLevel === 'low' && task.estimatedMinutes <= 25) {
    reason = `Low-friction quick win that keeps momentum alive without draining energy.`;
  } else {
    reason = `High-value task aligned with your active priorities, fitting your available window.`;
  }

  return { totalScore, breakdown, reason };
}

export function getSmartRecommendation(
  tasks: Task[],
  commitments: CalendarCommitment[],
  goals: Goal[],
  backlog: OpportunityBacklogItem[],
  settings: UserSettings,
  options: RecommendationOptions = {}
): RecommendationResult | null {
  const now = options.currentTime || new Date();
  const energy = options.energyLevel || 'medium';

  const { availableMinutes, nextCommitment } = calculateAvailableMinutesBeforeNextCommitment(
    now,
    commitments,
    settings.workEndTime
  );

  // Filter tasks eligible for doing right now
  const eligibleTasks = tasks.filter((t) => {
    if (t.status === 'completed' || t.status === 'cancelled' || t.status === 'blocked') {
      return false;
    }
    return true;
  });

  if (eligibleTasks.length === 0) {
    // If no eligible tasks, pick from opportunity backlog!
    if (backlog.length > 0) {
      const topOpp = backlog.find((b) => b.status === 'backlog') || backlog[0];
      const fallbackTask: Task = {
        id: `backlog-promoted-${topOpp.id}`,
        title: topOpp.title,
        description: topOpp.description,
        categoryId: topOpp.categoryId,
        estimatedMinutes: topOpp.estimatedMinutes,
        priority: 'normal',
        status: 'ready',
        tags: ['backlog-promoted'],
        actualMinutesSpent: 0,
        createdAt: new Date().toISOString(),
        postponeCount: 0,
        isIndependent: true,
      };

      const checkInMinutes = now.getMinutes() + fallbackTask.estimatedMinutes;
      const checkInTime = formatMinutesToTimeString(now.getHours() * 60 + checkInMinutes);

      return {
        task: fallbackTask,
        score: 80,
        reason: `No pending active tasks found. This high-leverage backlog item is ready for independent focus.`,
        suggestedDuration: fallbackTask.estimatedMinutes,
        expectedOutcome: `Complete initial prototype or documentation spike for: "${fallbackTask.title}"`,
        isIndependent: true,
        suggestedCheckInTime: checkInTime,
        scoreBreakdown: [
          { factor: 'Backlog opportunity ready to advance', weight: 'High', score: 80 },
        ],
      };
    }
    return null;
  }

  // Score all tasks
  const scored = eligibleTasks.map((task) => {
    const { totalScore, breakdown, reason } = scoreTaskForRecommendation(
      task,
      availableMinutes,
      energy,
      goals,
      settings
    );
    return { task, score: totalScore, breakdown, reason };
  });

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  const alternative = scored.length > 1 ? scored[1].task : undefined;

  const currentTotalMin = now.getHours() * 60 + now.getMinutes();
  const checkInMin = currentTotalMin + Math.min(best.task.estimatedMinutes, availableMinutes);
  const checkInTime = formatMinutesToTimeString(checkInMin);

  let expectedOutcome = `Complete "${best.task.title}" and update notes.`;
  if (best.task.description) {
    expectedOutcome = best.task.description.slice(0, 95) + (best.task.description.length > 95 ? '...' : '');
  }

  return {
    task: best.task,
    score: Math.round(best.score),
    reason: best.reason + (nextCommitment ? ` (Next fixed event: ${nextCommitment.title} at ${nextCommitment.startTime}).` : ''),
    suggestedDuration: Math.min(best.task.estimatedMinutes, availableMinutes),
    expectedOutcome,
    isIndependent: best.task.isIndependent,
    suggestedCheckInTime: checkInTime,
    alternativeTask: alternative,
    scoreBreakdown: best.breakdown,
  };
}
