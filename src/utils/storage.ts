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

const todayStr = getTodayDateString();
const tomorrowStr = getTodayDateString(1);

export const SEED_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Benchmark Gemini 3.8 Flash vs Claude 3.5 Sonnet on latency & cost',
    description: 'Run benchmark script evaluating function calling latency and token efficiency for our automated mentoring agent.',
    notes: 'Use test suite under /benchmarks; record p50, p95 and cost per 1k requests.',
    categoryId: 'cat-ai-research',
    subcategory: 'Model Evaluation',
    estimatedMinutes: 45,
    scheduledDate: todayStr,
    startTime: '10:00',
    endTime: '10:45',
    priority: 'high',
    status: 'in_progress',
    repeatSchedule: 'none',
    reminderMinutesBefore: 10,
    goalId: 'goal-1',
    tags: ['ai-eval', 'benchmarking', 'mentorship-agent'],
    actualMinutesSpent: 20,
    createdAt: new Date().toISOString(),
    postponeCount: 0,
    isIndependent: true,
  },
  {
    id: 'task-2',
    title: 'Implement error handling in n8n student feedback webhook',
    description: 'Add retry mechanisms with exponential backoff and Discord alert fallback when LLM API returns 429 rate limit.',
    categoryId: 'cat-n8n',
    estimatedMinutes: 30,
    scheduledDate: todayStr,
    startTime: '11:15',
    endTime: '11:45',
    priority: 'high',
    status: 'ready',
    goalId: 'goal-2',
    tags: ['n8n', 'automation', 'error-handling'],
    actualMinutesSpent: 0,
    createdAt: new Date().toISOString(),
    postponeCount: 0,
    isIndependent: true,
  },
  {
    id: 'task-3',
    title: 'Draft prompt architecture documentation for AI Avatar mentor',
    description: 'Document system prompt constraints, guardrails against hallucinations, and multi-turn state preservation techniques.',
    categoryId: 'cat-ai-research',
    estimatedMinutes: 60,
    scheduledDate: todayStr,
    startTime: '14:00',
    endTime: '15:00',
    priority: 'critical',
    deadline: todayStr,
    status: 'planned',
    goalId: 'goal-1',
    tags: ['prompt-engineering', 'documentation', 'avatar'],
    actualMinutesSpent: 0,
    createdAt: new Date().toISOString(),
    postponeCount: 1,
    isIndependent: false,
  },
  {
    id: 'task-4',
    title: 'Quick 20-min recharge walk & hydration',
    description: 'Step away from screens, daylight exposure, drink 500ml water.',
    categoryId: 'cat-health',
    estimatedMinutes: 20,
    scheduledDate: todayStr,
    startTime: '15:15',
    endTime: '15:35',
    priority: 'normal',
    status: 'planned',
    tags: ['recharge', 'health'],
    actualMinutesSpent: 0,
    createdAt: new Date().toISOString(),
    postponeCount: 0,
    isIndependent: true,
  },
  {
    id: 'task-5',
    title: 'Review PR: Next-gen streaming chat interface component',
    description: 'Check virtualized message list, accessibility labels, and markdown code block copy buttons.',
    categoryId: 'cat-dev',
    estimatedMinutes: 30,
    scheduledDate: todayStr,
    startTime: '16:00',
    endTime: '16:30',
    priority: 'normal',
    status: 'planned',
    tags: ['code-review', 'frontend'],
    actualMinutesSpent: 0,
    createdAt: new Date().toISOString(),
    postponeCount: 0,
    isIndependent: true,
  },
  {
    id: 'task-6',
    title: 'Review weekly cloud billing & API token quotas',
    description: 'Verify our usage limits on Google Cloud Vertex & Gemini to avoid surprises.',
    categoryId: 'cat-finance',
    estimatedMinutes: 15,
    scheduledDate: tomorrowStr,
    priority: 'normal',
    status: 'inbox',
    tags: ['admin', 'cloud'],
    actualMinutesSpent: 0,
    createdAt: new Date().toISOString(),
    postponeCount: 0,
    isIndependent: true,
  },
  {
    id: 'task-7',
    title: 'Pick up healthy groceries for weekly meal prep',
    description: 'Fresh vegetables, high-protein pantry staples, green tea.',
    categoryId: 'cat-home',
    estimatedMinutes: 45,
    scheduledDate: todayStr,
    startTime: '18:30',
    endTime: '19:15',
    priority: 'normal',
    status: 'planned',
    tags: ['errands', 'nutrition'],
    actualMinutesSpent: 0,
    createdAt: new Date().toISOString(),
    postponeCount: 0,
    isIndependent: true,
  },
];

