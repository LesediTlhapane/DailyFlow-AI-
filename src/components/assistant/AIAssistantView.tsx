import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RotateCw,
  Plus,
  User,
  Trash2,
  CloudCheck,
  Brain,
  LogIn,
} from 'lucide-react';
import { Task, CalendarCommitment, Goal, UserSettings } from '../../types';
import { GeminiService, ChatMessage } from '../../services/gemini';
import { FirestoreSyncService } from '../../services/firestoreSync';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';

interface AIAssistantViewProps {
  tasks: Task[];
  commitments: CalendarCommitment[];
  goals: Goal[];
  settings: UserSettings;
  onAddTasks: (newTasks: Partial<Task>[]) => void;
  onApplySchedule?: (tasks: Task[]) => void;
}

export function AIAssistantView({
  tasks,
  commitments,
  goals,
  settings,
  onAddTasks,
}: AIAssistantViewProps) {
  const { currentUser, userProfile, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const userName = userProfile?.displayName || settings.name || 'there';
  const defaultWelcomeMessage: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content: `Hello ${userName}. I am DayFlow AI, your Personal Chief of Staff. I have live access to your ${
      tasks.filter((t) => t.status !== 'completed').length
    } active tasks, ${commitments.length} calendar events, and ${
      goals.length
    } strategic goals. How can I help structure your time and focus right now?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultWelcomeMessage]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [memoryLoaded, setMemoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load cloud chat memory when user is signed in
  useEffect(() => {
    let isCancelled = false;
    async function loadCloudMemory() {
      if (currentUser?.uid) {
        const mem = await FirestoreSyncService.loadChatMemory(currentUser.uid);
        if (!isCancelled && mem && mem.messages && mem.messages.length > 0) {
          setMessages(mem.messages as ChatMessage[]);
          setMemoryLoaded(true);
          return;
        }
      }
      if (!isCancelled) {
        setMessages([
          {
            ...defaultWelcomeMessage,
            content: `Hello ${userName}. I am DayFlow AI, your Personal Chief of Staff. I have live access to your ${
              tasks.filter((t) => t.status !== 'completed').length
            } active tasks, ${commitments.length} calendar events, and ${
              goals.length
            } strategic goals. How can I help structure your time and focus right now?`,
          },
        ]);
        setMemoryLoaded(true);
      }
    }
    loadCloudMemory();
    return () => {
      isCancelled = true;
    };
  }, [currentUser?.uid, userName]);

  // Quick Action Prompts
  const quickPrompts = [
    'What should I focus on first today?',
    'Plan my day around my schedule and priority tasks.',
    'I have 30 minutes free. What can I accomplish?',
    'Help me break down a major goal into concrete micro-tasks.',
    'I feel overwhelmed. Help me simplify and pace my day.',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    try {
      const history = newMessages.map((m) => ({ role: m.role, content: m.content }));
      const response = await GeminiService.sendChatMessage(
        text,
        {
          tasks,
          commitments,
          goals,
          settings: {
            ...settings,
            name: userName,
            roleContext: userProfile?.roleContext || settings.roleContext,
          },
        },
        history
      );

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposedTasks: response.proposedTasks,
      };

      const finalMessages = [...newMessages, botMsg];
      setMessages(finalMessages);

      // Persist to user's private cloud memory if signed in
      if (currentUser?.uid) {
        await FirestoreSyncService.saveChatMemory(currentUser.uid, finalMessages);
      }
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearMemory = async () => {
    const reset = [defaultWelcomeMessage];
    setMessages(reset);
    if (currentUser?.uid) {
      await FirestoreSyncService.saveChatMemory(currentUser.uid, reset);
    }
    showToast('Memory Reset', 'Conversation cleared and refreshed.', 'info');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] border border-[#E2E8F0] dark:border-[#2b313d] rounded-2xl bg-white/95 dark:bg-[#161a23]/95 backdrop-blur-md overflow-hidden shadow-xs transition-colors">
      {/* Top Chief of Staff Header */}
      <div className="px-5 py-3.5 border-b border-[#E2E8F0] dark:border-[#262c37] bg-zinc-50/80 dark:bg-[#13161e]/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">
            <Bot className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">DayFlow Chief of Staff</h3>
              {currentUser ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Cloud Memory Linked
                </span>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3 h-3" /> Sign in for permanent memory
                </button>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Context-aware of your live schedule, priority tasks, and personal goals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button
              onClick={handleClearMemory}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-[#2b313d] bg-white dark:bg-[#1a1e27] hover:bg-zinc-100 dark:hover:bg-[#202531] text-zinc-500 hover:text-red-500 text-xs transition-colors cursor-pointer"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-zinc-50/40 dark:bg-[#12151c]/40">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                  isUser
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-white dark:bg-[#1c212b] text-orange-600 dark:text-orange-400 border border-zinc-200 dark:border-[#2b313d] shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium rounded-tr-sm'
                    : 'bg-white dark:bg-[#1c212b] border border-zinc-200 dark:border-[#2b313d] text-zinc-900 dark:text-zinc-100 rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Proposed Tasks Confirmation Block */}
                {msg.proposedTasks && msg.proposedTasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-[#2b313d] space-y-2">
                    <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
                      Proposed Tasks for Your Review:
                    </span>
                    {msg.proposedTasks.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-[#2b313d] bg-zinc-50 dark:bg-[#171a22] flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{t.title}</span>
                          <span className="text-zinc-500 dark:text-zinc-400 text-[11px] ml-2 font-mono">
                            ({t.estimatedMinutes || 30}m)
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            onAddTasks([t]);
                            showToast('Added', `Task "${t.title}" added to schedule.`, 'success');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 font-mono text-right ${
                    isUser ? 'text-orange-100' : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 p-3 rounded-2xl bg-white dark:bg-[#1c212b] border border-zinc-200 dark:border-[#2b313d] max-w-xs shadow-xs">
            <RotateCw className="w-4 h-4 animate-spin text-orange-500" />
            <span>Chief of Staff synthesizing strategy...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-[#262c37] bg-white dark:bg-[#161a23] overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-orange-500" /> Prompts:
        </span>
        {quickPrompts.map((promptText, i) => (
          <button
            key={i}
            onClick={() => handleSend(promptText)}
            className="shrink-0 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-[#2b313d] bg-zinc-50 dark:bg-[#1a1e27] hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-600 dark:hover:text-orange-400 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-[#262c37] bg-white dark:bg-[#161a23]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-zinc-50 dark:bg-[#1a1e27] border border-zinc-200 dark:border-[#2b313d] rounded-xl px-3 py-2 focus-within:border-orange-500 focus-within:bg-white dark:focus-within:bg-[#1c212b] transition-all shadow-xs"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask your Chief of Staff to plan, break down goals, or prioritize..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold transition-all cursor-pointer shadow-xs"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
