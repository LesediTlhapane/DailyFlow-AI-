import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Shield,
  LogOut,
  Calendar,
  CloudCheck,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { currentUser, userProfile, signOut, updateUserBio } = useAuth();
  const { showToast } = useToast();

  const [isEditingRole, setIsEditingRole] = useState(false);
  const [roleText, setRoleText] = useState(userProfile?.roleContext || '');
  const [savingRole, setSavingRole] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSaveRole = async () => {
    if (!roleText.trim()) return;
    setSavingRole(true);
    try {
      await updateUserBio(roleText.trim());
      setIsEditingRole(false);
      showToast('Profile Updated', 'Role context saved to cloud memory.', 'success');
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    } finally {
      setSavingRole(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast('Signed Out', 'You have been signed out securely.', 'info');
      onClose();
    } catch (e: any) {
      showToast('Sign Out Error', e.message, 'error');
    }
  };

  const initials = (userProfile?.displayName || currentUser.email || 'DF')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#161a23] border border-[#E2E8F0] dark:border-[#2b313d] rounded-2xl shadow-2xl overflow-hidden transition-all text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#202531] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Avatar and Basic Details */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={userProfile?.displayName || 'User'}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-orange-500/50 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-xl shadow-md ring-2 ring-orange-500/40">
                  {initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#161a23]" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base truncate">{userProfile?.displayName || 'DayFlow Pioneer'}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>{currentUser.email}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                  <Sparkles className="w-3 h-3" />
                  Personal Memory Active
                </span>
              </div>
            </div>
          </div>

          {/* User Operating Role Context */}
          <div className="mb-5 p-3.5 rounded-xl border border-zinc-200 dark:border-[#2b313d] bg-zinc-50 dark:bg-[#1a1e27]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Operating Role Context
              </span>
              {!isEditingRole && (
                <button
                  onClick={() => {
                    setRoleText(userProfile?.roleContext || '');
                    setIsEditingRole(true);
                  }}
                  className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              )}
            </div>

            {isEditingRole ? (
              <div className="space-y-2 mt-1">
                <input
                  type="text"
                  value={roleText}
                  onChange={(e) => setRoleText(e.target.value)}
                  placeholder="e.g. AI Technical Specialist & Software Developer"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-orange-500/60 bg-white dark:bg-[#202531] text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsEditingRole(false)}
                    className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRole}
                    disabled={savingRole}
                    className="px-3 py-1 rounded-md bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-700 dark:text-zinc-200 font-medium">
                {userProfile?.roleContext || 'AI Technical Specialist & Software Developer'}
              </p>
            )}
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
              Your AI Companion leverages this persona memory when generating recommendations and plans.
            </p>
          </div>

          {/* Cloud Storage & Security Stats */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-[#2b313d] bg-zinc-50 dark:bg-[#1a1e27]">
              <div className="text-[10px] uppercase font-bold text-zinc-400">Database</div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Firestore Isolated
              </div>
            </div>
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-[#2b313d] bg-zinc-50 dark:bg-[#1a1e27]">
              <div className="text-[10px] uppercase font-bold text-zinc-400">Account Type</div>
              <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1.5 mt-0.5">
                <Shield className="w-3.5 h-3.5" />
                Authorized Owner
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from DayFlow</span>
          </button>
        </div>
      </div>
    </div>
  );
}
