import React, { useState } from 'react';
import { Plus, Clock, CornerDownLeft } from 'lucide-react';
import { Task, Category } from '../../types';

interface QuickTaskAddProps {
  categories: Category[];
  onAddTask: (task: Partial<Task>) => void;
  defaultDate?: string;
}

export function QuickTaskAdd({ categories, onAddTask, defaultDate }: QuickTaskAddProps) {
  const [title, setTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-work');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      estimatedMinutes,
      categoryId,
      priority: 'normal',
      status: 'planned',
      scheduledDate: defaultDate || new Date().toISOString().slice(0, 10),
      isIndependent: true,
      actualMinutesSpent: 0,
      tags: [],
    });

    setTitle('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2.5 p-2 rounded-xl border border-[#DFE7F3] bg-white shadow-xs focus-within:border-[#155EEF] transition-all"
    >
      <div className="flex items-center gap-2 flex-1 min-w-[200px] px-2">
        <Plus className="w-4 h-4 text-[#155EEF] shrink-0" />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quick add a task for today... (Press Enter to save)"
          className="w-full bg-transparent text-xs sm:text-sm text-[#102A56] placeholder:text-[#94A3B8] focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 bg-[#F8FAFC] px-2.5 py-1.5 rounded-lg border border-[#DFE7F3] text-xs font-mono text-[#64748B]">
          <Clock className="w-3.5 h-3.5 text-[#155EEF]" />
          <select
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10))}
            className="bg-transparent focus:outline-none text-[#102A56] font-semibold cursor-pointer"
          >
            <option value="15">15m</option>
            <option value="25">25m</option>
            <option value="30">30m</option>
            <option value="45">45m</option>
            <option value="60">60m</option>
            <option value="90">90m</option>
          </select>
        </div>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="bg-[#F8FAFC] border border-[#DFE7F3] px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#102A56] focus:outline-none cursor-pointer max-w-[140px] truncate"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!title.trim()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#155EEF] disabled:opacity-40 text-white font-semibold text-xs hover:bg-[#104EC6] active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <span>Add</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </div>
    </form>
  );
}
