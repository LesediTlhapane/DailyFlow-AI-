import {
  Category,
  Task,
  CalendarCommitment,
  Goal,
  WaitingItem,
  OpportunityBacklogItem,
  FocusSession,
  DailyReflection,
  UserSettings,
} from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-work', name: 'Work & Career', color: '#EA580C', icon: 'Briefcase', area: 'work', enabled: true },
  { id: 'cat-ai-research', name: 'AI Research & Experiments', color: '#F97316', icon: 'Sparkles', area: 'work', enabled: true },
  { id: 'cat-dev', name: 'Software Development', color: '#FB923C', icon: 'Code2', area: 'work', enabled: true },
  { id: 'cat-n8n', name: 'Workflows & Automation (n8n)', color: '#D97706', icon: 'Workflow', area: 'work', enabled: true },
  { id: 'cat-learning', name: 'Learning & Study', color: '#A855F7', icon: 'GraduationCap', area: 'growth', enabled: true },
  { id: 'cat-business', name: 'Business & Ventures', color: '#10B981', icon: 'TrendingUp', area: 'growth', enabled: true },
  { id: 'cat-admin', name: 'Personal Administration', color: '#71717A', icon: 'FileText', area: 'personal', enabled: true },
  { id: 'cat-home', name: 'Home & Errands', color: '#E11D48', icon: 'Home', area: 'personal', enabled: true },
  { id: 'cat-health', name: 'Health & Wellbeing', color: '#14B8A6', icon: 'HeartPulse', area: 'balance', enabled: true },
  { id: 'cat-social', name: 'Relationships & Social', color: '#EC4899', icon: 'Users', area: 'balance', enabled: true },
  { id: 'cat-finance', name: 'Finance & Planning', color: '#059669', icon: 'Coins', area: 'personal', enabled: true },
  { id: 'cat-rest', name: 'Rest & Recovery', color: '#8B5CF6', icon: 'Moon', area: 'balance', enabled: true },
];

export const DEFAULT_SETTINGS: UserSettings = {
  name: 'Lesedi',
  greeting: 'Good morning',
  roleContext: 'AI Technical Specialist & Software Developer',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles',
  workdays: [1, 2, 3, 4, 5],
  workStartTime: '09:00',
  workEndTime: '18:00',
  weekendPolicy: 'rest_first',
  defaultTaskDuration: 30,
  theme: 'dark',
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  planningStyle: 'energy_based',
  n8n: {
    enabled: false,
    webhookUrl: '',
    authToken: '',
    syncMorningBriefing: false,
    syncConflictAlerts: false,
    syncWeeklyReview: false,
  },
  notificationsEnabled: true,
  bgImageOpacity: 0.16,
};

// Helper for local date string YYYY-MM-DD
export function getTodayDateString(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Clean Slate: No Mock Data
export const SEED_TASKS: Task[] = [];
export const SEED_COMMITMENTS: CalendarCommitment[] = [];
export const SEED_GOALS: Goal[] = [];
export const SEED_WAITING: WaitingItem[] = [];
export const SEED_BACKLOG: OpportunityBacklogItem[] = [];
export const SEED_FOCUS_SESSIONS: FocusSession[] = [];
export const SEED_REFLECTIONS: DailyReflection[] = [];

// Storage keys
const KEYS = {
  CATEGORIES: 'dayflow_categories',
  TASKS: 'dayflow_tasks',
  COMMITMENTS: 'dayflow_commitments',
  GOALS: 'dayflow_goals',
  WAITING: 'dayflow_waiting',
  BACKLOG: 'dayflow_backlog',
  FOCUS: 'dayflow_focus_sessions',
  REFLECTIONS: 'dayflow_reflections',
  SETTINGS: 'dayflow_settings',
};

// Generic read/write with event dispatch for instant reactivity
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('dayflow-storage-updated', { detail: { key } }));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

