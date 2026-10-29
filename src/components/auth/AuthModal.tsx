import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  Brain,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import dayflowLogo from '../../assets/dayflow.jpg';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      showToast('Signed In', 'Welcome to DayFlow AI!', 'success');
      closeAuthModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in with Google');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, displayName.trim());
        showToast('Account Created', `Welcome to DayFlow, ${displayName || 'User'}!`, 'success');
      } else {
        await signInWithEmail(email, password);
        showToast('Signed In', 'Welcome back to your cockpit.', 'success');
      }
      closeAuthModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#161a23] border border-[#E2E8F0] dark:border-[#2b313d] rounded-2xl shadow-2xl overflow-hidden transition-all text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#202531] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Brand & Title */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-orange-500/40 shadow-xs shrink-0">
              <img src={dayflowLogo} alt="DayFlow" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight flex items-center gap-2">
                <span>DayFlow Account</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                  Cloud Sync
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {mode === 'signin' ? 'Access your personalized memory & schedule' : 'Create your chief of staff workspace'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-zinc-100 dark:bg-[#1c212b] p-1 mb-5 border border-zinc-200 dark:border-[#2b313d]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white dark:bg-[#262c38] text-orange-600 dark:text-orange-400 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white dark:bg-[#262c38] text-orange-600 dark:text-orange-400 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-[#2b313d] bg-white dark:bg-[#1a1e27] hover:bg-zinc-50 dark:hover:bg-[#222733] text-zinc-800 dark:text-zinc-100 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-[#2b313d]" />
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">or with email</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-[#2b313d]" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Lesedi Tlhapane"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-[#2b313d] bg-zinc-50 dark:bg-[#1a1e27] text-xs focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-[#1f2430] text-zinc-900 dark:text-zinc-100 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-[#2b313d] bg-zinc-50 dark:bg-[#1a1e27] text-xs focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-[#1f2430] text-zinc-900 dark:text-zinc-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter password'}
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-zinc-200 dark:border-[#2b313d] bg-zinc-50 dark:bg-[#1a1e27] text-xs focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-[#1f2430] text-zinc-900 dark:text-zinc-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create DayFlow Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Feature Highlights of Personal Memory */}
          <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-[#242a36] space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              <Brain className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>Personalized AI memory saved across devices</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Zero-knowledge isolated workspace per profile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
