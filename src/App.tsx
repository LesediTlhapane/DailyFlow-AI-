import React, { useState, useEffect } from 'react';
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
  RecommendationResult,
} from './types';
import { StorageService } from './utils/storage';
import { getSmartRecommendation } from './utils/scoring';
import { ToastProvider, useToast } from './components/common/Toast';
import { Header } from './components/layout/Header';
import { Sidebar, NavSection } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { TodayView } from './components/today/TodayView';
import { WhatShouldIDoNowModal } from './components/today/WhatShouldIDoNowModal';
import { ReplanModal } from './components/today/ReplanModal';
import { CalendarView } from './components/calendar/CalendarView';
import { TasksView } from './components/tasks/TasksView';
import { TaskModal } from './components/tasks/TaskModal';
import { WaitingBacklogView } from './components/waiting/WaitingBacklogView';
import { AIAssistantView } from './components/assistant/AIAssistantView';
import { GoalsView } from './components/goals/GoalsView';
import { InsightsView } from './components/insights/InsightsView';
import { SettingsView } from './components/settings/SettingsView';
import { FocusSessionModal } from './components/focus/FocusSessionModal';
import { PAGE_BACKGROUNDS } from './utils/pageBackgrounds';

function DayFlowApp() {
  const { showToast } = useToast();

  // Primary State
  const [currentSection, setCurrentSection] = useState<NavSection>('today');
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<UserSettings>(StorageService.getSettings());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [commitments, setCommitments] = useState<CalendarCommitment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [waitingItems, setWaitingItems] = useState<WaitingItem[]>([]);
  const [backlogItems, setBacklogItems] = useState<OpportunityBacklogItem[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);

  // Focus Timer Global State
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);
  const [isFocusTimerActive, setIsFocusTimerActive] = useState<boolean>(false);
  const [focusSecondsRemaining, setFocusSecondsRemaining] = useState<number>(25 * 60);
  const [activeFocusSessionData, setActiveFocusSessionData] = useState<FocusSession | null>(null);

  // Modals
  const [showWhatNowModal, setShowWhatNowModal] = useState<boolean>(false);
  const [showReplanModal, setShowReplanModal] = useState<boolean>(false);
  const [showFocusModal, setShowFocusModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);

  // Energy preference for recommendations
  const [currentEnergy, setCurrentEnergy] = useState<'high' | 'medium' | 'low'>('medium');
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  // Sync document dark class whenever settings.theme changes
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    if (newSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  // Initialize data on mount
  useEffect(() => {
    StorageService.initStorage();
    setCategories(StorageService.getCategories());
    const savedSettings = StorageService.getSettings();
    setSettings(savedSettings);
    setTasks(StorageService.getTasks());
    setCommitments(StorageService.getCommitments());
    setGoals(StorageService.getGoals());
    setWaitingItems(StorageService.getWaiting());
    setBacklogItems(StorageService.getBacklog());
    setFocusSessions(StorageService.getFocusSessions());
    setReflections(StorageService.getReflections());
  }, []);

  // Sync listener across tabs/events
  useEffect(() => {
    const handleStorageChange = () => {
      setCategories(StorageService.getCategories());
      setSettings(StorageService.getSettings());
      setTasks(StorageService.getTasks());
      setCommitments(StorageService.getCommitments());
      setGoals(StorageService.getGoals());
      setWaitingItems(StorageService.getWaiting());
      setBacklogItems(StorageService.getBacklog());
      setFocusSessions(StorageService.getFocusSessions());
      setReflections(StorageService.getReflections());
    };

    window.addEventListener('dayflow-storage-updated', handleStorageChange);
    return () => window.removeEventListener('dayflow-storage-updated', handleStorageChange);
  }, []);

  // Focus Timer interval ticker
  useEffect(() => {
    let interval: any = null;
    if (isFocusTimerActive && focusSecondsRemaining > 0) {
      interval = setInterval(() => {
        setFocusSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsFocusTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFocusTimerActive, focusSecondsRemaining]);

  // Open "What should I do now?" engine
  const handleOpenWhatNow = (overrideEnergy?: 'high' | 'medium' | 'low') => {
    const energy = overrideEnergy || currentEnergy;
    const rec = getSmartRecommendation(
      tasks,
      commitments,
      goals,
      backlogItems,
      settings,
      { energyLevel: energy }
    );
    setRecommendation(rec);
    setShowWhatNowModal(true);
  };

  // Start Focus session on a task
  const handleStartFocus = (task: Task) => {
    setActiveFocusTask(task);
    const duration = task.estimatedMinutes || 25;
    setFocusSecondsRemaining(duration * 60);
    setIsFocusTimerActive(true);
    setActiveFocusSessionData({
      id: `foc-${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      targetMinutes: duration,
      actualMinutes: 0,
      startedAt: new Date().toISOString(),
      outcome: 'progress_made',
    });
    setShowFocusModal(true);
    showToast('Focus Started', `25m timer initiated for "${task.title}".`, 'info');
  };

  const handleToggleTimer = () => {
    setIsFocusTimerActive(!isFocusTimerActive);
  };

  const handleResetTimer = (newDurationMinutes?: number) => {
    setIsFocusTimerActive(false);
    const mins = newDurationMinutes || (activeFocusTask?.estimatedMinutes || 25);
    setFocusSecondsRemaining(mins * 60);
  };

  // Task save handler
  const handleSaveTask = (savedTask: Task) => {
    let updatedTasks: Task[];
    const exists = tasks.some((t) => t.id === savedTask.id);
    if (exists) {
      updatedTasks = tasks.map((t) => (t.id === savedTask.id ? savedTask : t));
    } else {
      updatedTasks = [savedTask, ...tasks];
    }
    setTasks(updatedTasks);
    StorageService.saveTasks(updatedTasks);
    showToast(exists ? 'Task Updated' : 'Task Created', `"${savedTask.title}" saved.`, 'success');
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    StorageService.saveTasks(updated);
    showToast('Task Deleted', 'Removed from registry.', 'info');
  };

  const handleDuplicateTask = (task: Task) => {
    const dup: Task = {
      ...task,
      id: `task-${Date.now()}`,
      title: `${task.title} (Copy)`,
      status: 'planned',
      actualMinutesSpent: 0,
      createdAt: new Date().toISOString(),
      completedAt: undefined,
    };
    const updated = [dup, ...tasks];
    setTasks(updated);
    StorageService.saveTasks(updated);
    showToast('Task Duplicated', `Created copy: "${dup.title}".`, 'success');
  };

  const handleToggleComplete = (task: Task) => {
    const isDone = task.status === 'completed';
    const updatedTask: Task = {
      ...task,
      status: isDone ? 'planned' : 'completed',
      completedAt: isDone ? undefined : new Date().toISOString(),
    };
    const updated = tasks.map((t) => (t.id === task.id ? updatedTask : t));
    setTasks(updated);
    StorageService.saveTasks(updated);
    showToast(
      isDone ? 'Marked Incomplete' : 'Task Completed!',
      `"${task.title}" updated.`,
      isDone ? 'info' : 'success'
    );
  };

  const handleAddMultipleTasks = (newTasksList: Partial<Task>[]) => {
    const created: Task[] = newTasksList.map((t, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      title: t.title || 'Untitled Task',
      description: t.description,
      categoryId: t.categoryId || categories[0]?.id || 'cat-work',
      estimatedMinutes: t.estimatedMinutes || 30,
      scheduledDate: t.scheduledDate || new Date().toISOString().slice(0, 10),
      priority: t.priority || 'normal',
      status: t.status || 'planned',
      actualMinutesSpent: 0,
      createdAt: new Date().toISOString(),
      postponeCount: 0,
      isIndependent: t.isIndependent ?? true,
      tags: t.tags || [],
    }));

    const updated = [...created, ...tasks];
    setTasks(updated);
    StorageService.saveTasks(updated);
  };

  const handleAddCommitment = (c: CalendarCommitment) => {
    const updated = [...commitments, c];
    setCommitments(updated);
    StorageService.saveCommitments(updated);
    showToast('Event Created', `"${c.title}" added to calendar.`, 'success');
  };

  const handleSaveFocusSession = (session: FocusSession, updatedTask?: Task) => {
    const updatedSessions = [session, ...focusSessions];
    setFocusSessions(updatedSessions);
    StorageService.saveFocusSessions(updatedSessions);

    if (updatedTask) {
      handleSaveTask(updatedTask);
    }
  };

  const handlePromoteBacklogToTask = (opp: OpportunityBacklogItem) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: opp.title,
      description: opp.description,
      categoryId: opp.categoryId,
      estimatedMinutes: opp.estimatedMinutes,
      priority: opp.expectedValue === 'high' ? 'high' : 'normal',
      status: 'planned',
      scheduledDate: new Date().toISOString().slice(0, 10),
      actualMinutesSpent: 0,
      createdAt: new Date().toISOString(),
      postponeCount: 0,
      isIndependent: true,
      tags: ['backlog-promoted'],
    };

    const updatedBacklog = backlogItems.map((b) => (b.id === opp.id ? { ...b, status: 'promoted' as const } : b));
    setBacklogItems(updatedBacklog);
    StorageService.saveBacklog(updatedBacklog);

    handleSaveTask(newTask);
    showToast('Promoted to Schedule', `"${newTask.title}" added to Today's tasks.`, 'success');
  };

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const waitingCount = waitingItems.filter((w) => !w.resolved).length;
  const activeGoalsCount = goals.length;

  const currentBg = PAGE_BACKGROUNDS[currentSection];
  const isDark = settings.theme === 'dark';
  const configuredOpacity = settings.bgImageOpacity ?? 0.12;

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Desktop Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        pendingTasksCount={pendingTasksCount}
        waitingCount={waitingCount}
        activeGoalsCount={activeGoalsCount}
        settings={settings}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6 relative isolate">
        {/* Atmospheric Page Background with Lowered Opacity */}
        <div className="page-bg-canvas" aria-hidden="true">
          <div
            key={currentSection}
            className="page-bg-image"
            style={{
              backgroundImage: `url(${currentBg.src})`,
              opacity: configuredOpacity,
              filter: isDark
                ? 'brightness(0.85) contrast(1.2) saturate(1.15)'
                : 'brightness(1.0) contrast(1.05) saturate(0.95)',
            }}
          />
          <div
            className="page-bg-overlay"
            style={{
              opacity: Math.max(0.15, 1 - Math.max(0, configuredOpacity - 0.2) * 0.7),
            }}
          />
        </div>

        <Header
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onOpenWhatNow={() => handleOpenWhatNow()}
          onOpenQuickAdd={() => {
            setEditingTask(null);
            setShowTaskModal(true);
          }}
          onOpenFocusModal={() => setShowFocusModal(true)}
          activeFocusSession={isFocusTimerActive ? activeFocusSessionData : null}
          focusSecondsRemaining={focusSecondsRemaining}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10">
          {currentSection === 'today' && (
            <TodayView
              tasks={tasks}
              commitments={commitments}
              categories={categories}
              goals={goals}
              waitingItems={waitingItems}
              focusSessions={focusSessions}
              settings={settings}
              onNavigateSection={setCurrentSection}
              onSelectTask={(t) => {
                setEditingTask(t);
                setShowTaskModal(true);
              }}
              onAddTask={(partial) => {
                const newTask: Task = {
                  id: `task-${Date.now()}`,
                  title: partial.title || 'New Task',
                  categoryId: partial.categoryId || 'cat-work',
                  estimatedMinutes: partial.estimatedMinutes || 30,
                  priority: partial.priority || 'normal',
                  status: partial.status || 'planned',
                  scheduledDate: partial.scheduledDate || new Date().toISOString().slice(0, 10),
                  actualMinutesSpent: 0,
                  createdAt: new Date().toISOString(),
                  postponeCount: 0,
                  isIndependent: partial.isIndependent ?? true,
                  tags: partial.tags || [],
                };
                handleSaveTask(newTask);
              }}
              onToggleComplete={handleToggleComplete}
              onStartFocus={handleStartFocus}
              onOpenWhatNow={() => handleOpenWhatNow()}
              onOpenReplan={() => setShowReplanModal(true)}
              onOpenFocusModal={() => setShowFocusModal(true)}
            />
          )}

          {currentSection === 'calendar' && (
            <CalendarView
              tasks={tasks}
              commitments={commitments}
              categories={categories}
              settings={settings}
              onSelectTask={(t) => {
                setEditingTask(t);
                setShowTaskModal(true);
              }}
              onAddTask={(partial) => handleAddMultipleTasks([partial])}
              onAddCommitment={handleAddCommitment}
            />
          )}

          {currentSection === 'tasks' && (
            <TasksView
              tasks={tasks}
              categories={categories}
              goals={goals}
              onSelectTask={(t) => {
                setEditingTask(t);
                setShowTaskModal(true);
              }}
              onOpenCreateModal={() => {
                setEditingTask(null);
                setShowTaskModal(true);
              }}
              onStartFocus={handleStartFocus}
              onToggleComplete={handleToggleComplete}
              onUpdateTask={handleSaveTask}
            />
          )}

          {currentSection === 'waiting' && (
            <WaitingBacklogView
              waitingItems={waitingItems}
              backlogItems={backlogItems}
              categories={categories}
              tasks={tasks}
              onSaveWaiting={(items) => {
                setWaitingItems(items);
                StorageService.saveWaiting(items);
              }}
              onSaveBacklog={(items) => {
                setBacklogItems(items);
                StorageService.saveBacklog(items);
              }}
              onPromoteToTask={handlePromoteBacklogToTask}
            />
          )}

          {currentSection === 'companion' && (
            <AIAssistantView
              tasks={tasks}
              commitments={commitments}
              goals={goals}
              settings={settings}
              onAddTasks={handleAddMultipleTasks}
            />
          )}

          {currentSection === 'goals' && (
            <GoalsView
              goals={goals}
              categories={categories}
              tasks={tasks}
              onSaveGoals={(g) => {
                setGoals(g);
                StorageService.saveGoals(g);
              }}
              onAddTasks={handleAddMultipleTasks}
            />
          )}

          {currentSection === 'insights' && (
            <InsightsView
              tasks={tasks}
              categories={categories}
              goals={goals}
              focusSessions={focusSessions}
              reflections={reflections}
              settings={settings}
              onSaveReflections={(r) => {
                setReflections(r);
                StorageService.saveReflections(r);
              }}
              onUpdateTasks={(updated) => {
                setTasks(updated);
                StorageService.saveTasks(updated);
              }}
            />
          )}

          {currentSection === 'settings' && (
            <SettingsView
              settings={settings}
              categories={categories}
              onUpdateSettings={handleUpdateSettings}
              onUpdateCategories={setCategories}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        pendingCount={pendingTasksCount}
      />

      {/* What Should I Do Now Modal */}
      <WhatShouldIDoNowModal
        isOpen={showWhatNowModal}
        onClose={() => setShowWhatNowModal(false)}
        recommendation={recommendation}
        onStartFocus={(t) => handleStartFocus(t)}
        onPickAlternative={(alt) => {
          handleStartFocus(alt);
          setShowWhatNowModal(false);
        }}
        onRefreshRecommendation={(energy) => handleOpenWhatNow(energy)}
        currentEnergy={currentEnergy}
        onSetEnergy={setCurrentEnergy}
      />

      {/* Replan Modal */}
      <ReplanModal
        isOpen={showReplanModal}
        onClose={() => setShowReplanModal(false)}
        tasks={tasks}
        commitments={commitments}
        workHours={{ start: settings.workStartTime, end: settings.workEndTime }}
        onApplySchedule={(rebalancedTasks) => {
          setTasks(rebalancedTasks);
          StorageService.saveTasks(rebalancedTasks);
        }}
      />

      {/* Focus Timer Modal */}
      <FocusSessionModal
        isOpen={showFocusModal}
        onClose={() => setShowFocusModal(false)}
        task={activeFocusTask}
        tasks={tasks}
        onSelectTask={(t) => {
          setActiveFocusTask(t);
          setFocusSecondsRemaining((t.estimatedMinutes || 25) * 60);
        }}
        onSaveSession={handleSaveFocusSession}
        isActive={isFocusTimerActive}
        secondsRemaining={focusSecondsRemaining}
        onToggleTimer={handleToggleTimer}
        onResetTimer={handleResetTimer}
      />

      {/* Full Task Create / Edit Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        task={editingTask}
        categories={categories}
        goals={goals}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onDuplicate={handleDuplicateTask}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <DayFlowApp />
    </ToastProvider>
  );
}