export const StorageService = {
  initStorage(): void {
    // 1. One-time clean slate migration: purge legacy mock data from browser cache
    const CLEAN_SLATE_FLAG = 'dayflow_clean_slate_active_v2';
    if (!localStorage.getItem(CLEAN_SLATE_FLAG)) {
      localStorage.removeItem(KEYS.TASKS);
      localStorage.removeItem(KEYS.COMMITMENTS);
      localStorage.removeItem(KEYS.GOALS);
      localStorage.removeItem(KEYS.WAITING);
      localStorage.removeItem(KEYS.BACKLOG);
      localStorage.removeItem(KEYS.FOCUS);
      localStorage.removeItem(KEYS.REFLECTIONS);
      localStorage.setItem(CLEAN_SLATE_FLAG, 'true');
    }

    // 2. Initialize categories & settings if missing
    if (!localStorage.getItem(KEYS.CATEGORIES)) {
      setStored(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      setStored(KEYS.SETTINGS, DEFAULT_SETTINGS);
    } else {
      const s = getStored<UserSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
      // Ensure dark theme is primary default as requested
      if (!localStorage.getItem('dayflow_explicit_light') && s.theme !== 'dark') {
        setStored(KEYS.SETTINGS, { ...s, theme: 'dark' });
      }
    }

    // 3. Ensure collections default to empty lists
    if (!localStorage.getItem(KEYS.TASKS)) {
      setStored(KEYS.TASKS, []);
    }
    if (!localStorage.getItem(KEYS.COMMITMENTS)) {
      setStored(KEYS.COMMITMENTS, []);
    }
    if (!localStorage.getItem(KEYS.GOALS)) {
      setStored(KEYS.GOALS, []);
    }
    if (!localStorage.getItem(KEYS.WAITING)) {
      setStored(KEYS.WAITING, []);
    }
    if (!localStorage.getItem(KEYS.BACKLOG)) {
      setStored(KEYS.BACKLOG, []);
    }
    if (!localStorage.getItem(KEYS.FOCUS)) {
      setStored(KEYS.FOCUS, []);
    }
    if (!localStorage.getItem(KEYS.REFLECTIONS)) {
      setStored(KEYS.REFLECTIONS, []);
    }
  },

  getCategories(): Category[] {
    return getStored<Category[]>(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  },
  saveCategories(categories: Category[]): void {
    setStored(KEYS.CATEGORIES, categories);
  },

  getSettings(): UserSettings {
    return getStored<UserSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  saveSettings(settings: UserSettings): void {
    setStored(KEYS.SETTINGS, settings);
  },

  getTasks(): Task[] {
    return getStored<Task[]>(KEYS.TASKS, []);
  },
  saveTasks(tasks: Task[]): void {
    setStored(KEYS.TASKS, tasks);
  },

  getCommitments(): CalendarCommitment[] {
    return getStored<CalendarCommitment[]>(KEYS.COMMITMENTS, []);
  },
  saveCommitments(commitments: CalendarCommitment[]): void {
    setStored(KEYS.COMMITMENTS, commitments);
  },

  getGoals(): Goal[] {
    return getStored<Goal[]>(KEYS.GOALS, []);
  },
  saveGoals(goals: Goal[]): void {
    setStored(KEYS.GOALS, goals);
  },

  getWaiting(): WaitingItem[] {
    return getStored<WaitingItem[]>(KEYS.WAITING, []);
  },
  saveWaiting(items: WaitingItem[]): void {
    setStored(KEYS.WAITING, items);
  },

  getBacklog(): OpportunityBacklogItem[] {
    return getStored<OpportunityBacklogItem[]>(KEYS.BACKLOG, []);
  },
  saveBacklog(items: OpportunityBacklogItem[]): void {
    setStored(KEYS.BACKLOG, items);
  },

  getFocusSessions(): FocusSession[] {
    return getStored<FocusSession[]>(KEYS.FOCUS, []);
  },
  saveFocusSessions(sessions: FocusSession[]): void {
    setStored(KEYS.FOCUS, sessions);
  },

  getReflections(): DailyReflection[] {
    return getStored<DailyReflection[]>(KEYS.REFLECTIONS, []);
  },
  saveReflections(reflections: DailyReflection[]): void {
    setStored(KEYS.REFLECTIONS, reflections);
  },

  clearAllData(): void {
    setStored(KEYS.TASKS, []);
    setStored(KEYS.COMMITMENTS, []);
    setStored(KEYS.GOALS, []);
    setStored(KEYS.WAITING, []);
    setStored(KEYS.BACKLOG, []);
    setStored(KEYS.FOCUS, []);
    setStored(KEYS.REFLECTIONS, []);
    window.dispatchEvent(new CustomEvent('dayflow-storage-updated', { detail: { key: 'all' } }));
  },

  resetToDemo(): void {
    this.clearAllData();
  },

  exportAllData(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      categories: this.getCategories(),
      settings: this.getSettings(),
      tasks: this.getTasks(),
      commitments: this.getCommitments(),
      goals: this.getGoals(),
      waiting: this.getWaiting(),
      backlog: this.getBacklog(),
      focusSessions: this.getFocusSessions(),
      reflections: this.getReflections(),
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.categories) setStored(KEYS.CATEGORIES, data.categories);
      if (data.settings) setStored(KEYS.SETTINGS, data.settings);
      if (data.tasks) setStored(KEYS.TASKS, data.tasks);
      if (data.commitments) setStored(KEYS.COMMITMENTS, data.commitments);
      if (data.goals) setStored(KEYS.GOALS, data.goals);
      if (data.waiting) setStored(KEYS.WAITING, data.waiting);
      if (data.backlog) setStored(KEYS.BACKLOG, data.backlog);
      if (data.focusSessions) setStored(KEYS.FOCUS, data.focusSessions);
      if (data.reflections) setStored(KEYS.REFLECTIONS, data.reflections);
      window.dispatchEvent(new CustomEvent('dayflow-storage-updated', { detail: { key: 'all' } }));
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  },
};
