import React from 'react';
import { Clock, Play, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Task, Category } from '../../types';
import { PriorityBadge, StatusBadge } from '../common/Badge';

interface AgendaViewProps {
  tasks: Task[];
  categories: Category[];
  onSelectTask: (t: Task) => void;
  onStartFocus: (t: Task) => void;
  onToggleComplete: (t: Task) => void;
}

export function AgendaView({
  tasks,
  categories,
  onSelectTask,
  onStartFocus,
  onToggleComplete,
}: AgendaViewProps) {
  // Sort: scheduled with time first, then unscheduled by priority
  const sorted = [...tasks].sort((a, b) => {
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    const prioWeight = { critical: 4, high: 3, normal: 2, low: 1 };
    return (prioWeight[b.priority] || 0) - (prioWeight[a.priority] || 0);
  });

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <div className="space-y-2.5">
      {sorted.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#DFE7F3] rounded-2xl bg-white text-xs text-[#64748B]">
          No tasks scheduled for today yet.
        </div>
      ) : (
        sorted.map((task) => {
          const cat = getCategory(task.categoryId);
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
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {cat && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#102A56] border border-[#DFE7F3]">
                        {cat.name}
                      </span>
                    )}
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />

                    {task.isIndependent && (
                      <span className="text-[10px] text-[#0D9488] flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3 h-3" /> Independent
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
                </div>
              </div>

              {/* Time & Action Controls */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-mono text-[#64748B]">
                    <Clock className="w-3.5 h-3.5 text-[#155EEF]" />
                    <span>
                      {task.startTime ? `${task.startTime} • ` : ''}
                      {task.estimatedMinutes}m est.
                    </span>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF4FF] border border-[#DFE7F3] text-[#155EEF] text-xs font-semibold hover:bg-[#E0EAFF] active:scale-95 transition-all cursor-pointer"
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
  );
}
