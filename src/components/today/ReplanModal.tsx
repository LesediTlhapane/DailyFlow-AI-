import React, { useState } from 'react';
import { Calendar, Clock, RefreshCw, Check, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Task, CalendarCommitment } from '../../types';
import { GeminiService } from '../../services/gemini';
import { useToast } from '../common/Toast';

interface ReplanModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  commitments: CalendarCommitment[];
  workHours: { start: string; end: string };
  onApplySchedule: (updatedTasks: Task[]) => void;
}

export function ReplanModal({
  isOpen,
  onClose,
  tasks,
  commitments,
  workHours,
  onApplySchedule,
}: ReplanModalProps) {
  const { showToast } = useToast();
  const [energyLevel, setEnergyLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<
    Array<{ taskId: string; title: string; startTime: string; endTime: string; reason: string }>
  >([]);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const plan = await GeminiService.replanDay(tasks, commitments, workHours, energyLevel);
      setProposal(plan);
    } catch (e: any) {
      showToast('Replan error', e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    const updated = tasks.map((t) => {
      const item = proposal.find((p) => p.taskId === t.id);
      if (item) {
        return {
          ...t,
          startTime: item.startTime,
          endTime: item.endTime,
          status: (t.status === 'inbox' ? 'planned' : t.status) as any,
        };
      }
      return t;
    });

    onApplySchedule(updated);
    showToast('Day Replanned', 'Your schedule has been realistically paced with buffers.', 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Replan Today's Schedule"
      subtitle="Rebalance commitments with realistic cognitive buffers, protected breaks, and zero meeting conflicts"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Configuration */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#102A56]">Desired Pacing & Energy:</span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#DFE7F3]">
              {(['high', 'medium', 'low'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setEnergyLevel(lvl)}
                  className={`px-3 py-1 rounded text-xs capitalize font-medium transition-all cursor-pointer ${
                    energyLevel === lvl
                      ? 'bg-[#155EEF] text-white font-bold'
                      : 'text-[#64748B] hover:text-[#102A56]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-[#64748B] leading-relaxed">
            Our optimizer checks all fixed calendar meetings ({commitments.filter((c) => c.isFixed).length} fixed events)
            and spaces flexible tasks with 10–15 min cognitive recovery buffers.
          </p>

          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white hover:bg-[#EEF4FF] border border-[#DFE7F3] text-xs font-semibold text-[#102A56] transition-all cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 text-[#155EEF] animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#155EEF]" />
            )}
            <span>{proposal.length > 0 ? 'Regenerate Proposed Timeline' : 'Generate Optimized Timeline'}</span>
          </button>
        </div>

        {/* Proposals List */}
        {proposal.length > 0 && (
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-[#64748B] px-1">
              Proposed Schedule Slots:
            </div>
            {proposal.map((slot, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-[#DFE7F3] bg-white flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-[#102A56] truncate">{slot.title}</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">{slot.reason}</div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 font-mono text-[#155EEF] bg-[#EEF4FF] px-2 py-1 rounded-lg border border-blue-200 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {slot.startTime} – {slot.endTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Footer */}
        {proposal.length > 0 && (
          <div className="pt-3 border-t border-[#DFE7F3] flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Apply to Today</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
