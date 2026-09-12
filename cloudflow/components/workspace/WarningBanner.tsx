'use client';

import React from 'react';
import { AlertTriangle, Clock, Zap, ArrowRight, X } from 'lucide-react';

interface WarningBannerProps {
  remainingSeconds: number;
  onExtend: () => void;
  onDismiss?: () => void;
}

export function WarningBanner({ remainingSeconds, onExtend, onDismiss }: WarningBannerProps) {
  const formatTime = (secs: number) => {
    if (secs <= 0) return '00:00';
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="session-warning-banner"
      className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-xl border-y border-amber-400/50 py-3 px-4 sm:px-6 sticky top-[108px] z-20 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Urgent Alert with pulse */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-black/25 text-amber-200 border border-white/20 shrink-0">
            <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase tracking-wider text-xs bg-black/40 text-amber-200 px-2 py-0.5 rounded-full border border-white/20">
                Critical Warning
              </span>
              <span className="font-bold text-sm sm:text-base text-white">
                Remote VM Session Expiring Soon!
              </span>
            </div>
            <p className="text-xs text-amber-100/90 mt-0.5">
              Your remote desktop session will freeze and lock in exactly{' '}
              <strong className="text-white font-mono bg-black/40 px-1.5 py-0.5 rounded">
                {formatTime(remainingSeconds)}
              </strong>
              . Extend your plan to avoid losing active terminal states.
            </p>
          </div>
        </div>

        {/* Right: Quick Action to extend */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="text-right hidden md:block">
            <span className="text-[11px] text-amber-200 block">Next extension option:</span>
            <span className="font-bold text-xs text-white">₹100 for +2 Hours</span>
          </div>

          <button
            id="warning-banner-extend-btn"
            onClick={onExtend}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-zinc-950 hover:bg-black text-amber-300 hover:text-white border border-amber-300/40 shadow-lg hover:shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Extend Now for ₹100</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-black/20 transition-colors cursor-pointer"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
