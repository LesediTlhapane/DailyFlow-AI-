import React from 'react';
import { Task, Category, Priority } from '../../types';
import { Clock, Play, CheckCircle2, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../common/Badge';

interface PriorityViewProps {
  tasks: Task[];
  categories: Category[];
  onSelectTask: (t: Task) => void;
  onStartFocus: (t: Task) => void;
  onToggleComplete: (t: Task) => void;
}

export function PriorityView({
  tasks,
  categories,
  onSelectTask,
  onStartFocus,
  onToggleComplete,
}: PriorityViewProps) {
  const tiers: { priority: Priority; label: string; headerClass: string; borderClass: string }[] = [
    {
      priority: 'critical',
      label: 'Critical Focus (Must Complete)',
      headerClass: 'text-rose-800 bg-rose-50 border-rose-200',
      borderClass: 'border-l-rose-500',
    },
    {
      priority: 'high',
      label: 'High Priority (Key Milestones)',
      headerClass: 'text-amber-800 bg-amber-50 border-amber-200',
      borderClass: 'border-l-amber-500',
    },
    {
      priority: 'normal',
      label: 'Normal / Medium (Steady Progress)',
      headerClass: 'text-[#155EEF] bg-[#EEF4FF] border-blue-200',
      borderClass: 'border-l-[#155EEF]',
    },
    {
      priority: 'low',
      label: 'Low / Optional (If Time Permits)',
      headerClass: 'text-slate-700 bg-slate-50 border-slate-200',
      borderClass: 'border-l-slate-400',
    },
  ];

  const getCat = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <div className="space-y-6">
      {tiers.map((tier) => {
        const tierTasks = tasks.filter((t) => t.priority === tier.priority);
        if (tierTasks.length === 0) return null;

        return (
          <div key={tier.priority} className="space-y-2.5">
            <div
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center justify-between ${tier.headerClass}`}
            >
              <span>{tier.label}</span>
              <span className="font-mono text-[11px] font-semibold">
                {tierTasks.length} {tierTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tierTasks.map((task) => {
                const cat = getCat(task.categoryId);
                const isDone = task.status === 'completed';

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className={`p-3.5 rounded-xl border border-l-4 transition-all cursor-pointer bg-white border-[#DFE7F3] hover:border-[#155EEF] hover:shadow-xs ${
                      tier.borderClass
                    } ${isDone ? 'opacity-65 line-through' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {cat && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#102A56] border border-[#DFE7F3]">
                            {cat.name}
                          </span>
                        )}
                        <StatusBadge status={task.status} />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(task);
                          }}
                          className={`p-1 rounded transition-colors ${
                            isDone ? 'text-[#0D9488]' : 'text-[#CBD5E1] hover:text-[#0D9488]'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        {!isDone && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartFocus(task);
                            }}
                            className="p-1 rounded text-[#155EEF] hover:bg-[#EEF4FF] transition-colors"
                            title="Focus"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h5 className="font-semibold text-xs text-[#102A56] leading-snug">
                      {task.title}
                    </h5>

                    <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2.5 pt-2 border-t border-[#DFE7F3]/70">
                      <span className="font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#155EEF]" />
                        {task.estimatedMinutes}m est.
                      </span>
                      {task.isIndependent && (
                        <span className="text-[#0D9488] text-[10px] flex items-center gap-1 font-medium">
                          <ShieldCheck className="w-3 h-3" /> Independent
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
