import React, { useState } from 'react';
import {
  Hourglass,
  Plus,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Filter,
  Trash2,
  Clock,
  Lightbulb,
} from 'lucide-react';
import { WaitingItem, OpportunityBacklogItem, Category, Task } from '../../types';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface WaitingBacklogViewProps {
  waitingItems: WaitingItem[];
  backlogItems: OpportunityBacklogItem[];
  categories: Category[];
  tasks: Task[];
  onSaveWaiting: (items: WaitingItem[]) => void;
  onSaveBacklog: (items: OpportunityBacklogItem[]) => void;
  onPromoteToTask: (opp: OpportunityBacklogItem) => void;
}

export function WaitingBacklogView({
  waitingItems,
  backlogItems,
  categories,
  onSaveWaiting,
  onSaveBacklog,
  onPromoteToTask,
}: WaitingBacklogViewProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'waiting' | 'backlog'>('waiting');
  const [durationFilter, setDurationFilter] = useState<number | null>(null);

  // New waiting item modal
  const [showAddWaiting, setShowAddWaiting] = useState(false);
  const [waitTitle, setWaitTitle] = useState('');
  const [waitOn, setWaitOn] = useState('');
  const [waitFollowUp, setWaitFollowUp] = useState('');
  const [waitCanIndependent, setWaitCanIndependent] = useState(true);
  const [waitNotes, setWaitNotes] = useState('');

  // New backlog item modal
  const [showAddBacklog, setShowAddBacklog] = useState(false);
  const [oppTitle, setOppTitle] = useState('');
  const [oppDesc, setOppDesc] = useState('');
  const [oppCatId, setOppCatId] = useState('cat-ai-research');
  const [oppMinutes, setOppMinutes] = useState(30);
  const [oppValue, setOppValue] = useState<'high' | 'medium' | 'low'>('high');

  const handleAddWaiting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitTitle.trim()) return;

    const newItem: WaitingItem = {
      id: `wait-${Date.now()}`,
      title: waitTitle.trim(),
      waitingOn: waitOn.trim() || 'Team / External',
      startedAt: new Date().toISOString(),
      expectedFollowUp: waitFollowUp || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      canWorkIndependently: waitCanIndependent,
      notes: waitNotes.trim() || undefined,
      resolved: false,
    };

    onSaveWaiting([newItem, ...waitingItems]);
    setShowAddWaiting(false);
    setWaitTitle('');
    setWaitOn('');
    setWaitNotes('');
    showToast('Waiting Item Recorded', 'DayFlow will track follow-ups and unblock you.', 'success');
  };

  const handleResolveWaiting = (id: string) => {
    const updated = waitingItems.map((w) => (w.id === id ? { ...w, resolved: !w.resolved } : w));
    onSaveWaiting(updated);
    showToast('Updated', 'Waiting status toggled.', 'info');
  };

  const handleDeleteWaiting = (id: string) => {
    onSaveWaiting(waitingItems.filter((w) => w.id !== id));
  };

  const handleAddBacklog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppTitle.trim()) return;

    const newItem: OpportunityBacklogItem = {
      id: `opp-${Date.now()}`,
      title: oppTitle.trim(),
      description: oppDesc.trim(),
      categoryId: oppCatId,
      estimatedMinutes: oppMinutes,
      expectedValue: oppValue,
      status: 'backlog',
      createdAt: new Date().toISOString(),
    };

    onSaveBacklog([newItem, ...backlogItems]);
    setShowAddBacklog(false);
    setOppTitle('');
    setOppDesc('');
    showToast('Idea Recorded', 'Opportunity added to backlog.', 'success');
  };

  const handleDeleteBacklog = (id: string) => {
    onSaveBacklog(backlogItems.filter((b) => b.id !== id));
  };

  const filteredBacklog = backlogItems.filter((b) => {
    if (durationFilter !== null && b.estimatedMinutes !== durationFilter) return false;
    return b.status === 'backlog';
  });

  const getCat = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <div className="space-y-6">
      {/* View Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs">
        <div>
          <div className="text-[11px] font-semibold text-[#155EEF] uppercase tracking-wider">
            Unblock & Opportunity Queue
          </div>
          <h2 className="text-xl font-bold text-[#102A56] tracking-tight mt-0.5">Waiting & Backlog</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Maintain independent momentum while awaiting reviews, instructions, or customer inputs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F1F5F9] border border-[#DFE7F3] text-xs font-semibold">
            <button
              onClick={() => setActiveTab('waiting')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'waiting'
                  ? 'bg-white text-[#155EEF] font-bold shadow-xs'
                  : 'text-[#64748B] hover:text-[#102A56]'
              }`}
            >
              <Hourglass className="w-3.5 h-3.5" />
              <span>Waiting ({waitingItems.filter((w) => !w.resolved).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('backlog')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'backlog'
                  ? 'bg-white text-[#155EEF] font-bold shadow-xs'
                  : 'text-[#64748B] hover:text-[#102A56]'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Opportunity Backlog ({filteredBacklog.length})</span>
            </button>
          </div>

          <button
            onClick={() => (activeTab === 'waiting' ? setShowAddWaiting(true) : setShowAddBacklog(true))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold text-xs active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'waiting' ? 'Record Waiting' : 'Add Backlog Idea'}</span>
          </button>
        </div>
      </div>

      {/* 1. WAITING MODE */}
      {activeTab === 'waiting' && (
        <div className="space-y-4">
          {/* Context Banner */}
          <div className="p-4 rounded-2xl bg-[#EEF4FF] border border-[#DFE7F3] text-xs">
            <div className="flex items-center gap-2 text-[#155EEF] font-bold mb-1">
              <Hourglass className="w-4 h-4" />
              <span>Independent Momentum While Waiting</span>
            </div>
            <p className="text-[#64748B] leading-relaxed">
              When waiting for a manager's next instruction, PR review, or client feedback, DayFlow ensures you never idle.
              Tasks marked "Independent" can progress immediately without waiting on external blockers.
            </p>
          </div>

          <div className="space-y-3">
            {waitingItems.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#DFE7F3] rounded-2xl bg-white text-xs text-[#64748B]">
                No pending waiting items. You are clear to proceed!
              </div>
            ) : (
              waitingItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    item.resolved
                      ? 'border-[#DFE7F3] bg-[#F8FAFC] opacity-65'
                      : 'border-[#DFE7F3] bg-white hover:border-[#155EEF] shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleResolveWaiting(item.id)}
                        className={`mt-1 p-1 rounded-lg transition-colors ${
                          item.resolved ? 'text-[#0D9488]' : 'text-[#94A3B8] hover:text-[#0D9488]'
                        }`}
                        title={item.resolved ? 'Mark Pending' : 'Mark Resolved'}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1 text-xs">
                          <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Waiting on: {item.waitingOn}
                          </span>
                          <span className="font-mono text-[#64748B]">
                            Follow-up: {item.expectedFollowUp}
                          </span>
                          {item.canWorkIndependently && (
                            <span className="flex items-center gap-1 text-[11px] text-[#0D9488] font-semibold">
                              <ShieldCheck className="w-3.5 h-3.5" /> Can proceed independently
                            </span>
                          )}
                        </div>

                        <h4
                          className={`text-sm font-semibold ${
                            item.resolved ? 'line-through text-[#94A3B8]' : 'text-[#102A56]'
                          }`}
                        >
                          {item.title}
                        </h4>

                        {item.notes && (
                          <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteWaiting(item.id)}
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. OPPORTUNITY BACKLOG */}
      {activeTab === 'backlog' && (
        <div className="space-y-4">
          {/* Duration Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-[#DFE7F3] text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#155EEF]" />
              <span className="font-semibold text-[#102A56]">Filter by Available Free Time:</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setDurationFilter(null)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  durationFilter === null
                    ? 'bg-[#155EEF] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#102A56] border border-[#DFE7F3]'
                }`}
              >
                All
              </button>
              {[10, 15, 20, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDurationFilter(mins)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                    durationFilter === mins
                      ? 'bg-[#155EEF] text-white shadow-xs'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#102A56] border border-[#DFE7F3]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredBacklog.map((opp) => {
              const cat = getCat(opp.categoryId);
              return (
                <div
                  key={opp.id}
                  className="p-4 rounded-xl border border-[#DFE7F3] bg-white hover:border-[#155EEF] transition-all flex flex-col justify-between gap-3 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                      {cat && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#102A56] border border-[#DFE7F3]">
                          {cat.name}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 font-mono text-[#64748B]">
                        <Clock className="w-3.5 h-3.5 text-[#155EEF]" />
                        <span>{opp.estimatedMinutes} mins</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-[#102A56] tracking-tight">
                      {opp.title}
                    </h4>

                    {opp.description && (
                      <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                        {opp.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#DFE7F3] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#64748B]">
                      Value: <strong className="text-[#155EEF] uppercase">{opp.expectedValue}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteBacklog(opp.id)}
                        className="p-1 rounded text-[#94A3B8] hover:text-rose-600 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onPromoteToTask(opp)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EEF4FF] border border-[#DFE7F3] text-[#155EEF] font-semibold text-xs hover:bg-[#E0EAFF] transition-all cursor-pointer"
                      >
                        <span>Promote to Today</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Waiting Item Modal */}
      <Modal
        isOpen={showAddWaiting}
        onClose={() => setShowAddWaiting(false)}
        title="Record Waiting Item"
        subtitle="Keep track of blockers and specify follow-up commitments"
        maxWidth="md"
      >
        <form onSubmit={handleAddWaiting} className="space-y-3.5 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              What are you waiting for? *
            </label>
            <input
              type="text"
              required
              value={waitTitle}
              onChange={(e) => setWaitTitle(e.target.value)}
              placeholder="e.g. Cloud GPU quota approval, PR review on auth service"
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] focus:outline-none focus:border-[#155EEF]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Who or what are you waiting on?
            </label>
            <input
              type="text"
              value={waitOn}
              onChange={(e) => setWaitOn(e.target.value)}
              placeholder="e.g. Lead Engineer, DevOps team, Client"
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] focus:outline-none focus:border-[#155EEF]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Expected Follow-up Date
            </label>
            <input
              type="date"
              value={waitFollowUp}
              onChange={(e) => setWaitFollowUp(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={waitCanIndependent}
              onChange={(e) => setWaitCanIndependent(e.target.checked)}
              className="rounded text-[#155EEF]"
            />
            <span className="text-[#102A56] font-medium">Can independent work continue on other areas?</span>
          </label>

          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Notes (optional)
            </label>
            <textarea
              rows={2}
              value={waitNotes}
              onChange={(e) => setWaitNotes(e.target.value)}
              placeholder="Context, ticket links..."
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE7F3]">
            <button
              type="button"
              onClick={() => setShowAddWaiting(false)}
              className="px-4 py-2 rounded-xl text-[#64748B] hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold transition-all cursor-pointer shadow-xs"
            >
              Save Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Backlog Modal */}
      <Modal
        isOpen={showAddBacklog}
        onClose={() => setShowAddBacklog(false)}
        title="Add Idea to Opportunity Backlog"
        subtitle="Capture high-leverage activities to pick up when free time appears"
        maxWidth="md"
      >
        <form onSubmit={handleAddBacklog} className="space-y-3.5 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Idea / Activity Title *
            </label>
            <input
              type="text"
              required
              value={oppTitle}
              onChange={(e) => setOppTitle(e.target.value)}
              placeholder="e.g. Audit n8n rate-limit recovery workflows"
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] focus:outline-none focus:border-[#155EEF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                Category
              </label>
              <select
                value={oppCatId}
                onChange={(e) => setOppCatId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56]"
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
                Duration (mins)
              </label>
              <select
                value={oppMinutes}
                onChange={(e) => setOppMinutes(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] font-mono font-semibold"
              >
                {[10, 15, 20, 30, 45, 60, 90].map((m) => (
                  <option key={m} value={m}>
                    {m} mins
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Expected Leverage / Value
            </label>
            <select
              value={oppValue}
              onChange={(e) => setOppValue(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56]"
            >
              <option value="high">High Leverage</option>
              <option value="medium">Medium Value</option>
              <option value="low">Low Friction / Quick win</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
              Description & Context
            </label>
            <textarea
              rows={2}
              value={oppDesc}
              onChange={(e) => setOppDesc(e.target.value)}
              placeholder="Expected outcome, required tool..."
              className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE7F3]">
            <button
              type="button"
              onClick={() => setShowAddBacklog(false)}
              className="px-4 py-2 rounded-xl text-[#64748B] hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold transition-all cursor-pointer shadow-xs"
            >
              Add to Backlog
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
