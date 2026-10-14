import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  Tag,
  Target,
  Copy,
  Trash2,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Task, Category, Goal, Priority, TaskStatus } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  categories: Category[];
  goals: Goal[];
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onDuplicate?: (task: Task) => void;
  initialDate?: string;
  initialStartTime?: string;
}

export function TaskModal({
  isOpen,
  onClose,
  task,
  categories,
  goals,
  onSave,
  onDelete,
  onDuplicate,
  initialDate,
  initialStartTime,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [categoryId, setCategoryId] = useState('cat-work');
  const [subcategory, setSubcategory] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [scheduledDate, setScheduledDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [status, setStatus] = useState<TaskStatus>('planned');
  const [repeatSchedule, setRepeatSchedule] = useState<'none' | 'daily' | 'weekdays' | 'weekly'>('none');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(10);
  const [goalId, setGoalId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [actualMinutesSpent, setActualMinutesSpent] = useState(0);
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [isIndependent, setIsIndependent] = useState(true);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setNotes(task.notes || '');
      setCategoryId(task.categoryId);
      setSubcategory(task.subcategory || '');
      setEstimatedMinutes(task.estimatedMinutes);
      setScheduledDate(task.scheduledDate || '');
      setStartTime(task.startTime || '');
      setEndTime(task.endTime || '');
      setDeadline(task.deadline || '');
      setPriority(task.priority);
      setStatus(task.status);
      setRepeatSchedule(task.repeatSchedule || 'none');
      setReminderMinutesBefore(task.reminderMinutesBefore || 10);
      setGoalId(task.goalId || '');
      setTagsInput(task.tags ? task.tags.join(', ') : '');
      setActualMinutesSpent(task.actualMinutesSpent || 0);
      setDeliverableUrl(task.deliverableUrls?.[0] || '');
      setIsIndependent(task.isIndependent ?? true);
    } else {
      const today = initialDate || new Date().toISOString().slice(0, 10);
      setTitle('');
      setDescription('');
      setNotes('');
      setCategoryId(categories[0]?.id || 'cat-work');
      setSubcategory('');
      setEstimatedMinutes(30);
      setScheduledDate(today);
      setStartTime(initialStartTime || '');
      setEndTime('');
      setDeadline('');
      setPriority('normal');
      setStatus('planned');
      setRepeatSchedule('none');
      setReminderMinutesBefore(10);
      setGoalId('');
      setTagsInput('');
      setActualMinutesSpent(0);
      setDeliverableUrl('');
      setIsIndependent(true);
    }
  }, [task, isOpen, categories, initialDate, initialStartTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const deliverableUrls = deliverableUrl ? [deliverableUrl.trim()] : undefined;

    const savedTask: Task = {
      id: task?.id || `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
      categoryId,
      subcategory: subcategory.trim() || undefined,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      scheduledDate: scheduledDate || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      deadline: deadline || undefined,
      priority,
      status,
      repeatSchedule,
      reminderMinutesBefore: Number(reminderMinutesBefore) || 0,
      goalId: goalId || undefined,
      tags,
      actualMinutesSpent: Number(actualMinutesSpent) || 0,
      deliverableUrls,
      createdAt: task?.createdAt || new Date().toISOString(),
      completedAt: status === 'completed' ? task?.completedAt || new Date().toISOString() : undefined,
      postponeCount: task?.postponeCount || 0,
      isIndependent,
    };

    onSave(savedTask);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      subtitle="Define scope, realistic duration, and execution context"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Title */}
        <div>
          <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
            Task Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Benchmark Gemini 3.8 Flash latency on agent workflows"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-sm font-medium text-[#102A56] focus:outline-none focus:border-[#155EEF] placeholder:text-[#94A3B8]"
          />
        </div>

        {/* Category & Goal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] font-medium focus:outline-none focus:border-[#155EEF]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Aligned Goal (optional)
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] font-medium focus:outline-none focus:border-[#155EEF]"
            >
              <option value="">(None — Standalone task)</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-[#F8FAFC] p-1 rounded-xl border border-[#DFE7F3]">
              {(['low', 'normal', 'high', 'critical'] as Priority[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                    priority === p
                      ? p === 'critical'
                        ? 'bg-rose-50 text-rose-700 border border-rose-300'
                        : p === 'high'
                        ? 'bg-amber-50 text-amber-700 border border-amber-300'
                        : 'bg-[#EEF4FF] text-[#155EEF] border border-blue-300'
                      : 'text-[#64748B] hover:text-[#102A56]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] font-medium focus:outline-none focus:border-[#155EEF]"
            >
              <option value="inbox">Inbox</option>
              <option value="planned">Planned</option>
              <option value="ready">Ready</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting for input</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Duration & Independence */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Estimated Duration (mins)
            </label>
            <input
              type="number"
              min="5"
              max="480"
              step="5"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 30)}
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] focus:outline-none focus:border-[#155EEF] font-mono font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Actual Time Spent (mins)
            </label>
            <input
              type="number"
              min="0"
              value={actualMinutesSpent}
              onChange={(e) => setActualMinutesSpent(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] focus:outline-none focus:border-[#155EEF] font-mono font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Execution Type
            </label>
            <button
              type="button"
              onClick={() => setIsIndependent(!isIndependent)}
              className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer ${
                isIndependent
                  ? 'bg-teal-50 border-teal-200 text-[#0D9488]'
                  : 'bg-[#F8FAFC] border-[#DFE7F3] text-[#64748B]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isIndependent ? '100% Independent' : 'Needs Team / Input'}</span>
            </button>
          </div>
        </div>

        {/* Scheduling Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
          <div>
            <label className="text-[10px] font-bold text-[#64748B] block mb-1 uppercase">
              Scheduled Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#DFE7F3] bg-white text-[#102A56] text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#64748B] block mb-1 uppercase">
              Start Time (optional)
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#DFE7F3] bg-white text-[#102A56] text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#64748B] block mb-1 uppercase">
              Deadline (optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#DFE7F3] bg-white text-[#102A56] text-xs"
            />
          </div>
        </div>

        {/* Description & Acceptance Criteria */}
        <div>
          <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
            Description & Acceptance Criteria
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does 'done' look like? Links, expected outcome..."
            className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] focus:outline-none focus:border-[#155EEF] resize-none"
          />
        </div>

        {/* Tags and Deliverable Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., ai-agent, benchmark, n8n"
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] focus:outline-none focus:border-[#155EEF]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Deliverable / PR Link (optional)
            </label>
            <input
              type="url"
              value={deliverableUrl}
              onChange={(e) => setDeliverableUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] focus:outline-none focus:border-[#155EEF]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#DFE7F3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
                className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {task && onDuplicate && (
              <button
                type="button"
                onClick={() => {
                  onDuplicate(task);
                  onClose();
                }}
                className="p-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                title="Duplicate Task"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[#64748B] hover:bg-[#F8FAFC] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold transition-all cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{task ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
