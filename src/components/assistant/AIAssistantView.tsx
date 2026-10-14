import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RotateCw,
  Plus,
  FileText,
  User,
} from 'lucide-react';
import { Task, CalendarCommitment, Goal, UserSettings } from '../../types';
import { GeminiService, ChatMessage } from '../../services/gemini';
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
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${settings.name}. I am DayFlow AI, your Personal Chief of Staff. I have live access to your ${tasks.filter((t) => t.status !== 'completed').length} active tasks, ${commitments.length} calendar events, and ${goals.length} strategic goals. How can I help structure your time and focus right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick Action Prompts
  const quickPrompts = [
    'I have 30 minutes free. What can I accomplish?',
    'Plan my day around my existing meetings.',
    'I am waiting for feedback. What independent work can I do?',
    'I have too much planned today. Help me simplify it.',
    'Break down my AI mentoring avatar goal into 3 concrete tasks.',
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

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await GeminiService.sendChatMessage(
        text,
        { tasks, commitments, goals, settings },
        history
      );

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposedTasks: response.proposedTasks,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] border border-[#DFE7F3] rounded-2xl bg-white overflow-hidden shadow-xs">
      {/* Top Chief of Staff Header */}
      <div className="px-6 py-4 border-b border-[#DFE7F3] bg-[#F8FAFC] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#EEF4FF] text-[#155EEF] border border-[#DFE7F3]">
            <Bot className="w-5 h-5 text-[#155EEF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#102A56]">DayFlow Chief of Staff</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF4FF] text-[#155EEF] border border-blue-200">
                Connected
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">Context-aware of your live schedule, blockers, and cognitive rhythm</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#F8FAFC]/50">
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
                    ? 'bg-[#EEF4FF] text-[#155EEF] border border-[#DFE7F3]'
                    : 'bg-white text-[#155EEF] border border-[#DFE7F3] shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#155EEF] text-white font-medium rounded-tr-sm'
                    : 'bg-white border border-[#DFE7F3] text-[#102A56] rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Proposed Tasks Confirmation Block */}
                {msg.proposedTasks && msg.proposedTasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#DFE7F3] space-y-2">
                    <span className="text-[11px] font-bold text-[#155EEF] uppercase tracking-wider block">
                      Proposed Tasks for Your Review:
                    </span>
                    {msg.proposedTasks.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-[#102A56]">{t.title}</span>
                          <span className="text-[#64748B] text-[11px] ml-2 font-mono">
                            ({t.estimatedMinutes || 30}m)
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            onAddTasks([t]);
                            showToast('Added', `Task "${t.title}" added to schedule.`, 'success');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 font-mono text-right ${
                    isUser ? 'text-blue-100' : 'text-[#94A3B8]'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#64748B] p-3 rounded-2xl bg-white border border-[#DFE7F3] max-w-xs shadow-xs">
            <RotateCw className="w-4 h-4 animate-spin text-[#155EEF]" />
            <span>Chief of Staff synthesizing strategy...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-4 py-2 border-t border-[#DFE7F3] bg-white overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#155EEF]" /> Prompts:
        </span>
        {quickPrompts.map((promptText, i) => (
          <button
            key={i}
            onClick={() => handleSend(promptText)}
            className="shrink-0 px-3 py-1.5 rounded-lg border border-[#DFE7F3] bg-[#F8FAFC] hover:bg-[#EEF4FF] hover:border-[#155EEF] text-[11px] font-medium text-[#102A56] transition-all cursor-pointer whitespace-nowrap shadow-2xs"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t border-[#DFE7F3] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-[#F8FAFC] border border-[#DFE7F3] rounded-xl px-3 py-2 focus-within:border-[#155EEF] focus-within:bg-white transition-all shadow-xs"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask your Chief of Staff to plan, break down goals, or prioritize..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-[#102A56] placeholder:text-[#94A3B8] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="p-2 rounded-lg bg-[#155EEF] hover:bg-[#104EC6] disabled:opacity-40 text-white font-bold transition-all cursor-pointer shadow-xs"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
