import React, { useState } from 'react';
import {
  User,
  Clock,
  Workflow,
  Download,
  Upload,
  RotateCcw,
  Bell,
  Volume2,
  Check,
  Palette,
  Plus,
  Trash2,
  Sun,
  Moon,
  Image as ImageIcon,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { UserSettings, Category } from '../../types';
import { StorageService } from '../../utils/storage';
import { playChime, requestNotificationPermission } from '../../utils/notifications';
import { PAGE_BACKGROUNDS } from '../../utils/pageBackgrounds';
import { useToast } from '../common/Toast';

interface SettingsViewProps {
  settings: UserSettings;
  categories: Category[];
  onUpdateSettings: (s: UserSettings) => void;
  onUpdateCategories: (cats: Category[]) => void;
}

export function SettingsView({
  settings,
  categories,
  onUpdateSettings,
  onUpdateCategories,
}: SettingsViewProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);

  // Category addition state
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#155EEF');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    StorageService.saveSettings(formData);
    showToast('Settings Saved', 'Operating preferences updated successfully.', 'success');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    const updated = { ...formData, theme: newTheme };
    setFormData(updated);
    if (newTheme === 'dark') {
      localStorage.removeItem('dayflow_explicit_light');
      localStorage.setItem('dayflow_explicit_dark', 'true');
      document.documentElement.classList.add('dark');
    } else {
      localStorage.setItem('dayflow_explicit_light', 'true');
      localStorage.removeItem('dayflow_explicit_dark');
      document.documentElement.classList.remove('dark');
    }
    onUpdateSettings(updated);
    StorageService.saveSettings(updated);
    showToast('Theme Updated', `Switched to ${newTheme === 'dark' ? 'Executive Dark' : 'Soft Light'} mode.`, 'info');
  };

  const handleOpacityChange = (val: number) => {
    const updated = { ...formData, bgImageOpacity: val };
    setFormData(updated);
    onUpdateSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleTestChime = () => {
    playChime('complete');
    showToast('Chime Test', 'Playing completion chord via Web Audio API.', 'info');
  };

  const handleRequestNotifications = async () => {
    const res = await requestNotificationPermission();
    if (res === 'granted') {
      showToast('Notifications Allowed', 'System alerts enabled.', 'success');
      setFormData((prev) => ({ ...prev, notificationsEnabled: true }));
    } else {
      showToast('Permission Notice', 'Browser notifications were not granted.', 'info');
    }
  };

  const handleExportData = () => {
    const json = StorageService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dayflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Export Complete', 'Full backup downloaded.', 'success');
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const ok = StorageService.importData(text);
        if (ok) {
          showToast('Data Restored', 'Reloading imported session...', 'success');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast('Import Failed', 'Invalid JSON structure.', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAllData = () => {
    StorageService.clearAllData();
    showToast('Clean Slate Active', 'All tasks, commitments, goals, and history cleared.', 'success');
  };

  const handleTestN8n = async () => {
    if (!formData.n8n.webhookUrl) {
      showToast('Missing Webhook', 'Please specify your n8n webhook URL first.', 'error');
      return;
    }
    setTestingWebhook(true);
    setTestStatus('Pinging n8n webhook endpoint...');
    try {
      const res = await fetch('/api/n8n/webhook-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: formData.n8n.webhookUrl,
          apiKey: formData.n8n.authToken,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus('Connection verified! Webhook returned status 200.');
        showToast('Webhook Connected', 'n8n endpoint is active and listening.', 'success');
      } else {
        setTestStatus(`Webhook returned error: ${data.error || data.statusText}`);
        showToast('Webhook Error', 'Check URL or CORS configuration.', 'error');
      }
    } catch (e: any) {
      setTestStatus(`Failed to reach webhook: ${e.message}`);
      showToast('Error', e.message, 'error');
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      color: newCatColor,
      icon: 'Tag',
      area: 'work',
      enabled: true,
      isCustom: true,
    };
    const updated = [...categories, newCat];
    onUpdateCategories(updated);
    StorageService.saveCategories(updated);
    setNewCatName('');
    setShowAddCat(false);
    showToast('Category Added', `Created "${newCat.name}".`, 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs">
        <div className="text-[11px] font-semibold text-[#155EEF] uppercase tracking-wider">
          Preferences & Configuration
        </div>
        <h2 className="text-xl font-bold text-[#102A56] tracking-tight mt-0.5">System Settings</h2>
        <p className="text-xs text-[#64748B] mt-0.5">Configure cognitive rhythm, boundaries, work hours, n8n automations, and data persistence</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Visual Theme & Atmospheric Page Backgrounds */}
        <div className="p-6 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#DFE7F3]">
            <div>
              <div className="text-[11px] font-semibold text-[#155EEF] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#155EEF]" />
                <span>Visual Identity & Atmosphere</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#102A56] tracking-tight mt-0.5">
                Theme & Page Background Canvases
              </h3>
            </div>
            <span className="text-[11px] font-medium text-[#64748B]">
              Active: <strong className="text-[#102A56] uppercase font-bold">{formData.theme}</strong> Mode
            </span>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="text-[11px] font-semibold text-[#102A56] block mb-2">
              Color Architecture
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dark Mode Card (Primary) */}
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                  formData.theme === 'dark'
                    ? 'border-orange-500 ring-2 ring-orange-500/30 bg-orange-500/10'
                    : 'border-zinc-200 dark:border-[#262c38] bg-zinc-50 dark:bg-[#161a22] hover:bg-zinc-100 dark:hover:bg-[#1f2430]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-zinc-900 border border-orange-500/30 text-orange-400 shadow-xs">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        Executive Dark
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                          Primary
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Charcoal Grey & Fire Orange</div>
                    </div>
                  </div>
                  {formData.theme === 'dark' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-700/50">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0E1015] inline-block border border-zinc-700 shadow-xs" title="Charcoal Canvas" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#161922] inline-block border border-zinc-700 shadow-xs" title="Dark Slate Glass" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#EA580C] inline-block shadow-xs shadow-orange-900/50" title="Fire Orange Accent" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#F3F4F6] inline-block shadow-xs" title="Crisp Typography" />
                  <span className="text-[10px] text-orange-600 dark:text-orange-400/90 ml-auto font-medium">Pairs with Artwork</span>
                </div>
              </button>

              {/* Light Mode Card - Titanium Light Grey */}
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                  formData.theme === 'light'
                    ? 'border-orange-500 ring-2 ring-orange-500/30 bg-orange-500/10'
                    : 'border-zinc-200 dark:border-[#262c38] bg-zinc-50 dark:bg-[#161a22] hover:bg-zinc-100 dark:hover:bg-[#1f2430]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#DDE2EB] border border-[#BAC5D4] text-orange-600 shadow-xs">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Titanium Light Grey</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Soft Matte Grey & Fire Orange (Zero Glare)</div>
                    </div>
                  </div>
                  {formData.theme === 'light' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-700/50">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#EA580C] inline-block shadow-xs shadow-orange-900/50" title="Fire Orange" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#D6DBE4] inline-block border border-zinc-400 shadow-xs" title="Matte Light Grey Canvas" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#E4E9F2] inline-block border border-zinc-400 shadow-xs" title="Slate Grey Surface" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0F172A] inline-block shadow-xs" title="Graphite Navy Text" />
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 ml-auto font-medium">Eye-Friendly</span>
                </div>
              </button>
            </div>
          </div>

          {/* Opacity Control Slider for Page Backgrounds (Now up to 100%) */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#EA580C]" />
                <span className="font-bold text-xs text-[#102A56]">
                  Background Artwork Opacity
                </span>
              </div>
              <span className="font-mono font-bold text-xs text-[#EA580C] px-2 py-0.5 rounded-md bg-white border border-[#DFE7F3]">
                {Math.round((formData.bgImageOpacity ?? 0.16) * 100)}%
              </span>
            </div>

            <p className="text-[11px] text-[#64748B]">
              Controls the opacity of your page artwork backgrounds. You can dial this from subtle (15%) all the way to maximum (100%).
            </p>

            <div className="flex items-center gap-4">
              <span className="text-[10px] text-[#94A3B8] font-semibold">0% (Off)</span>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.02"
                value={formData.bgImageOpacity ?? 0.16}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                className="flex-1 accent-[#EA580C] cursor-pointer"
              />
              <span className="text-[10px] text-[#EA580C] font-semibold">100% (Full Art)</span>
            </div>

            {/* Quick Presets with values beyond 30% */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-semibold text-[#64748B]">Presets:</span>
              {[
                { label: 'Off', val: 0 },
                { label: 'Subtle (15%)', val: 0.15 },
                { label: 'Balanced (30%)', val: 0.30 },
                { label: 'Vibrant (50%)', val: 0.50 },
                { label: 'High (75%)', val: 0.75 },
                { label: 'Full (100%)', val: 1.0 },
              ].map((p) => {
                const isSelected = Math.abs((formData.bgImageOpacity ?? 0.16) - p.val) < 0.03;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleOpacityChange(p.val)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
                        : 'bg-white text-[#102A56] border-[#DFE7F3] hover:bg-[#EEF4FF]'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Page Background Gallery Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-[#102A56] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#155EEF]" />
                <span>Assigned Page Background Assets (from src/assets)</span>
              </label>
              <span className="text-[10px] text-[#64748B] font-mono">8 of 8 pages mapped</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(PAGE_BACKGROUNDS).map(([sectionKey, meta]) => (
                <div
                  key={sectionKey}
                  className="group relative overflow-hidden rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] p-2.5 transition-all hover:border-[#155EEF]"
                >
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-900/10 mb-2 relative">
                    <img
                      src={meta.src}
                      alt={meta.pageTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-white backdrop-blur-xs">
                      {meta.name}
                    </span>
                  </div>
                  <div className="font-bold text-[11px] text-[#102A56] capitalize truncate">
                    {sectionKey}
                  </div>
                  <div className="text-[9px] text-[#64748B] truncate mt-0.5" title={meta.themeContext}>
                    {meta.themeContext}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 1. Profile & Professional Context */}
        <div className="p-6 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#102A56] uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-[#155EEF]" />
            <span>Profile & Professional Persona</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                Your Preferred Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] font-medium focus:outline-none focus:border-[#155EEF]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                Professional Role Context
              </label>
              <input
                type="text"
                value={formData.roleContext}
                onChange={(e) => setFormData({ ...formData, roleContext: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] font-medium focus:outline-none focus:border-[#155EEF]"
              />
            </div>
          </div>
        </div>

        {/* 2. Working Boundaries & Protected Rest */}
        <div className="p-6 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#102A56] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#155EEF]" />
            <span>Work Hours & Weekend Boundaries</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                Workday Start Time
              </label>
              <input
                type="time"
                value={formData.workStartTime}
                onChange={(e) => setFormData({ ...formData, workStartTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] font-mono font-semibold focus:outline-none focus:border-[#155EEF]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                Workday End Time
              </label>
              <input
                type="time"
                value={formData.workEndTime}
                onChange={(e) => setFormData({ ...formData, workEndTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] font-mono font-semibold focus:outline-none focus:border-[#155EEF]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                Weekend Planning Policy
              </label>
              <select
                value={formData.weekendPolicy}
                onChange={(e) => setFormData({ ...formData, weekendPolicy: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] font-medium focus:outline-none focus:border-[#155EEF]"
              >
                <option value="rest_first">Protected Rest (No auto-work carryover)</option>
                <option value="light_projects">Light Side Projects & Learning</option>
                <option value="unrestricted">Unrestricted</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                Quiet Hours (Silence check-ins)
              </label>
              <div className="flex items-center gap-2 font-mono">
                <input
                  type="time"
                  value={formData.quietHoursStart}
                  onChange={(e) => setFormData({ ...formData, quietHoursStart: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56]"
                />
                <span className="text-[#64748B]">to</span>
                <input
                  type="time"
                  value={formData.quietHoursEnd}
                  onChange={(e) => setFormData({ ...formData, quietHoursEnd: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                Planning Style Engine
              </label>
              <select
                value={formData.planningStyle}
                onChange={(e) => setFormData({ ...formData, planningStyle: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] font-medium focus:outline-none focus:border-[#155EEF]"
              >
                <option value="energy_based">Energy-based & Dynamic pacing</option>
                <option value="structured">Structured Timeboxing</option>
                <option value="fluid">Fluid & Outcome-focused</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Audio & Notifications */}
        <div className="p-6 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#102A56] uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#155EEF]" />
            <span>Follow-through Alerts & Sound Synthesis</span>
          </h3>

          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
            <div>
              <div className="font-semibold text-[#102A56]">Audio Check-in Chimes</div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                Harmonic Web Audio tones generated locally on session completion
              </div>
            </div>
            <button
              type="button"
              onClick={handleTestChime}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DFE7F3] bg-white hover:bg-[#EEF4FF] text-xs font-semibold text-[#102A56] cursor-pointer shadow-xs"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#155EEF]" />
              <span>Test Chime</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
            <div>
              <div className="font-semibold text-[#102A56]">Browser Notifications</div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                Triggers native browser alerts when focus timer expires
              </div>
            </div>
            <button
              type="button"
              onClick={handleRequestNotifications}
              className="px-3.5 py-1.5 rounded-lg bg-[#EEF4FF] border border-blue-200 text-[#155EEF] text-xs font-semibold hover:bg-[#E0EAFF] transition-all cursor-pointer shadow-xs"
            >
              Request Browser Permission
            </button>
          </div>
        </div>

        {/* 4. Modular n8n Webhook Integration */}
        <div className="p-6 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#102A56] uppercase tracking-wider flex items-center gap-2">
              <Workflow className="w-4 h-4 text-[#155EEF]" />
              <span>Modular n8n Workflow Automation Layer</span>
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.n8n.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    n8n: { ...formData.n8n, enabled: e.target.checked },
                  })
                }
                className="rounded text-[#155EEF]"
              />
              <span className="font-semibold text-[#102A56]">Enable n8n Layer</span>
            </label>
          </div>

          <p className="text-[11px] text-[#64748B] leading-relaxed">
            Connect DayFlow events to your self-hosted or cloud n8n workflows for automated morning briefings, Telegram/Discord alerts, or calendar conflict triggers.
            The core app remains 100% operational whether or not n8n is active.
          </p>

          {formData.n8n.enabled && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                  n8n Webhook URL (Production / Test)
                </label>
                <input
                  type="url"
                  value={formData.n8n.webhookUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      n8n: { ...formData.n8n, webhookUrl: e.target.value },
                    })
                  }
                  placeholder="https://n8n.your-domain.com/webhook/dayflow-sync"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#102A56] block mb-1">
                  Webhook Authorization Bearer Token (optional)
                </label>
                <input
                  type="password"
                  value={formData.n8n.authToken || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      n8n: { ...formData.n8n, authToken: e.target.value },
                    })
                  }
                  placeholder="Secret bearer token"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] text-[#102A56] font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleTestN8n}
                  disabled={testingWebhook}
                  className="px-4 py-2 rounded-xl bg-[#EEF4FF] border border-blue-200 text-[#155EEF] text-xs font-semibold hover:bg-[#E0EAFF] transition-all cursor-pointer shadow-xs"
                >
                  {testingWebhook ? 'Testing...' : 'Test Webhook Ping'}
                </button>
                {testStatus && <span className="text-[11px] text-[#64748B]">{testStatus}</span>}
              </div>
            </div>
          )}
        </div>

        {/* 5. Custom Categories Manager */}
        <div className="p-6 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#102A56] uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#155EEF]" />
              <span>Configurable Categories</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddCat(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] hover:bg-[#EEF4FF] text-xs font-semibold text-[#102A56] cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#155EEF]" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="font-semibold text-xs text-[#102A56] truncate">{c.name}</span>
                </div>
                {c.isCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = categories.filter((item) => item.id !== c.id);
                      onUpdateCategories(updated);
                      StorageService.saveCategories(updated);
                    }}
                    className="text-[#94A3B8] hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {showAddCat && (
            <div className="p-3.5 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] flex items-center gap-3">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category name..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-[#DFE7F3] bg-white text-xs text-[#102A56]"
              />
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-8 h-8 rounded border border-[#DFE7F3] bg-transparent cursor-pointer"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3.5 py-1.5 rounded-lg bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddCat(false)}
                className="text-xs text-[#64748B] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* 6. Data Backup, Export & Reset */}
        <div className="p-6 rounded-2xl border border-[#DFE7F3] bg-white shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#102A56] uppercase tracking-wider flex items-center gap-2">
            <Download className="w-4 h-4 text-[#0D9488]" />
            <span>Data Sovereignty & Persistence</span>
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] hover:bg-[#EEF4FF] text-xs font-semibold text-[#102A56] cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-[#0D9488]" />
              <span>Export All Data (JSON)</span>
            </button>

            <button
              type="button"
              onClick={handleImportData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC] hover:bg-[#EEF4FF] text-xs font-semibold text-[#102A56] cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4 text-[#155EEF]" />
              <span>Import Data (JSON)</span>
            </button>

            <button
              type="button"
              onClick={handleClearAllData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-semibold text-rose-700 dark:text-rose-400 ml-auto cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear All Data (Clean Slate)</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold text-xs sm:text-sm shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
