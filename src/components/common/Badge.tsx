import React from 'react';
import { Priority, TaskStatus } from '../../types';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const configs: Record<Priority, { label: string; className: string }> = {
    critical: { label: 'Critical', className: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
    high: { label: 'High', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    normal: { label: 'Normal', className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
    low: { label: 'Low', className: 'bg-zinc-700/30 text-zinc-400 border-zinc-700/50' },
  };

  const c = configs[priority] || configs.normal;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${c.className}`}>
      {c.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const configs: Record<TaskStatus, { label: string; className: string }> = {
    inbox: { label: 'Inbox', className: 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50' },
    planned: { label: 'Planned', className: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40' },
    ready: { label: 'Ready', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    in_progress: { label: 'In Progress', className: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
    waiting: { label: 'Waiting', className: 'bg-amber-900/30 text-amber-400 border-amber-700/40' },
    blocked: { label: 'Blocked', className: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
    completed: { label: 'Done', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    cancelled: { label: 'Cancelled', className: 'bg-zinc-800/40 text-zinc-500 border-zinc-800' },
  };

  const c = configs[status] || configs.planned;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${c.className}`}>
      {c.label}
    </span>
  );
}
