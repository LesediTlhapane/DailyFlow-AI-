import React from 'react';
import {
  Clock,
  AlertTriangle,
  Play,
  CheckCircle2,
  Coffee,
  Calendar,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { Task, CalendarCommitment, Category } from '../../types';
import { parseMinutesFromTimeString } from '../../utils/scoring';

interface TimelineViewProps {
  tasks: Task[];
  commitments: CalendarCommitment[];
  categories: Category[];
  currentTime: Date;
  onSelectTask: (t: Task) => void;
  onStartFocus: (t: Task) => void;
  onToggleComplete: (t: Task) => void;
}

interface PositionedItem<T> {
  item: T;
  startMin: number;
  endMin: number;
  topPx: number;
  heightPx: number;
  colIndex: number;
  totalCols: number;
}

export function TimelineView({
  tasks,
  commitments,
  categories,
  currentTime,
  onSelectTask,
  onStartFocus,
  onToggleComplete,
}: TimelineViewProps) {
  // Hours from 08:00 to 20:00 (12 intervals, 13 hour marks)
  const startHour = 8;
  const endHour = 20;
  const totalHours = endHour - startHour; // 12 hours
  const hourHeight = 68; // 68px per hour = ~1.13px per minute
  const totalHeight = totalHours * hourHeight; // 816px

  const timelineStartMinutes = startHour * 60; // 480 mins (08:00)
  const timelineTotalMinutes = totalHours * 60; // 720 mins (12 hrs)

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Position calculation in pixels
  const getTopPx = (minutes: number) => {
    const clamped = Math.max(0, Math.min(timelineTotalMinutes, minutes - timelineStartMinutes));
    return (clamped / timelineTotalMinutes) * totalHeight;
  };

  const getHeightPx = (durationMinutes: number) => {
    const raw = (durationMinutes / timelineTotalMinutes) * totalHeight;
    return Math.max(26, raw - 2);
  };

  const getCatColor = (catId: string) => {
    const found = categories.find((c) => c.id === catId);
    return found?.color || '#EA580C';
  };

  // Helper to layout items with collision detection into columns
  const layoutItems = <T extends { id: string }>(
    rawItems: T[],
    getInterval: (item: T) => { startMin: number; endMin: number }
  ): PositionedItem<T>[] => {
    if (rawItems.length === 0) return [];

    const mapped = rawItems.map((item) => {
      const { startMin, endMin } = getInterval(item);
      const topPx = getTopPx(startMin);
      const heightPx = getHeightPx(endMin - startMin);
      return { item, startMin, endMin, topPx, heightPx, colIndex: 0, totalCols: 1 };
    });

    // Sort chronologically
    mapped.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

    // Group overlapping items
    const clusters: PositionedItem<T>[][] = [];
    let currentCluster: PositionedItem<T>[] = [];
    let clusterMaxEnd = -1;

    for (const item of mapped) {
      if (currentCluster.length === 0) {
        currentCluster.push(item);
        clusterMaxEnd = item.endMin;
      } else if (item.startMin < clusterMaxEnd) {
        currentCluster.push(item);
        clusterMaxEnd = Math.max(clusterMaxEnd, item.endMin);
      } else {
        clusters.push(currentCluster);
        currentCluster = [item];
        clusterMaxEnd = item.endMin;
      }
    }
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    // Assign column indices within each cluster
    for (const cluster of clusters) {
      const columns: PositionedItem<T>[][] = [];
      for (const item of cluster) {
        let placed = false;
        for (let colIdx = 0; colIdx < columns.length; colIdx++) {
          const lastInCol = columns[colIdx][columns[colIdx].length - 1];
          if (lastInCol.endMin <= item.startMin) {
            item.colIndex = colIdx;
            columns[colIdx].push(item);
            placed = true;
            break;
          }
        }
        if (!placed) {
          item.colIndex = columns.length;
          columns.push([item]);
        }
      }
      const totalCols = columns.length;
      for (const item of cluster) {
        item.totalCols = totalCols;
      }
    }

    return mapped;
  };

  // 1. Layout Calendar Commitments
  const positionedCommitments = layoutItems(commitments, (c) => {
    const startMin = parseMinutesFromTimeString(c.startTime);
    const endMin = parseMinutesFromTimeString(c.endTime);
    return { startMin, endMin: Math.max(startMin + 20, endMin) };
  });

  // 2. Filter & Layout Scheduled Tasks (Tasks with startTime)
  const scheduledTasks = tasks.filter((t) => Boolean(t.startTime));
  const positionedTasks = layoutItems(scheduledTasks, (t) => {
    const startMin = parseMinutesFromTimeString(t.startTime!);
    const dur = Math.max(15, t.estimatedMinutes || 30);
    return { startMin, endMin: startMin + dur };
  });

  // 3. Unscheduled Tasks (Tasks for today with no fixed hour)
  const unscheduledTasks = tasks.filter((t) => !t.startTime && t.status !== 'completed');

  // Detect conflict between a task and any fixed commitment
  const isConflicting = (task: Task) => {
    if (!task.startTime) return false;
    const taskStart = parseMinutesFromTimeString(task.startTime);
    const taskEnd = task.endTime
      ? parseMinutesFromTimeString(task.endTime)
      : taskStart + (task.estimatedMinutes || 30);

    return commitments.some((c) => {
      if (!c.isFixed) return false;
      const cStart = parseMinutesFromTimeString(c.startTime);
      const cEnd = parseMinutesFromTimeString(c.endTime);
      return Math.max(taskStart, cStart) < Math.min(taskEnd, cEnd);
    });
  };

  const hours = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

  return (
    <div className="space-y-4">
      {/* Timeline Main Container */}
      <div className="relative border border-[#DFE7F3] rounded-2xl bg-white overflow-hidden shadow-xs">
        {/* Track Column Headers */}
        <div className="grid grid-cols-12 border-b border-[#DFE7F3] bg-[#F8FAFC] py-2 px-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider select-none">
          <div className="col-span-2 sm:col-span-1 pl-1">Time</div>
          <div className="col-span-5 sm:col-span-5 flex items-center gap-1.5 text-[#475569]">
            <Calendar className="w-3 h-3 text-[#EA580C]" />
            <span>Calendar & Events</span>
          </div>
          <div className="col-span-5 sm:col-span-6 flex items-center gap-1.5 text-[#475569]">
            <CheckSquare className="w-3 h-3 text-[#EA580C]" />
            <span>Scheduled Focus Tasks</span>
          </div>
        </div>

        {/* Scrollable Timeline Grid */}
        <div className="overflow-x-auto p-2 sm:p-4">
          <div className="min-w-[640px] relative" style={{ height: `${totalHeight}px` }}>
            {/* Hour Grid Lines */}
            {hours.map((hour, idx) => {
              const topPx = idx * hourHeight;
              return (
                <div
                  key={hour}
                  className="absolute left-0 right-0 flex items-center border-t border-[#F1F5F9] text-xs pointer-events-none"
                  style={{ top: `${topPx}px` }}
                >
                  <span className="font-mono text-[11px] text-[#94A3B8] w-14 shrink-0 font-medium select-none">
                    {String(hour).padStart(2, '0')}:00
                  </span>
                  <div className="flex-1 h-px bg-transparent" />
                </div>
              );
            })}

            {/* Current Time Indicator Line */}
            {currentMinutes >= timelineStartMinutes && currentMinutes <= timelineStartMinutes + timelineTotalMinutes && (
              <div
                className="absolute left-14 right-0 z-30 flex items-center pointer-events-none transition-all duration-1000"
                style={{ top: `${getTopPx(currentMinutes)}px` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] -ml-1.5 shadow-xs" />
                <div className="flex-1 h-[2px] bg-[#EA580C]" />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EA580C] text-white font-bold ml-2 shadow-xs">
                  NOW
                </span>
              </div>
            )}

            {/* TRACK 1: Calendar Commitments (Lane: Left 4.5rem to ~48%) */}
            {positionedCommitments.map(({ item: c, topPx, heightPx, colIndex, totalCols }) => {
              const color = getCatColor(c.categoryId);
              // Width and left offset within Track 1
              const trackWidth = 44; // percent of container
              const colWidth = (trackWidth - 1) / totalCols;
              const leftOffset = 4.2 + colIndex * colWidth; // in rem / %

              return (
                <div
                  key={c.id}
                  className={`absolute rounded-xl p-2 border text-xs shadow-xs z-10 transition-all overflow-hidden flex flex-col justify-between ${
                    c.isBreak
                      ? 'bg-amber-50/90 border-amber-200 text-amber-900 border-l-4 border-l-amber-500'
                      : 'bg-[#F8FAFC] border-[#DFE7F3] border-l-4 text-[#102A56]'
                  }`}
                  style={{
                    top: `${topPx}px`,
                    height: `${heightPx}px`,
                    left: `${leftOffset}%`,
                    width: `${colWidth - 0.8}%`,
                    borderLeftColor: c.isBreak ? undefined : color,
                  }}
                  title={`${c.title} (${c.startTime} - ${c.endTime})`}
                >
                  <div className="flex items-center justify-between gap-1 text-[10px] shrink-0 leading-tight">
                    <span className="font-mono text-[#64748B] font-semibold truncate">
                      {c.startTime}–{c.endTime}
                    </span>
                    {c.isBreak ? (
                      <span className="flex items-center gap-0.5 text-amber-700 font-bold shrink-0">
                        <Coffee className="w-2.5 h-2.5" /> Break
                      </span>
                    ) : (
                      <span className="px-1 py-0.2 rounded bg-white text-[#EA580C] border border-[#DFE7F3] font-semibold shrink-0">
                        {c.isFixed ? 'Fixed' : 'Block'}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-[11px] truncate mt-0.5 text-[#102A56] leading-tight">
                    {c.title}
                  </div>
                </div>
              );
            })}

            {/* TRACK 2: Focus Tasks (Lane: Left ~50% to right 1rem) */}
            {positionedTasks.map(({ item: t, topPx, heightPx, colIndex, totalCols }) => {
              const conflict = isConflicting(t);
              const isCompleted = t.status === 'completed';
              const isCompact = heightPx < 44;

              // Track 2 spans from 50% to 98%
              const trackWidth = 47; // percent of container
              const colWidth = (trackWidth - 1) / totalCols;
              const leftOffset = 50 + colIndex * colWidth;

              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t)}
                  className={`absolute rounded-xl border text-xs shadow-xs transition-all cursor-pointer group hover:border-[#EA580C] hover:shadow-sm hover:z-20 overflow-hidden ${
                    isCompleted
                      ? 'bg-[#F8FAFC] border-[#DFE7F3] opacity-65'
                      : conflict
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-white border-[#DFE7F3]'
                  }`}
                  style={{
                    top: `${topPx}px`,
                    height: `${heightPx}px`,
                    left: `${leftOffset}%`,
                    width: `${colWidth - 0.8}%`,
                  }}
                  title={`${t.title} (${t.startTime}, ${t.estimatedMinutes}m)`}
                >
                  {isCompact ? (
                    /* Compact Single-Row Layout for short 15-30m tasks so text never overlaps */
                    <div className="flex items-center justify-between gap-1.5 h-full px-2 py-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-[10px] text-[#EA580C] font-bold shrink-0">
                          {t.startTime}
                        </span>
                        <span
                          className={`font-semibold text-xs truncate ${
                            isCompleted ? 'line-through text-[#94A3B8]' : 'text-[#102A56]'
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {conflict && (
                          <span title="Overlaps calendar event">
                            <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(t);
                          }}
                          className="p-0.5 rounded text-[#94A3B8] hover:text-teal-600 transition-colors"
                          title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${isCompleted ? 'text-teal-600 fill-teal-600/20' : ''}`}
                          />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Standard Two-Row Layout for longer tasks */
                    <div className="flex flex-col justify-between h-full p-2 leading-tight">
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <div className="flex items-center gap-1 font-mono text-[#64748B] shrink-0 font-medium">
                          <Clock className="w-3 h-3 text-[#EA580C]" />
                          <span>
                            {t.startTime} ({t.estimatedMinutes}m)
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {conflict && (
                            <span className="flex items-center gap-0.5 text-rose-700 font-bold text-[9px] bg-rose-100 px-1 py-0.2 rounded border border-rose-200">
                              <AlertTriangle className="w-2.5 h-2.5 text-rose-600" /> Clash
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleComplete(t);
                            }}
                            className="p-0.5 rounded text-[#94A3B8] hover:text-teal-600 transition-colors"
                            title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                          >
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${isCompleted ? 'text-teal-600 fill-teal-600/20' : ''}`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartFocus(t);
                            }}
                            className="p-0.5 rounded text-[#94A3B8] hover:text-[#EA580C] transition-colors opacity-0 group-hover:opacity-100"
                            title="Start Focus Timer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        </div>
                      </div>

                      <div className="font-semibold text-xs truncate text-[#102A56] mt-0.5">
                        <span className={isCompleted ? 'line-through text-[#94A3B8]' : ''}>
                          {t.title}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Flexible / Unscheduled Tasks Shelf (If any tasks don't have a fixed start hour) */}
      {unscheduledTasks.length > 0 && (
        <div className="p-3.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#102A56] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
              Flexible Tasks for Today ({unscheduledTasks.length})
            </span>
            <span className="text-[11px] text-[#64748B]">Click any task to inspect or schedule</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {unscheduledTasks.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTask(t)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#DFE7F3] bg-white hover:border-[#EA580C] hover:shadow-xs text-left text-xs transition-all cursor-pointer group"
              >
                <div className="w-2 h-2 rounded-full bg-[#EA580C]" />
                <span className="font-semibold text-[#102A56] group-hover:text-[#EA580C] max-w-[200px] truncate">
                  {t.title}
                </span>
                <span className="text-[10px] font-mono text-[#64748B]">
                  {t.estimatedMinutes}m
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