export const SEED_COMMITMENTS: CalendarCommitment[] = [
  {
    id: 'com-1',
    title: 'Team Sync & AI Sprint Check-in',
    categoryId: 'cat-work',
    date: todayStr,
    startTime: '09:15',
    endTime: '09:45',
    isFixed: true,
    description: 'Daily standup discussing AI avatar prototype progress & blockers.',
  },
  {
    id: 'com-2',
    title: 'Protected Deep Work Block: Agent Architecture',
    categoryId: 'cat-ai-research',
    date: todayStr,
    startTime: '10:00',
    endTime: '12:00',
    isFixed: false,
    description: 'Focus window for model evaluation and n8n webhook refinement.',
  },
  {
    id: 'com-3',
    title: 'Lunch & Screen-free Rest',
    categoryId: 'cat-rest',
    date: todayStr,
    startTime: '12:30',
    endTime: '13:30',
    isFixed: true,
    isBreak: true,
    description: 'Healthy food and mental decompression.',
  },
  {
    id: 'com-4',
    title: 'AI Curriculum Review Session',
    categoryId: 'cat-learning',
    date: todayStr,
    startTime: '15:30',
    endTime: '16:00',
    isFixed: true,
    description: 'Cross-functional review of the interactive prompt engineering lab.',
  },
];

export const SEED_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Deploy Production AI Mentoring Avatar',
    description: 'Build and launch an interactive AI-powered learning mentor with voice responses, guardrails, and automated analytics.',
    categoryId: 'cat-ai-research',
    area: 'work',
    targetDate: getTodayDateString(30),
    progress: 45,
    importance: 'core',
    reviewFrequency: 'weekly',
    milestones: [
      { id: 'm-1', title: 'System prompt architecture & anti-jailbreak guardrails', completed: true },
      { id: 'm-2', title: 'Evaluate latency & token throughput (Gemini 3.8)', completed: false, dueDate: todayStr },
      { id: 'm-3', title: 'Integrate live voice synthesized streaming playback', completed: false, dueDate: getTodayDateString(14) },
      { id: 'm-4', title: 'Beta user trial with 50 learners', completed: false, dueDate: getTodayDateString(28) },
    ],
  },
  {
    id: 'goal-2',
    title: 'Build Autonomous Workflow Ecosystem (n8n + AI)',
    description: 'Create zero-maintenance n8n pipelines for student feedback, auto-grading assistance, and daily technical digests.',
    categoryId: 'cat-n8n',
    area: 'work',
    targetDate: getTodayDateString(45),
    progress: 60,
    importance: 'core',
    reviewFrequency: 'weekly',
    milestones: [
      { id: 'm-20', title: 'Webhook architecture specification', completed: true },
      { id: 'm-21', title: 'Error-handling with exponential backoff & rate-limit recovery', completed: false, dueDate: todayStr },
      { id: 'm-22', title: 'Telemetry & failure alerting integration', completed: false },
    ],
  },
  {
    id: 'goal-3',
    title: 'Launch Independent AI Dev Tool SaaS',
    description: 'Build and ship a boutique developer tool for prompt versioning and regression testing.',
    categoryId: 'cat-business',
    area: 'growth',
    targetDate: getTodayDateString(90),
    progress: 25,
    importance: 'supporting',
    reviewFrequency: 'biweekly',
    milestones: [
      { id: 'm-30', title: 'Technical proof-of-concept repository', completed: true },
      { id: 'm-31', title: 'Landing page with waitlist registration', completed: false, dueDate: getTodayDateString(10) },
      { id: 'm-32', title: 'Private alpha release with 10 beta testers', completed: false },
    ],
  },
  {
    id: 'goal-4',
    title: 'Peak Physical Conditioning & Sleep Regularity',
    description: 'Maintain 4 workouts/week and protect a consistent 8-hour sleep window with quiet hours.',
    categoryId: 'cat-health',
    area: 'balance',
    targetDate: getTodayDateString(120),
    progress: 70,
    importance: 'core',
    reviewFrequency: 'weekly',
    milestones: [
      { id: 'm-40', title: 'Establish 22:30 screen-off habit', completed: true },
      { id: 'm-41', title: 'Complete 16 strength training sessions this month', completed: false },
    ],
  },
];

