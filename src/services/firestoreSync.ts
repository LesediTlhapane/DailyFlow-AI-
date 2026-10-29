import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  handleFirestoreError,
} from './firebase';
import {
  Task,
  CalendarCommitment,
  Goal,
  WaitingItem,
  OpportunityBacklogItem,
  FocusSession,
  DailyReflection,
  UserSettings,
} from '../types';

export interface ChatMemoryRecord {
  userId: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    proposedTasks?: any[];
  }>;
  memorySummary?: string;
  updatedAt: string;
}

export const FirestoreSyncService = {
  // --- Tasks ---
  async loadTasks(userId: string): Promise<Task[]> {
    try {
      const q = query(collection(db, 'tasks'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list: Task[] = [];
      snap.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as Task);
      });
      return list;
    } catch (e) {
      console.error('Failed to load user tasks from Firestore:', e);
      return [];
    }
  },

  async saveTask(userId: string, task: Task): Promise<void> {
    try {
      const taskDocRef = doc(db, 'tasks', task.id);
      await setDoc(taskDocRef, {
        ...task,
        userId,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.error('Error saving task to Firestore:', e);
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (e) {
      console.error('Error deleting task from Firestore:', e);
    }
  },

  // --- Commitments ---
  async loadCommitments(userId: string): Promise<CalendarCommitment[]> {
    try {
      const q = query(collection(db, 'commitments'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list: CalendarCommitment[] = [];
      snap.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as CalendarCommitment);
      });
      return list;
    } catch (e) {
      console.error('Failed to load user commitments:', e);
      return [];
    }
  },

  async saveCommitment(userId: string, c: CalendarCommitment): Promise<void> {
    try {
      await setDoc(doc(db, 'commitments', c.id), { ...c, userId }, { merge: true });
    } catch (e) {
      console.error('Error saving commitment to Firestore:', e);
    }
  },

  // --- Goals ---
  async loadGoals(userId: string): Promise<Goal[]> {
    try {
      const q = query(collection(db, 'goals'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list: Goal[] = [];
      snap.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as Goal);
      });
      return list;
    } catch (e) {
      console.error('Failed to load user goals:', e);
      return [];
    }
  },

  async saveGoals(userId: string, goals: Goal[]): Promise<void> {
    try {
      for (const g of goals) {
        await setDoc(doc(db, 'goals', g.id), { ...g, userId }, { merge: true });
      }
    } catch (e) {
      console.error('Error batch saving goals:', e);
    }
  },

  // --- Waiting Items ---
  async loadWaiting(userId: string): Promise<WaitingItem[]> {
    try {
      const q = query(collection(db, 'waiting'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list: WaitingItem[] = [];
      snap.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as WaitingItem);
      });
      return list;
    } catch (e) {
      console.error('Failed to load waiting items:', e);
      return [];
    }
  },

  async saveWaiting(userId: string, items: WaitingItem[]): Promise<void> {
    try {
      for (const item of items) {
        await setDoc(doc(db, 'waiting', item.id), { ...item, userId }, { merge: true });
      }
    } catch (e) {
      console.error('Error saving waiting items:', e);
    }
  },

  // --- Backlog ---
  async loadBacklog(userId: string): Promise<OpportunityBacklogItem[]> {
    try {
      const q = query(collection(db, 'backlog'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list: OpportunityBacklogItem[] = [];
      snap.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as OpportunityBacklogItem);
      });
      return list;
    } catch (e) {
      console.error('Failed to load backlog:', e);
      return [];
    }
  },

  async saveBacklog(userId: string, items: OpportunityBacklogItem[]): Promise<void> {
    try {
      for (const b of items) {
        await setDoc(doc(db, 'backlog', b.id), { ...b, userId }, { merge: true });
      }
    } catch (e) {
      console.error('Error saving backlog items:', e);
    }
  },

  // --- Focus Sessions ---
  async loadFocusSessions(userId: string): Promise<FocusSession[]> {
    try {
      const q = query(collection(db, 'focusSessions'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list: FocusSession[] = [];
      snap.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as FocusSession);
      });
      return list;
    } catch (e) {
      console.error('Failed to load focus sessions:', e);
      return [];
    }
  },

  async saveFocusSession(userId: string, session: FocusSession): Promise<void> {
    try {
      await setDoc(doc(db, 'focusSessions', session.id), { ...session, userId }, { merge: true });
    } catch (e) {
      console.error('Error saving focus session:', e);
    }
  },

  // --- AI Companion Memory ---
  async loadChatMemory(userId: string): Promise<ChatMemoryRecord | null> {
    try {
      const snap = await getDoc(doc(db, 'chatMemory', userId));
      if (snap.exists()) {
        return snap.data() as ChatMemoryRecord;
      }
      return null;
    } catch (e) {
      console.error('Failed to load AI companion memory:', e);
      return null;
    }
  },

  async saveChatMemory(
    userId: string,
    messages: Array<any>,
    memorySummary?: string
  ): Promise<void> {
    try {
      const memDoc = doc(db, 'chatMemory', userId);
      // Keep most recent 50 messages to stay lightweight and fast
      const trimmed = messages.slice(-50);
      await setDoc(memDoc, {
        userId,
        messages: trimmed,
        memorySummary: memorySummary || '',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.error('Failed to persist AI companion memory:', e);
    }
  },

  // --- User Custom Settings Sync ---
  async loadUserSettings(userId: string): Promise<Partial<UserSettings> | null> {
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists() && snap.data()?.preferences) {
        return snap.data().preferences as Partial<UserSettings>;
      }
      return null;
    } catch (e) {
      console.error('Failed to load user settings:', e);
      return null;
    }
  },

  async saveUserSettings(userId: string, preferences: Partial<UserSettings>): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userId), { preferences }, { merge: true });
    } catch (e) {
      console.error('Failed to save user settings:', e);
    }
  },
};
