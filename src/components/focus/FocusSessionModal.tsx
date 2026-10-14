import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  AlertCircle,
  Coffee,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Modal } from '../common/Modal';
import { Task, FocusSession } from '../../types';
import { playChime } from '../../utils/notifications';
import { useToast } from '../common/Toast';

interface FocusSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  tasks: Task[];
  onSelectTask: (t: Task) => void;
  onSaveSession: (session: FocusSession, updatedTask?: Task) => void;
  isActive: boolean;
  secondsRemaining: number;
  onToggleTimer: () => void;
  onResetTimer: (newDurationMinutes?: number) => void;
}

export function FocusSessionModal({
  isOpen,
  onClose,
  task,
  tasks,
  onSelectTask,
  onSaveSession,
  isActive,
  secondsRemaining,
  onToggleTimer,
  onResetTimer,
}: FocusSessionModalProps) {
  const { showToast } = useToast();
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInOutcome, setCheckInOutcome] = useState<
    'completed' | 'progress_made' | 'blocked' | 'interrupted'
  >('completed');
  const [completionNotes, setCompletionNotes] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // If timer hits zero
  useEffect(() => {
    if (secondsRemaining === 0 && isActive) {
      if (soundEnabled) playChime('complete');
      setShowCheckIn(true);
    }
  }, [secondsRemaining, isActive, soundEnabled]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleFinishEarly = () => {
    setShowCheckIn(true);
  };

  const handleConfirmCheckIn = () => {
    const elapsedMinutes = Math.max(1, Math.round((selectedDuration * 60 - secondsRemaining) / 60));

    const newSession: FocusSession = {
      id: `foc-${Date.now()}`,
      taskId: task?.id,
      taskTitle: task?.title || 'Independent Focus Session',
      targetMinutes: selectedDuration,
      actualMinutes: elapsedMinutes,
      startedAt: new Date(Date.now() - elapsedMinutes * 60000).toISOString(),
      completedAt: new Date().toISOString(),
      outcome: checkInOutcome,
      notes: completionNotes,
    };

    let updatedTask: Task | undefined;
    if (task) {
      const isComplete = checkInOutcome === 'completed';
      updatedTask = {
        ...task,
        actualMinutesSpent: (task.actualMinutesSpent || 0) + elapsedMinutes,
        status: isComplete ? 'completed' : checkInOutcome === 'blocked' ? 'blocked' : 'in_progress',
        completedAt: isComplete ? new Date().toISOString() : task.completedAt,
        completionNotes: completionNotes || task.completionNotes,
      };

      if (isComplete) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
        if (soundEnabled) playChime('complete');
        showToast('Task Completed!', `Great momentum on "${task.title}".`, 'success');
      } else {
        showToast('Focus Session Recorded', `Logged ${elapsedMinutes}m of deep work.`, 'info');
      }
    }

    onSaveSession(newSession, updatedTask);
    setShowCheckIn(false);
    onClose();
  };

  const totalSeconds = selectedDuration * 60;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalSeconds - secondsRemaining) / totalSeconds) * 100)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Focus Session & Deep Work"
      subtitle="Cognitive presence without distractions"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Linked Task Selector */}
        {!showCheckIn && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#102A56]">Focused Task:</label>
            <select
              value={task?.id || ''}
              onChange={(e) => {
                const found = tasks.find((t) => t.id === e.target.value);
                if (found) onSelectTask(found);
              }}
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-xs text-[#102A56] font-medium focus:outline-none focus:border-[#155EEF]"
            >
              <option value="">(No specific task — Freeform Deep Work)</option>
              {tasks
                .filter((t) => t.status !== 'completed')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.estimatedMinutes}m)
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Check-In Dialog Overlay if timer finished or finished early */}
        {showCheckIn ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150 p-1">
            <div className="text-center">
              <span className="inline-flex p-3 rounded-2xl bg-[#EEF4FF] text-[#155EEF] mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </span>
              <h4 className="text-base font-bold text-[#102A56]">Session Check-In</h4>
              <p className="text-xs text-[#64748B] mt-1">
                How did this focus interval go for "{task?.title || 'this session'}"?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'completed', label: 'Completed fully', icon: CheckCircle2, color: 'text-teal-600' },
                { id: 'progress_made', label: 'Made good progress', icon: Clock, color: 'text-[#155EEF]' },
                { id: 'blocked', label: 'Encountered blocker', icon: AlertCircle, color: 'text-rose-600' },
                { id: 'interrupted', label: 'Got interrupted', icon: Coffee, color: 'text-amber-600' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCheckInOutcome(opt.id as any)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                    checkInOutcome === opt.id
                      ? 'border-[#155EEF] bg-[#EEF4FF] shadow-xs'
                      : 'border-[#DFE7F3] bg-[#F8FAFC] hover:bg-white'
                  }`}
                >
                  <opt.icon className={`w-4 h-4 ${opt.color}`} />
                  <span className="font-semibold text-[11px] text-[#102A56]">{opt.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                Notes or Next Step (optional):
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Key insights, test results, or what to resume next..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-xs text-[#102A56] focus:outline-none focus:border-[#155EEF] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCheckIn(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC]"
              >
                Back to Timer
              </button>
              <button
                onClick={handleConfirmCheckIn}
                className="px-4 py-2 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                Save & Update Task
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Circular Timer Display */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative flex items-center justify-center w-52 h-52 rounded-full border-4 border-[#DFE7F3] bg-[#F8FAFC] shadow-inner">
                {/* SVG Progress Circle */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="104"
                    cy="104"
                    r="98"
                    stroke="#155EEF"
                    strokeWidth="8"
                    className="transition-all duration-500 ease-linear"
                    strokeDasharray={2 * Math.PI * 98}
                    strokeDashoffset={2 * Math.PI * 98 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="flex flex-col items-center justify-center text-center z-10">
                  <div className="text-4xl font-extrabold font-mono tracking-tight text-[#102A56]">
                    {formatTime(secondsRemaining)}
                  </div>
                  <div className="text-xs text-[#64748B] font-medium mt-1">
                    {isActive ? 'Session Active' : 'Paused / Ready'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Duration Buttons */}
            <div className="flex items-center justify-center gap-1.5">
              {[15, 25, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setSelectedDuration(mins);
                    onResetTimer(mins);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedDuration === mins
                      ? 'bg-[#155EEF] text-white shadow-xs'
                      : 'border border-[#DFE7F3] bg-white text-[#64748B] hover:text-[#102A56] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Primary Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onResetTimer(selectedDuration)}
                title="Reset"
                className="p-3 rounded-xl border border-[#DFE7F3] bg-white hover:bg-[#F8FAFC] text-[#64748B] transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={onToggleTimer}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>{secondsRemaining < selectedDuration * 60 ? 'Resume' : 'Start Focus'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleFinishEarly}
                title="Check In & Complete"
                className="p-3 rounded-xl border border-[#DFE7F3] bg-white hover:bg-teal-50 text-[#0D9488] transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
                className="p-3 rounded-xl border border-[#DFE7F3] bg-white hover:bg-[#F8FAFC] text-[#64748B] transition-all cursor-pointer"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#155EEF]" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
