export type Priority = 'low' | 'normal' | 'high' | 'critical';

export type TaskStatus =
  | 'inbox'
  | 'planned'
  | 'ready'
  | 'in_progress'
  | 'waiting'
  | 'blocked'
  | 'completed'
  | 'cancelled';

export type LifeArea = 'work' | 'personal' | 'growth' | 'balance';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  area: LifeArea;
  isCustom?: boolean;
  enabled: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  categoryId: string;
  subcategory?: string;
  estimatedMinutes: number;
  scheduledDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  deadline?: string; // YYYY-MM-DD or ISO
  priority: Priority;
  status: TaskStatus;
  repeatSchedule?: 'none' | 'daily' | 'weekdays' | 'weekly';
  reminderMinutesBefore?: number;
  goalId?: string;
  projectId?: string;
  dependencies?: string[];
  tags: string[];
  actualMinutesSpent: number;
  completionNotes?: string;
  deliverableUrls?: string[];
  createdAt: string;
  completedAt?: string;
  postponeCount: number;
  isIndependent: boolean;
}

export interface CalendarCommitment {
  id: string;
  title: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isFixed: boolean; // Fixed appointment vs movable
  isBreak?: boolean;
  description?: string;
  taskId?: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  area: LifeArea;
  targetDate: string;
  progress: number; // 0 - 100
  importance: 'core' | 'supporting' | 'aspirational';
  reviewFrequency: 'weekly' | 'biweekly' | 'monthly';
  milestones: GoalMilestone[];
  lastReviewedAt?: string;
}

export interface WaitingItem {
  id: string;
  title: string;
  waitingOn: string;
  startedAt: string; // ISO
  expectedFollowUp: string; // YYYY-MM-DD
  relatedTaskId?: string;
  relatedGoalId?: string;
  canWorkIndependently: boolean;
  notes?: string;
  resolved: boolean;
}

export interface OpportunityBacklogItem {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  estimatedMinutes: number;
  requiredResources?: string;
  expectedValue: 'high' | 'medium' | 'low';
  status: 'backlog' | 'promoted' | 'archived';
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  targetMinutes: number;
  actualMinutes: number;
  startedAt: string;
  completedAt?: string;
  outcome: 'completed' | 'progress_made' | 'interrupted' | 'blocked';
  notes?: string;
}

export interface DailyReflection {
  id: string;
  date: string; // YYYY-MM-DD
  wentWell: string;
  wasDifficult: string;
  needsAttentionTomorrow: string;
  energyLevelRating: number; // 1-5
  createdAt: string;
}

export interface UserSettings {
  name: string;
  greeting: string;
  roleContext: string;
  timezone: string;
  workdays: number[]; // 1=Mon .. 7=Sun
  workStartTime: string; // "09:00"
  workEndTime: string; // "18:00"
  weekendPolicy: 'rest_first' | 'light_projects' | 'unrestricted';
  defaultTaskDuration: number;
  theme: 'dark' | 'light';
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "08:00"
  planningStyle: 'structured' | 'fluid' | 'energy_based';
  n8n: {
    enabled: boolean;
    webhookUrl: string;
    authToken?: string;
    syncMorningBriefing: boolean;
    syncConflictAlerts: boolean;
    syncWeeklyReview: boolean;
  };
  notificationsEnabled: boolean;
  bgImageOpacity?: number; // 0.0 to 1.0 (0% to 100%)
}

export interface RecommendationResult {
  task: Task;
  score: number;
  reason: string;
  suggestedDuration: number;
  expectedOutcome: string;
  isIndependent: boolean;
  suggestedCheckInTime: string;
  alternativeTask?: Task;
  scoreBreakdown: {
    factor: string;
    weight: string;
    score: number;
  }[];
}
