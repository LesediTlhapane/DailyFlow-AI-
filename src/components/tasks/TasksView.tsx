import React, { useState } from 'react';
import {
  Plus,
  Search,
  Clock,
  Play,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { Task, Category, Goal } from '../../types';
import { PriorityBadge, StatusBadge } from '../common/Badge';

interface TasksViewProps {
  tasks: Task[];
  categories: Category[];
  goals: Goal[];
  onSelectTask: (t: Task) => void;
  onOpenCreateModal: () => void;
  onStartFocus: (t: Task) => void;
  onToggleComplete: (t: Task) => void;
  onUpdateTask: (t: Task) => void;
}

export function TasksView({
  tasks,
  categories,
  goals,
  onSelectTask,
  onOpenCreateModal,
  onStartFocus,
  onToggleComplete,
}: TasksViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)));
      if (!match) return false;
    }
    if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    return true;
  });

  const getCat = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs">
        <div>
          <div className="text-[11px] font-semibold text-[#155EEF] uppercase tracking-wider">
            All Work & Life Streams
          </div>
          <h2 className="text-xl font-bold text-[#102A56] tracking-tight mt-0.5">Master Task Registry</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Total {tasks.length} tasks • {tasks.filter((t) => t.status === 'completed').length} completed
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold text-xs active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] w-full sm:flex-1">
            <Search className="w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks, descriptions, tags..."
              className="w-full bg-transparent text-xs text-[#102A56] placeholder:text-[#94A3B8] focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-xs font-medium text-[#102A56] focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-xs font-medium text-[#102A56] focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="inbox">Inbox</option>
            <option value="planned">Planned</option>
            <option value="ready">Ready</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting">Waiting for input</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-xs font-medium text-[#102A56] focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-[#DFE7F3] rounded-2xl bg-white text-xs text-[#64748B]">
            No matching tasks found. Adjust filters or create a new task.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const cat = getCat(task.categoryId);
            const isDone = task.status === 'completed';

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-[#F8FAFC] border-[#DFE7F3] opacity-65'
                    : 'bg-white border-[#DFE7F3] hover:border-[#155EEF] hover:shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete(task);
                    }}
                    className={`mt-0.5 p-1 rounded-lg transition-colors shrink-0 ${
                      isDone
                        ? 'text-[#0D9488] bg-teal-50'
                        : 'text-[#CBD5E1] hover:text-[#0D9488]'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {cat && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#102A56] border border-[#DFE7F3]">
                          {cat.name}
                        </span>
                      )}
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />

                      {task.isIndependent && (
                        <span className="text-[10px] text-[#0D9488] flex items-center gap-1 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" /> Independent
                        </span>
                      )}

                      {task.scheduledDate && (
                        <span className="text-[10px] text-[#64748B] flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-[#155EEF]" /> {task.scheduledDate}
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-semibold tracking-tight ${
                        isDone ? 'line-through text-[#94A3B8]' : 'text-[#102A56]'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-[#64748B] mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {task.tags.map((t, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] border border-[#DFE7F3]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center text-xs">
                  <div className="text-right">
                    <div className="font-mono text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#155EEF]" />
                      <span>{task.estimatedMinutes}m est.</span>
                    </div>
                    {task.actualMinutesSpent > 0 && (
                      <div className="text-[10px] text-[#64748B] mt-0.5">
                        Logged: <strong className="text-[#102A56] font-mono">{task.actualMinutesSpent}m</strong>
                      </div>
                    )}
                  </div>

                  {!isDone && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartFocus(task);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF4FF] border border-[#DFE7F3] text-[#155EEF] font-semibold text-xs hover:bg-[#E0EAFF] transition-all cursor-pointer shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Focus</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
