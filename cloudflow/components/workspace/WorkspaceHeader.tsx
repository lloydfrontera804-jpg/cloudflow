'use client';

import React from 'react';
import { SessionStatus, VMSession } from '@/types/workspace';
import { UserProfile } from '@/types/user';
import {
  Clock,
  AlertTriangle,
  Lock,
  PlusCircle,
  Home,
  CheckCircle,
  Play,
  RotateCcw,
  FastForward,
  Server,
  Zap,
  User,
} from 'lucide-react';

interface WorkspaceHeaderProps {
  session: VMSession;
  speedMultiplier: number;
  onToggleSpeed: () => void;
  onSimulateWarning: () => void;
  onSimulateExpire: () => void;
  onResetSession: () => void;
  onOpenExtendPayment: () => void;
  onReturnHome: () => void;
  onOpenAccount: () => void;
  user: UserProfile;
}

export function WorkspaceHeader({
  session,
  speedMultiplier,
  onToggleSpeed,
  onSimulateWarning,
  onSimulateExpire,
  onResetSession,
  onOpenExtendPayment,
  onReturnHome,
  onOpenAccount,
  user,
}: WorkspaceHeaderProps) {
  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    if (secs <= 0) return '00:00:00';
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  };

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Warning
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            Expired
          </span>
        );
      case 'extended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
            Extended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
            Ready
          </span>
        );
    }
  };

  const percentage = Math.max(
    0,
    Math.min(100, (session.remainingSeconds / session.totalDurationSeconds) * 100)
  );

  return (
    <header className="w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-xl sticky top-0 z-30">
      {/* Top Bar with Status and Quick Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Hostname */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnHome}
            id="workspace-back-home-btn"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            title="Return to Landing Page"
          >
            <Home className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{session.vmName}</span>
                {getStatusBadge(session.status)}
              </div>
              <p className="text-[11px] text-zinc-400">
                IP: <span className="font-mono text-zinc-300">{session.ipAddress}</span> • {session.region}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Current Plan & Visible Session Timer */}
        <div className="flex items-center gap-4 bg-zinc-900/90 border border-zinc-800/90 rounded-2xl px-4 py-2 shadow-inner">
          {/* Plan indicator */}
          <div className="hidden sm:block text-right pr-3 border-r border-zinc-800">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
              Current Plan
            </span>
            <span className="text-xs font-bold text-amber-300">
              ₹{session.plan.priceInr} for {session.plan.durationHours}h
            </span>
          </div>

          {/* Visible Timer countdown */}
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                session.status === 'warning'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                  : session.status === 'expired'
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Time Remaining</span>
                {session.extensionCount > 0 && (
                  <span className="text-indigo-400 text-[10px] font-semibold">
                    +{session.extensionCount * 2}h Extended
                  </span>
                )}
              </div>
              <div
                id="session-countdown-display"
                className={`font-mono text-xl sm:text-2xl font-black tracking-wider ${
                  session.status === 'warning'
                    ? 'text-amber-400 animate-pulse'
                    : session.status === 'expired'
                    ? 'text-rose-400'
                    : 'text-white'
                }`}
              >
                {formatTime(session.remainingSeconds)}
              </div>
            </div>
          </div>

          {/* Mini progress bar */}
          <div className="w-16 sm:w-24 hidden md:block">
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  session.status === 'warning'
                    ? 'bg-amber-500'
                    : session.status === 'expired'
                    ? 'bg-rose-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-[10px] text-right text-zinc-400 mt-0.5 font-mono">
              {Math.round(percentage)}%
            </div>
          </div>
        </div>

        {/* Right: Extend Action & Simulation Tools */}
        <div className="flex items-center gap-2">
          <button
            id="workspace-user-account-btn"
            onClick={onOpenAccount}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold cursor-pointer transition-colors"
            title="Open User Account Details"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-[10px]">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="hidden sm:inline font-mono text-[11px]">{user.email}</span>
            <span className="sm:hidden">Account</span>
          </button>

          <button
            id="workspace-extend-session-btn"
            onClick={onOpenExtendPayment}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/20 active:scale-98 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>Extend Session (+2h ₹100)</span>
          </button>
        </div>
      </div>

      {/* Reviewer / Simulation Quick Bar */}
      <div className="bg-zinc-900/60 border-t border-zinc-800/80 px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-300 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Demo Simulation Toolbar:
          </span>
          <span className="text-zinc-400 hidden sm:inline">
            (Verify the 5-min warning banner & expired overlay instantly)
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onToggleSpeed}
            id="sim-speed-btn"
            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-mono cursor-pointer flex items-center gap-1"
            title="Speed up timer"
          >
            <FastForward className="w-3 h-3 text-blue-400" />
            <span>Speed: {speedMultiplier}x</span>
          </button>

          <button
            onClick={onSimulateWarning}
            id="sim-warning-btn"
            className="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 cursor-pointer font-medium"
            title="Set remaining to 4 minutes 55 seconds"
          >
            Test 5-Min Warning
          </button>

          <button
            onClick={onSimulateExpire}
            id="sim-expire-btn"
            className="px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 cursor-pointer font-medium"
            title="Set remaining to 0 seconds"
          >
            Trigger Expiry
          </button>

          <button
            onClick={onResetSession}
            id="sim-reset-btn"
            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 cursor-pointer flex items-center gap-1"
            title="Reset to fresh 2 hours"
          >
            <RotateCcw className="w-3 h-3 text-zinc-400" />
            <span>Reset 2h</span>
          </button>
        </div>
      </div>
    </header>
  );
}