export const SEED_WAITING: WaitingItem[] = [
  {
    id: 'wait-1',
    title: 'Approval for Cloud GPU quota increase',
    waitingOn: 'DevOps / Lead Engineer',
    startedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    expectedFollowUp: todayStr,
    relatedTaskId: 'task-1',
    relatedGoalId: 'goal-1',
    canWorkIndependently: true,
    notes: 'Requested 4x L4 instances for high-throughput batch evaluation. Independent testing can continue on Gemini 3.8 Flash API.',
    resolved: false,
  },
  {
    id: 'wait-2',
    title: 'Feedback on AI Avatar script voice style',
    waitingOn: 'Curriculum Director',
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    expectedFollowUp: tomorrowStr,
    relatedGoalId: 'goal-1',
    canWorkIndependently: true,
    notes: 'Drafted three persona tones (Empathetic Tutor, Sharp Senior Architect, Socratic Coach). Can continue working on pipeline architecture.',
    resolved: false,
  },
];

export const SEED_BACKLOG: OpportunityBacklogItem[] = [
  {
    id: 'opp-1',
    title: 'Explore Gemini 3.8 Flash-lite TTS for real-time mentor voice',
    description: 'Quick spike to test audio latency and voice clarity using prebuilt voice Kore.',
    categoryId: 'cat-ai-research',
    estimatedMinutes: 30,
    expectedValue: 'high',
    status: 'backlog',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'opp-2',
    title: 'Refactor prompt templates to YAML with version control schema',
    description: 'Improve modularity so prompts can be dynamically injected into n8n webhooks.',
    categoryId: 'cat-dev',
    estimatedMinutes: 45,
    expectedValue: 'high',
    status: 'backlog',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'opp-3',
    title: 'Audit browser memory consumption in streaming chat UI',
    description: 'Ensure long multi-turn sessions do not leak memory during token generation.',
    categoryId: 'cat-dev',
    estimatedMinutes: 20,
    expectedValue: 'medium',
    status: 'backlog',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'opp-4',
    title: 'Draft technical blog post: "Building Resilient AI Pipelines in n8n"',
    description: 'Outline practical architecture lessons from handling 429s and schema drift.',
    categoryId: 'cat-learning',
    estimatedMinutes: 45,
    expectedValue: 'high',
    status: 'backlog',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'opp-5',
    title: 'Organize project repository bookmarks & technical papers folder',
    description: 'Categorize recent Arxiv papers on speculative decoding and reasoning models.',
    categoryId: 'cat-admin',
    estimatedMinutes: 15,
    expectedValue: 'low',
    status: 'backlog',
    createdAt: new Date().toISOString(),
  },
];

