'use client';

import React from 'react';
import { Terminal, Shield, Zap, User } from 'lucide-react';
import { UserProfile } from '@/types/user';

interface LandingHeaderProps {
  onOpenWorkspace: () => void;
  onOpenPricing: () => void;
  onOpenDisclaimer: () => void;
  onOpenAccount: () => void;
  user: UserProfile;
  isSignedIn: boolean;
}

export function LandingHeader({
  onOpenWorkspace,
  onOpenPricing,
  onOpenDisclaimer,
  onOpenAccount,
  user,
  isSignedIn,
}: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/20 text-white font-bold">
            <Terminal className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-lg">RemoteVM</span>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                Live
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 -mt-0.5">Cloud Workspaces On-Demand</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
          <button
            onClick={onOpenPricing}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Pricing</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700">
              ₹100 / 2h
            </span>
          </button>
          <a
            href="#specs"
            className="hover:text-white transition-colors cursor-pointer"
          >
            Specifications
          </a>
          <button
            onClick={onOpenDisclaimer}
            className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 text-zinc-300"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Disclaimers</span>
          </button>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <button
              id="header-user-account-btn"
              onClick={onOpenAccount}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium cursor-pointer transition-colors"
              title="View User Account Details"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-[10px]">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden sm:inline">{user.email.split('@')[0]}</span>
            </button>
          ) : (
            <button
              id="header-user-account-btn"
              onClick={onOpenAccount}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-semibold cursor-pointer transition-colors"
              title="Sign in"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Sign in</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mumbai Tier-IV • 18ms</span>
          </div>
          <button
            id="header-cta-launch"
            onClick={onOpenWorkspace}
            className="relative group inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md hover:shadow-indigo-500/25 hover:from-blue-500 hover:to-indigo-500 active:scale-98 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Launch Workspace</span>
          </button>
        </div>
      </div>
    </header>
  );
}
