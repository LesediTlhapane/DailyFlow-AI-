import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  AlertTriangle,
  Coffee,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Task, CalendarCommitment, Category, UserSettings } from '../../types';
import { parseMinutesFromTimeString } from '../../utils/scoring';
import { PriorityBadge } from '../common/Badge';

interface CalendarViewProps {
  tasks: Task[];
  commitments: CalendarCommitment[];
  categories: Category[];
  settings: UserSettings;
  onSelectTask: (t: Task) => void;
  onAddTask: (t: Partial<Task>) => void;
  onAddCommitment: (c: CalendarCommitment) => void;
}

export function CalendarView({
  tasks,
  commitments,
  categories,
  settings,
  onSelectTask,
  onAddTask,
  onAddCommitment,
}: CalendarViewProps) {
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddCommitmentModal, setShowAddCommitmentModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStartTime, setNewStartTime] = useState('11:00');
  const [newEndTime, setNewEndTime] = useState('12:00');
  const [newIsFixed, setNewIsFixed] = useState(true);
  const [newIsBreak, setNewIsBreak] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState('cat-work');

  // Format date string YYYY-MM-DD
  const toDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const selectedDateStr = toDateStr(selectedDate);

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(selectedDate);
    if (viewType === 'day') d.setDate(d.getDate() - 1);
    else if (viewType === 'week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setSelectedDate(d);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    if (viewType === 'day') d.setDate(d.getDate() + 1);
    else if (viewType === 'week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Compute days in current week view (starting Monday)
  const getWeekDays = () => {
    const curr = new Date(selectedDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  // Check if day is overloaded (> 8 hours scheduled)
  const isDayOverloaded = (dateStr: string) => {
    const dayTasks = tasks.filter((t) => t.scheduledDate === dateStr);
    const dayCommitments = commitments.filter((c) => c.date === dateStr);

    const taskMinutes = dayTasks.reduce((s, t) => s + (t.estimatedMinutes || 0), 0);
    const commitmentMinutes = dayCommitments.reduce((s, c) => {
      const dur = parseMinutesFromTimeString(c.endTime) - parseMinutesFromTimeString(c.startTime);
      return s + Math.max(0, dur);
    }, 0);

    return taskMinutes + commitmentMinutes > 480;
  };

  const handleCreateCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddCommitment({
      id: `com-${Date.now()}`,
      title: newTitle.trim(),
      categoryId: newCategoryId,
      date: selectedDateStr,
      startTime: newStartTime,
      endTime: newEndTime,
      isFixed: newIsFixed,
      isBreak: newIsBreak,
    });

    setNewTitle('');
    setShowAddCommitmentModal(false);
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6">
      {/* Calendar Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg border border-[#DFE7F3] bg-[#F8FAFC] hover:bg-[#EEF4FF] text-xs font-semibold text-[#102A56] cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-[#DFE7F3] bg-[#F8FAFC] hover:bg-[#EEF4FF] text-[#64748B] hover:text-[#102A56] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-[#DFE7F3] bg-[#F8FAFC] hover:bg-[#EEF4FF] text-[#64748B] hover:text-[#102A56] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-[#102A56] ml-2">
            {selectedDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Day / Week / Month Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F1F5F9] border border-[#DFE7F3] text-xs font-semibold">
            {(['day', 'week', 'month'] as const).map((vt) => (
              <button
                key={vt}
                onClick={() => setViewType(vt)}
                className={`px-3 py-1.5 rounded-md capitalize transition-all cursor-pointer ${
                  viewType === vt
                    ? 'bg-white text-[#155EEF] font-bold shadow-xs'
                    : 'text-[#64748B] hover:text-[#102A56]'
                }`}
              >
                {vt}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddCommitmentModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold text-xs active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Event / Block</span>
          </button>
        </div>
      </div>

      {/* Week View */}
      {viewType === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((date) => {
            const dateStr = toDateStr(date);
            const isToday = dateStr === toDateStr(new Date());
            const isSelected = dateStr === selectedDateStr;
            const dayOverloaded = isDayOverloaded(dateStr);
            const dayTasks = tasks.filter((t) => t.scheduledDate === dateStr);
            const dayCommitments = commitments.filter((c) => c.date === dateStr);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(date)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col min-h-[300px] ${
                  isSelected
                    ? 'border-[#155EEF] bg-[#EEF4FF]/40 shadow-xs ring-1 ring-[#155EEF]'
                    : isToday
                    ? 'border-[#155EEF]/50 bg-white shadow-xs'
                    : 'border-[#DFE7F3] bg-white hover:border-[#155EEF]/40'
                } ${isWeekend ? 'bg-[#F8FAFC]' : ''}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#DFE7F3] mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                      {date.toLocaleDateString([], { weekday: 'short' })}
                    </span>
                    <span
                      className={`text-base font-bold font-mono ${
                        isToday ? 'text-[#155EEF]' : 'text-[#102A56]'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  {dayOverloaded && (
                    <span
                      title="Overloaded Day (> 8 hours scheduled)"
                      className="p-1 rounded bg-rose-50 text-rose-700 border border-rose-200"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Commitments & Tasks in day */}
                <div className="flex-1 space-y-1.5 overflow-y-auto">
                  {/* Fixed Commitments */}
                  {dayCommitments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-2 rounded-lg text-[11px] border leading-snug ${
                        c.isBreak
                          ? 'bg-amber-50 border-amber-200 text-amber-900 border-l-2 border-l-amber-500'
                          : 'bg-[#F8FAFC] border-[#DFE7F3] text-[#102A56] border-l-2 border-l-[#155EEF]'
                      }`}
                    >
                      <div className="font-mono text-[9px] text-[#64748B]">
                        {c.startTime} - {c.endTime}
                      </div>
                      <div className="font-semibold truncate">{c.title}</div>
                    </div>
                  ))}

                  {/* Tasks */}
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTask(t);
                      }}
                      className={`p-2 rounded-lg text-[11px] border bg-white border-[#DFE7F3] transition-all hover:border-[#155EEF] ${
                        t.status === 'completed' ? 'opacity-60 line-through' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] text-[#64748B] font-mono mb-0.5">
                        <span>{t.startTime || `${t.estimatedMinutes}m`}</span>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <div className="font-semibold text-[#102A56] truncate">{t.title}</div>
                    </div>
                  ))}

                  {dayCommitments.length === 0 && dayTasks.length === 0 && (
                    <div className="text-center py-6 text-[11px] text-[#94A3B8]">
                      {isWeekend && settings.weekendPolicy === 'rest_first'
                        ? 'Protected Rest'
                        : 'No events scheduled'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {viewType === 'day' && (
        <div className="border border-[#DFE7F3] rounded-2xl bg-white p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE7F3]">
            <h3 className="text-base font-bold text-[#102A56]">
              Schedule for {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            {isDayOverloaded(selectedDateStr) && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> Overloaded Day (&gt; 8 hours)
              </span>
            )}
          </div>

          <div className="space-y-2">
            {commitments
              .filter((c) => c.date === selectedDateStr)
              .map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-[#155EEF] font-bold mr-2">{c.startTime} - {c.endTime}</span>
                    <span className="font-semibold text-[#102A56]">{c.title}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white border border-[#DFE7F3] text-[#155EEF]">
                    {c.isFixed ? 'Fixed Meeting' : 'Block'}
                  </span>
                </div>
              ))}

            {tasks
              .filter((t) => t.scheduledDate === selectedDateStr)
              .map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t)}
                  className="p-3.5 rounded-xl border border-[#DFE7F3] bg-white hover:border-[#155EEF] text-xs flex items-center justify-between cursor-pointer shadow-xs"
                >
                  <div>
                    <span className="font-mono text-[#155EEF] font-bold mr-2">
                      {t.startTime ? `${t.startTime} (${t.estimatedMinutes}m)` : `${t.estimatedMinutes}m flex`}
                    </span>
                    <span className="font-semibold text-[#102A56]">{t.title}</span>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Month View Grid */}
      {viewType === 'month' && (
        <div className="border border-[#DFE7F3] rounded-2xl bg-white p-4 sm:p-6 shadow-xs">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#64748B] pb-2 uppercase tracking-wider">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => {
              const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i - 2);
              const dStr = toDateStr(d);
              const dayTasks = tasks.filter((t) => t.scheduledDate === dStr);
              const dayComms = commitments.filter((c) => c.date === dStr);
              const isCurrMonth = d.getMonth() === selectedDate.getMonth();

              return (
                <div
                  key={dStr}
                  onClick={() => setSelectedDate(d)}
                  className={`p-2.5 rounded-xl border min-h-[75px] text-xs cursor-pointer transition-all ${
                    dStr === toDateStr(new Date())
                      ? 'border-[#155EEF] bg-[#EEF4FF]'
                      : 'border-[#DFE7F3] bg-white hover:bg-[#F8FAFC]'
                  } ${isCurrMonth ? 'text-[#102A56]' : 'text-[#CBD5E1] opacity-50'}`}
                >
                  <div className="font-bold font-mono text-[11px] mb-1">{d.getDate()}</div>
                  {dayTasks.length > 0 && (
                    <div className="text-[10px] font-mono text-[#155EEF] font-semibold">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </div>
                  )}
                  {dayComms.length > 0 && (
                    <div className="text-[9px] font-mono text-[#64748B]">
                      {dayComms.length} {dayComms.length === 1 ? 'event' : 'events'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add Commitment / Fixed Block */}
      {showAddCommitmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border border-[#DFE7F3] bg-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-[#102A56]">
            <h3 className="text-base font-bold text-[#102A56]">Add Calendar Event / Block</h3>
            <form onSubmit={handleCreateCommitment} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Team Sprint Review or Protected Deep Work Block"
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] focus:outline-none focus:border-[#155EEF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={newIsFixed}
                    onChange={(e) => setNewIsFixed(e.target.checked)}
                    className="rounded text-[#155EEF]"
                  />
                  <span>Fixed Meeting (Cannot move)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={newIsBreak}
                    onChange={(e) => setNewIsBreak(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span>Meal / Recovery Break</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE7F3]">
                <button
                  type="button"
                  onClick={() => setShowAddCommitmentModal(false)}
                  className="px-4 py-2 rounded-xl text-[#64748B] hover:bg-[#F8FAFC] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold transition-all cursor-pointer shadow-xs"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