export const SEED_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: 'foc-1',
    taskId: 'task-1',
    taskTitle: 'Benchmark Gemini 3.8 Flash vs Claude 3.5 Sonnet',
    targetMinutes: 25,
    actualMinutes: 25,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 2100000).toISOString(),
    outcome: 'completed',
    notes: 'Completed initial 100 test runs; latency p50 is 340ms.',
  },
];

export const SEED_REFLECTIONS: DailyReflection[] = [
  {
    id: 'ref-1',
    date: getTodayDateString(-1),
    wentWell: 'Maintained solid deep work blocks in the morning. Resolved the n8n authentication header edge case.',
    wasDifficult: 'Got pulled into unplanned Slack threads during afternoon focus session.',
    needsAttentionTomorrow: 'Strictly protect the 10:00 - 12:00 deep work block with notifications silenced.',
    energyLevelRating: 4,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

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
    if (!localStorage.getItem(KEYS.TASKS)) {
      setStored(KEYS.TASKS, SEED_TASKS);
    }
    if (!localStorage.getItem(KEYS.COMMITMENTS)) {
      setStored(KEYS.COMMITMENTS, SEED_COMMITMENTS);
    }
    if (!localStorage.getItem(KEYS.GOALS)) {
      setStored(KEYS.GOALS, SEED_GOALS);
    }
    if (!localStorage.getItem(KEYS.WAITING)) {
      setStored(KEYS.WAITING, SEED_WAITING);
    }
    if (!localStorage.getItem(KEYS.BACKLOG)) {
      setStored(KEYS.BACKLOG, SEED_BACKLOG);
    }
    if (!localStorage.getItem(KEYS.FOCUS)) {
      setStored(KEYS.FOCUS, SEED_FOCUS_SESSIONS);
    }
    if (!localStorage.getItem(KEYS.REFLECTIONS)) {
      setStored(KEYS.REFLECTIONS, SEED_REFLECTIONS);
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
    return getStored<Task[]>(KEYS.TASKS, SEED_TASKS);
  },
  saveTasks(tasks: Task[]): void {
    setStored(KEYS.TASKS, tasks);
  },

  getCommitments(): CalendarCommitment[] {
    return getStored<CalendarCommitment[]>(KEYS.COMMITMENTS, SEED_COMMITMENTS);
  },
  saveCommitments(commitments: CalendarCommitment[]): void {
    setStored(KEYS.COMMITMENTS, commitments);
  },

  getGoals(): Goal[] {
    return getStored<Goal[]>(KEYS.GOALS, SEED_GOALS);
  },
  saveGoals(goals: Goal[]): void {
    setStored(KEYS.GOALS, goals);
  },

  getWaiting(): WaitingItem[] {
    return getStored<WaitingItem[]>(KEYS.WAITING, SEED_WAITING);
  },
  saveWaiting(items: WaitingItem[]): void {
    setStored(KEYS.WAITING, items);
  },

  getBacklog(): OpportunityBacklogItem[] {
    return getStored<OpportunityBacklogItem[]>(KEYS.BACKLOG, SEED_BACKLOG);
  },
  saveBacklog(items: OpportunityBacklogItem[]): void {
    setStored(KEYS.BACKLOG, items);
  },

  getFocusSessions(): FocusSession[] {
    return getStored<FocusSession[]>(KEYS.FOCUS, SEED_FOCUS_SESSIONS);
  },
  saveFocusSessions(sessions: FocusSession[]): void {
    setStored(KEYS.FOCUS, sessions);
  },

  getReflections(): DailyReflection[] {
    return getStored<DailyReflection[]>(KEYS.REFLECTIONS, SEED_REFLECTIONS);
  },
  saveReflections(reflections: DailyReflection[]): void {
    setStored(KEYS.REFLECTIONS, reflections);
  },

  resetToDemo(): void {
    localStorage.clear();
    this.initStorage();
    window.dispatchEvent(new CustomEvent('dayflow-storage-updated', { detail: { key: 'all' } }));
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
