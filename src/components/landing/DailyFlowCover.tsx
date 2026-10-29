import React, { useState, useEffect, useRef } from 'react';
import {
  Infinity as InfinityIcon,
  CheckSquare,
  Target,
  CalendarDays,
  Clock,
  BarChart3,
  Bot,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Shield,
  Layers,
  Flame,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import dayflowLogo from '../../assets/dayflow.jpg';

interface DailyFlowCoverProps {
  onEnterWorkspace: () => void;
}

const BG_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4';

export function DailyFlowCover({ onEnterWorkspace }: DailyFlowCoverProps) {
  const { currentUser, userProfile, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [activeNav, setActiveNav] = useState<'home' | 'features' | 'how' | 'about'>('home');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Attempt playback immediately upon mount
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => setVideoLoaded(true))
        .catch(() => {
          // Autoplay policy or connection fallback
          setVideoLoaded(true);
        });
    }
  }, []);

  const scrollToSection = (id: string, navKey: 'home' | 'features' | 'how' | 'about') => {
    setActiveNav(navKey);
    setMobileMenuOpen(false);
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartYourDay = () => {
    if (currentUser) {
      onEnterWorkspace();
    } else {
      openAuthModal();
    }
  };

  const handleLogIn = () => {
    setMobileMenuOpen(false);
    openAuthModal();
  };

  const features = [
    {
      id: 'tasks',
      title: 'Smart Tasks',
      tagline: 'Organise daily priorities and responsibilities.',
      description:
        'Structure tasks with cognitive energy ratings, realistic duration estimates, and deadline awareness. No endless overwhelming lists.',
      icon: CheckSquare,
    },
    {
      id: 'goals',
      title: 'Goals & Progress',
      tagline: 'Set goals and track milestones.',
      description:
        'Connect your daily execution directly to long-term strategic milestones. Track measurable progress without losing direction.',
      icon: Target,
    },
    {
      id: 'calendar',
      title: 'Calendar & Commitments',
      tagline: 'Keep important events visible.',
      description:
        'Harmonise fixed appointments, meetings, and deep work blocks into a conflict-free, realistic visual schedule.',
      icon: CalendarDays,
    },
    {
      id: 'focus',
      title: 'Focus Sessions',
      tagline: 'Protect time for meaningful work.',
      description:
        'Single-task with dedicated focus intervals, distraction-free timers, and automatic logging of actual minutes spent.',
      icon: Clock,
    },
    {
      id: 'insights',
      title: 'Productivity Insights',
      tagline: 'Understand your progress and patterns.',
      description:
        'Analyze velocity trends, task postponement ratios, and evening reflections to calibrate your real-world capacity.',
      icon: BarChart3,
    },
    {
      id: 'companion',
      title: 'AI Companion',
      tagline: 'Get help with planning, prioritisation and decisions.',
      description:
        'Your context-aware Chief of Staff calculates what to do right now, decomposes complex goals, and replans when life happens.',
      icon: Bot,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0E1015] text-[#F3F4F6] font-geist selection:bg-[#EA580C]/30 selection:text-white relative overflow-x-hidden">
      {/* ========================================================= */}
      {/* 1. FULL-SCREEN BACKGROUND HERO (100svh / 100vh)           */}
      {/* ========================================================= */}
      <section
        id="hero"
        className="relative w-full h-[100svh] min-h-[100vh] flex flex-col justify-between overflow-hidden"
      >
        {/* Background Video Layer */}
        {!videoFailed ? (
          <video
            ref={videoRef}
            src={BG_VIDEO_URL}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoFailed(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
        ) : null}

        {/* Polished Charcoal Fallback Background (Active when video loading or error) */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-[#0E1015] via-[#161922] to-[#1C202B] -z-10 ${
            videoLoaded && !videoFailed ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden="true"
        />

        {/* Cinematic Dark Charcoal Overlays (Ensures high text contrast & preserves brand theme) */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0E1015] via-[#0E1015]/60 to-[#0E1015]/40 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-radial from-transparent via-[#0E1015]/30 to-[#0E1015]/80 pointer-events-none"
          aria-hidden="true"
        />
        {/* Subtle Bottom Horizon Blend */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0E1015] to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* ========================================================= */}
        {/* 2. TOP LIQUID-GLASS NAVIGATION BAR                        */}
        {/* ========================================================= */}
        <header className="relative z-30 w-full pt-4 sm:pt-6 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left: Brand with Flowing Symbol */}
            <div
              onClick={() => scrollToSection('hero', 'home')}
              className="flex items-center gap-3 cursor-pointer group"
              title="DailyFlow AI — Home"
            >
              <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/15 bg-[#161922]/90 flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                <img
                  src={dayflowLogo}
                  alt="DailyFlow AI"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-[#F3F4F6] group-hover:text-white transition-colors">
                  DailyFlow<span className="text-[#F97316]"> AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#D6DBE4]">
                  <InfinityIcon className="w-3 h-3 text-[#EA580C]" />
                  Flow OS
                </span>
              </div>
            </div>

            {/* Centre: Desktop Liquid-Glass Navigation Pill */}
            <nav
              aria-label="Primary navigation"
              className="hidden md:flex items-center p-1 rounded-full liquid-glass"
            >
              <button
                onClick={() => scrollToSection('hero', 'home')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeNav === 'home'
                    ? 'bg-white/15 text-white font-semibold shadow-xs'
                    : 'text-[#D6DBE4]/80 hover:text-white hover:bg-white/5'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features', 'features')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeNav === 'features'
                    ? 'bg-white/15 text-white font-semibold shadow-xs'
                    : 'text-[#D6DBE4]/80 hover:text-white hover:bg-white/5'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works', 'how')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeNav === 'how'
                    ? 'bg-white/15 text-white font-semibold shadow-xs'
                    : 'text-[#D6DBE4]/80 hover:text-white hover:bg-white/5'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('about', 'about')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeNav === 'about'
                    ? 'bg-white/15 text-white font-semibold shadow-xs'
                    : 'text-[#D6DBE4]/80 hover:text-white hover:bg-white/5'
                }`}
              >
                About
              </button>
            </nav>

            {/* Right: Account Actions */}
            <div className="hidden sm:flex items-center gap-2.5">
              {currentUser ? (
                <button
                  onClick={onEnterWorkspace}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#C2410C] hover:to-[#EA580C] shadow-md shadow-orange-950/40 border border-orange-400/30 transition-all cursor-pointer active:scale-98"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleLogIn}
                    className="liquid-glass px-4 py-2 text-xs font-medium text-[#F3F4F6] hover:text-white cursor-pointer"
                  >
                    Log In
                  </button>
                  <button
                    onClick={handleStartYourDay}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#C2410C] hover:to-[#EA580C] shadow-md shadow-orange-950/40 border border-orange-400/30 transition-all cursor-pointer active:scale-98"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="liquid-glass p-2.5 text-[#F3F4F6] hover:text-white focus:outline-none cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Liquid-Glass Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-3 p-4 rounded-2xl liquid-glass border border-white/15 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex flex-col gap-2 text-sm font-medium">
                <button
                  onClick={() => scrollToSection('hero', 'home')}
                  className="py-2 px-3 rounded-lg text-left hover:bg-white/10 text-[#F3F4F6] transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection('features', 'features')}
                  className="py-2 px-3 rounded-lg text-left hover:bg-white/10 text-[#F3F4F6] transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works', 'how')}
                  className="py-2 px-3 rounded-lg text-left hover:bg-white/10 text-[#F3F4F6] transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection('about', 'about')}
                  className="py-2 px-3 rounded-lg text-left hover:bg-white/10 text-[#F3F4F6] transition-colors"
                >
                  About
                </button>

                <div className="h-px bg-white/10 my-2" />

                {currentUser ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onEnterWorkspace();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#EA580C] to-[#F97316]"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleLogIn}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-center text-[#F3F4F6] bg-white/5 border border-white/10 hover:bg-white/10"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleStartYourDay();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#EA580C] to-[#F97316]"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        {/* ========================================================= */}
        {/* 3. MAIN HERO CONTENT (Lower-Left Positioned, ~650px max)  */}
        {/* ========================================================= */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-8 pb-12 sm:pb-16 lg:pb-20 mt-auto">
          <div className="max-w-[650px] space-y-4 sm:space-y-6">
            {/* Small Introductory Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-[11px] font-bold tracking-widest text-[#F97316] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] animate-pulse" />
              <span>YOUR DAY. YOUR DIRECTION.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F3F4F6] leading-[1.08]">
              Make Every Day <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3F4F6] to-[#D6DBE4]">
                Count.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base lg:text-lg text-[#D6DBE4]/85 font-normal leading-relaxed max-w-xl">
              Bring your tasks, goals, routines and priorities into one intelligent workspace. Build better habits, protect your focus and make meaningful progress every day with DailyFlow AI.
            </p>

            {/* Hero Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {/* Primary: Start Your Day */}
              <button
                onClick={handleStartYourDay}
                className="flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#C2410C] hover:to-[#EA580C] shadow-lg shadow-orange-950/50 border border-orange-400/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Start Your Day</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary: Discover DailyFlow */}
              <button
                onClick={() => scrollToSection('features', 'features')}
                className="liquid-glass flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 text-sm sm:text-base font-medium text-[#F3F4F6] hover:text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Discover DailyFlow</span>
                <ChevronDown className="w-4 h-4 text-[#D6DBE4]/80" />
              </button>
            </div>

            {/* Restrained Brand Assurance Markers */}
            <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-[#D6DBE4]/70">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Zero mock data</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Private cloud memory</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Context-aware AI pacing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. FEATURE OVERVIEW SECTION (#features)                   */}
      {/* ========================================================= */}
      <section
        id="features"
        className="relative z-10 py-20 sm:py-28 px-4 sm:px-8 border-t border-white/10 bg-[#0E1015]"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="max-w-2xl mb-12 sm:mb-16">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#F97316]">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F3F4F6] mt-2 mb-3">
              One coherent workspace for your entire day.
            </h2>
            <p className="text-sm sm:text-base text-[#D6DBE4]/80 leading-relaxed">
              DailyFlow AI replaces scattered apps with a unified system engineered to safeguard your focus and turn intentions into momentum.
            </p>
          </div>

          {/* 6 Restrained Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="liquid-glass-card p-6 sm:p-7 flex flex-col justify-between group"
                >
                  <div>
                    {/* Icon Header */}
                    <div className="w-11 h-11 rounded-xl bg-[#1C202B] border border-white/10 flex items-center justify-center mb-5 group-hover:border-[#EA580C]/40 group-hover:bg-[#EA580C]/10 transition-all">
                      <Icon className="w-5 h-5 text-[#EA580C] group-hover:text-[#F97316] transition-colors" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-[#F3F4F6] tracking-tight mb-1.5 group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>

                    {/* Tagline */}
                    <p className="text-xs font-semibold text-[#D6DBE4] mb-2.5">
                      {feature.tagline}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-[#D6DBE4]/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-[#D6DBE4]/50 group-hover:text-[#D6DBE4] transition-colors">
                    <span>Integrated in workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#EA580C]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. HOW IT WORKS SECTION (#how-it-works)                   */}
      {/* ========================================================= */}
      <section
        id="how-it-works"
        className="relative z-10 py-20 sm:py-24 px-4 sm:px-8 border-t border-white/10 bg-[#161922]/60"
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#F97316]">
              Execution Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F3F4F6] mt-2 mb-3">
              How DailyFlow structures your rhythm.
            </h2>
            <p className="text-sm sm:text-base text-[#D6DBE4]/80 leading-relaxed">
              Designed around human cognitive energy curves rather than unrealistic industrial schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 rounded-2xl bg-[#0E1015]/70 border border-white/10 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#EA580C]/15 border border-[#EA580C]/30 text-[#EA580C] flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h4 className="text-base font-bold text-[#F3F4F6]">Capture & Prioritize</h4>
              <p className="text-xs text-[#D6DBE4]/70 leading-relaxed">
                Add tasks, strategic goals, and meetings. The scoring engine evaluates urgency, cognitive demand, and available buffers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0E1015]/70 border border-white/10 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#EA580C]/15 border border-[#EA580C]/30 text-[#EA580C] flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h4 className="text-base font-bold text-[#F3F4F6]">Execute with Flow</h4>
              <p className="text-xs text-[#D6DBE4]/70 leading-relaxed">
                Launch intentional Focus Sessions. The "What Should I Do Now?" decider eliminates hesitation between tasks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0E1015]/70 border border-white/10 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#EA580C]/15 border border-[#EA580C]/30 text-[#EA580C] flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h4 className="text-base font-bold text-[#F3F4F6]">Rebalance Dynamically</h4>
              <p className="text-xs text-[#D6DBE4]/70 leading-relaxed">
                When plans shift, one-click smart replanning realigns your timeline so you never finish the day feeling defeated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. ABOUT SECTION (#about)                                 */}
      {/* ========================================================= */}
      <section
        id="about"
        className="relative z-10 py-20 sm:py-24 px-4 sm:px-8 border-t border-white/10 bg-[#0E1015]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#F97316]">
                Product Philosophy
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F4F6] leading-tight">
                Engineered for people who value craft over busywork.
              </h3>
              <p className="text-xs sm:text-sm text-[#D6DBE4]/80 leading-relaxed">
                Most task applications are glorified to-do backlogs that accumulate guilt. DailyFlow AI was conceived as an intelligent chief of staff: it respects your real hours, protects your evening recovery, and ensures that what matters gets done.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleStartYourDay}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#EA580C] hover:text-[#F97316] transition-colors"
                >
                  <span>Launch your DailyFlow workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#161922] border border-white/10">
                <Shield className="w-5 h-5 text-[#EA580C] mb-2.5" />
                <h5 className="font-bold text-sm text-[#F3F4F6] mb-1">Zero-Trust Cloud Memory</h5>
                <p className="text-xs text-[#D6DBE4]/70 leading-relaxed">
                  Every user account possesses an isolated Firestore partition. Your personal goals and reflections belong only to you.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#161922] border border-white/10">
                <Layers className="w-5 h-5 text-[#EA580C] mb-2.5" />
                <h5 className="font-bold text-sm text-[#F3F4F6] mb-1">Attention Defense</h5>
                <p className="text-xs text-[#D6DBE4]/70 leading-relaxed">
                  No gamification badges, streak pressure, or distracting feeds. Quiet software that helps you focus and leave.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#161922] border border-white/10">
                <Flame className="w-5 h-5 text-[#EA580C] mb-2.5" />
                <h5 className="font-bold text-sm text-[#F3F4F6] mb-1">Energy-First Planning</h5>
                <p className="text-xs text-[#D6DBE4]/70 leading-relaxed">
                  Match high-focus demands with your peak morning hours, reserving low-friction administration for lower energy windows.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#161922] border border-white/10">
                <Sparkles className="w-5 h-5 text-[#EA580C] mb-2.5" />
                <h5 className="font-bold text-sm text-[#F3F4F6] mb-1">Contextual AI Assistant</h5>
                <p className="text-xs text-[#D6DBE4]/70 leading-relaxed">
                  Powered by custom Groq and Gemini models that digest your active calendar commitments to formulate realistic solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. BOTTOM BANNER & ACTION CALLOUT                         */}
      {/* ========================================================= */}
      <section className="relative z-10 py-16 sm:py-20 border-t border-white/10 bg-gradient-to-b from-[#161922] to-[#0E1015] px-4 sm:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F3F4F6] tracking-tight">
            Ready to make every day count?
          </h3>
          <p className="text-xs sm:text-sm text-[#D6DBE4]/80 max-w-lg mx-auto leading-relaxed">
            Step into an intelligent, calm workspace built to help you follow through on what matters most.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleStartYourDay}
              className="w-full sm:w-auto px-7 py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#C2410C] hover:to-[#EA580C] shadow-lg shadow-orange-950/40 border border-orange-400/30 transition-all cursor-pointer"
            >
              Start Your Day with DailyFlow
            </button>
            <button
              onClick={onEnterWorkspace}
              className="liquid-glass w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-medium text-[#F3F4F6] hover:text-white cursor-pointer"
            >
              Enter Workspace Directly
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. FOOTER                                                 */}
      {/* ========================================================= */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-4 sm:px-8 text-xs text-[#D6DBE4]/60 bg-[#0E1015]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={dayflowLogo} alt="DailyFlow AI" className="w-5 h-5 rounded-md object-cover" />
            <span className="font-semibold text-[#F3F4F6]">DailyFlow AI</span>
            <span>— Make Every Day Count.</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => scrollToSection('features', 'features')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works', 'how')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('about', 'about')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={onEnterWorkspace}
              className="text-[#EA580C] hover:text-[#F97316] transition-colors cursor-pointer font-medium"
            >
              Launch Workspace →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
