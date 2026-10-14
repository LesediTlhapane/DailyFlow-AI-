import React from 'react';
import {
  Sparkles,
  Clock,
  Play,
  Zap,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { RecommendationResult, Task } from '../../types';
import { PriorityBadge } from '../common/Badge';

interface WhatShouldIDoNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: RecommendationResult | null;
  onStartFocus: (task: Task) => void;
  onPickAlternative: (task: Task) => void;
  onRefreshRecommendation: (energy: 'high' | 'medium' | 'low') => void;
  currentEnergy: 'high' | 'medium' | 'low';
  onSetEnergy: (energy: 'high' | 'medium' | 'low') => void;
}

export function WhatShouldIDoNowModal({
  isOpen,
  onClose,
  recommendation,
  onStartFocus,
  onPickAlternative,
  onRefreshRecommendation,
  currentEnergy,
  onSetEnergy,
}: WhatShouldIDoNowModalProps) {
  if (!recommendation) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Recommendation Engine">
        <div className="text-center py-8">
          <p className="text-sm text-[#64748B]">No active tasks to recommend.</p>
        </div>
      </Modal>
    );
  }

  const {
    task,
    score,
    reason,
    suggestedDuration,
    expectedOutcome,
    isIndependent,
    suggestedCheckInTime,
    alternativeTask,
    scoreBreakdown,
  } = recommendation;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="What Should I Do Now?"
      subtitle="Context-aware scheduling engine based on available time, deadlines, and cognitive load"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Energy Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
          <span className="text-xs font-semibold text-[#102A56] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Current Cognitive Energy:
          </span>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#DFE7F3]">
            {(['high', 'medium', 'low'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  onSetEnergy(lvl);
                  onRefreshRecommendation(lvl);
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all cursor-pointer ${
                  currentEnergy === lvl
                    ? 'bg-[#155EEF] text-white shadow-xs font-semibold'
                    : 'text-[#64748B] hover:text-[#102A56]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Recommendation Showcase Card */}
        <div className="p-5 rounded-2xl bg-white border-2 border-[#155EEF]/30 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF4FF] text-[#155EEF] border border-blue-200 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Best Match ({score} pts)
              </span>
              <PriorityBadge priority={task.priority} />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-mono">
              <Clock className="w-3.5 h-3.5 text-[#155EEF]" />
              <span>Suggested: {suggestedDuration} mins</span>
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#102A56] tracking-tight leading-snug">
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Reasoning Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#DFE7F3] text-xs">
            <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Why it fits now:
              </span>
              <p className="text-[#102A56] font-medium text-[11px] mt-0.5 leading-relaxed">
                {reason}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Expected outcome:
              </span>
              <p className="text-[#102A56] font-medium text-[11px] mt-0.5 leading-relaxed">
                {expectedOutcome}
              </p>
            </div>
          </div>

          {/* Actions & Check-in Target */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#DFE7F3] text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-[#0D9488] font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isIndependent ? '100% Independent' : 'Collaborative item'}
              </span>
              <span className="text-[11px] text-[#64748B]">
                Check-in target: <strong className="text-[#102A56] font-mono">{suggestedCheckInTime}</strong>
              </span>
            </div>

            <button
              onClick={() => {
                onStartFocus(task);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold text-xs shadow-sm active:scale-98 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Focus Session Now</span>
            </button>
          </div>
        </div>

        {/* Transparent Scoring Engine Breakdown */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
          <div className="text-xs font-bold text-[#102A56] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Decision Scoring Breakdown</span>
            <span className="text-[10px] text-[#155EEF] font-mono font-semibold">Transparent Multi-Factor Algorithm</span>
          </div>
          <div className="space-y-1.5">
            {scoreBreakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1 border-b border-[#DFE7F3]/60 last:border-none"
              >
                <span className="text-[#64748B]">{item.factor}</span>
                <span className="font-mono text-[#102A56] font-bold">+{item.score} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Option */}
        {alternativeTask && (
          <div className="p-3.5 rounded-xl border border-[#DFE7F3] bg-white flex items-center justify-between gap-3 shadow-xs">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Not feeling this? Alternative option:
              </span>
              <span className="text-xs font-semibold text-[#102A56] truncate block mt-0.5">
                {alternativeTask.title} ({alternativeTask.estimatedMinutes}m)
              </span>
            </div>
            <button
              onClick={() => onPickAlternative(alternativeTask)}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DFE7F3] bg-[#F8FAFC] hover:bg-[#EEF4FF] text-xs font-semibold text-[#155EEF] transition-all cursor-pointer"
            >
              <span>Switch to this</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
