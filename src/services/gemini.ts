import { Task, CalendarCommitment, Goal, UserSettings } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  proposedTasks?: Partial<Task>[];
}

export const GeminiService = {
  async checkHealth(): Promise<{ status: string; hasGeminiKey: boolean }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'offline', hasGeminiKey: false };
    }
  },

  async getDailyBriefing(context: {
    userName: string;
    todayTasks: Task[];
    commitments: CalendarCommitment[];
    goals: Goal[];
  }): Promise<string> {
    try {
      const res = await fetch('/api/gemini/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });

      if (!res.ok) {
        throw new Error('Briefing request failed');
      }
      const data = await res.json();
      return data.briefing;
    } catch (e) {
      // Intelligent fallback briefing
      const pendingCount = context.todayTasks.filter((t) => t.status !== 'completed').length;
      const fixedCount = context.commitments.filter((c) => c.isFixed).length;
      return `Welcome back, ${context.userName}. You have ${pendingCount} prioritized tasks and ${fixedCount} scheduled events today. Protect your deep work focus blocks and pace yourself with structured check-ins.`;
    }
  },

  async sendChatMessage(
    message: string,
    context: {
      tasks: Task[];
      commitments: CalendarCommitment[];
      goals: Goal[];
      settings: UserSettings;
    },
    chatHistory: { role: string; content: string }[]
  ): Promise<{ reply: string; proposedTasks?: Partial<Task>[] }> {
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context, chatHistory }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Chat request failed');
      }

      const data = await res.json();
      return { reply: data.reply };
    } catch (err: any) {
      // Local fallback parser for common requests
      const lower = message.toLowerCase();
      if (lower.includes('30 min') || lower.includes('free')) {
        const shortTasks = context.tasks.filter(
          (t) => t.status !== 'completed' && t.estimatedMinutes <= 30
        );
        if (shortTasks.length > 0) {
          return {
            reply: `You have ${shortTasks.length} tasks that fit cleanly within 30 minutes. Here is the top recommendation: "${shortTasks[0].title}" (${shortTasks[0].estimatedMinutes}m). Would you like to start a focus timer on this?`,
            proposedTasks: [shortTasks[0]],
          };
        }
      }

      return {
        reply: `I analyzed your active schedule (${context.tasks.filter((t) => t.status !== 'completed').length} pending tasks). Focus on your highest-priority independent item right now, and take regular breaks. [Offline Mode: Server AI key not connected]`,
      };
    }
  },

  async replanDay(
    tasks: Task[],
    commitments: CalendarCommitment[],
    workHours: { start: string; end: string },
    energyLevel: string
  ): Promise<Array<{ taskId: string; title: string; startTime: string; endTime: string; reason: string }>> {
    try {
      const res = await fetch('/api/gemini/replan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, commitments, workHours, energyLevel }),
      });

      if (!res.ok) throw new Error('Replan failed');
      const data = await res.json();
      return data.plan || [];
    } catch {
      // Heuristic replanner fallback
      const activeTasks = tasks.filter((t) => t.status !== 'completed');
      let currentHour = 10;
      let currentMin = 0;

      return activeTasks.slice(0, 4).map((t) => {
        const start = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
        const endTotal = currentHour * 60 + currentMin + t.estimatedMinutes;
        const endH = Math.floor(endTotal / 60);
        const endM = endTotal % 60;
        const end = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        currentMin += t.estimatedMinutes + 15; // 15 min buffer
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin %= 60;
        }

        return {
          taskId: t.id,
          title: t.title,
          startTime: start,
          endTime: end,
          reason: `Paced with a 15-minute cognitive buffer based on your ${energyLevel} energy preference.`,
        };
      });
    }
  },

  async breakdownGoal(
    goalTitle: string,
    goalDescription: string,
    category: string,
    availableTimeMinutes: number
  ): Promise<Array<{ title: string; description: string; estimatedMinutes: number; priority: 'low' | 'normal' | 'high' | 'critical'; isIndependent: boolean }>> {
    try {
      const res = await fetch('/api/gemini/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalTitle, goalDescription, category, availableTimeMinutes }),
      });
      if (!res.ok) throw new Error('Breakdown failed');
      const data = await res.json();
      return data.tasks || [];
    } catch {
      // Fallback decomposition
      return [
        {
          title: `Define scope & acceptance criteria for ${goalTitle}`,
          description: 'Document key requirements, input/output schemas, and boundaries.',
          estimatedMinutes: 25,
          priority: 'high',
          isIndependent: true,
        },
        {
          title: `Prototype minimal spike for ${goalTitle}`,
          description: 'Create an initial functioning test proof-of-concept without premature optimization.',
          estimatedMinutes: 45,
          priority: 'high',
          isIndependent: true,
        },
        {
          title: `Test edge cases and benchmark performance`,
          description: 'Evaluate latency, errors, and user feedback under real conditions.',
          estimatedMinutes: 30,
          priority: 'normal',
          isIndependent: true,
        },
      ];
    }
  },

  async extractTasksFromNotes(rawNotes: string): Promise<Array<{ title: string; description: string; category: string; estimatedMinutes: number; priority: 'normal' | 'high' | 'critical' }>> {
    try {
      const res = await fetch('/api/gemini/notes-to-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNotes }),
      });
      if (!res.ok) throw new Error('Extract failed');
      const data = await res.json();
      return data.tasks || [];
    } catch {
      // Line by line fallback
      return rawNotes
        .split('\n')
        .map((line) => line.replace(/^[-*•\d.]\s*/, '').trim())
        .filter((line) => line.length > 3)
        .slice(0, 5)
        .map((line) => ({
          title: line,
          description: 'Extracted from raw notes',
          category: 'cat-work',
          estimatedMinutes: 30,
          priority: 'normal' as const,
        }));
    }
  },
};
