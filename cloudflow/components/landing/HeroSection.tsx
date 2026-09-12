'use client';

import React from 'react';
import { Play, Sparkles, Clock, ShieldAlert, Cpu, HardDrive, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onStartSession: () => void;
  onViewPricing: () => void;
}

export function HeroSection({ onStartSession, onViewPricing }: HeroSectionProps) {
  return (
    <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 text-xs shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>High-Performance Remote Linux Desktop</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span className="font-semibold text-amber-300">₹100 for 2 Hours</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          Your Dedicated Cloud VM. <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
            Instant In-Browser Workspace.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          Rent on-demand virtual machine power right inside your browser. Enjoy full root access, low-latency streaming,
          real-time session warnings, and seamless 1-click time extensions.
        </p>

        {/* CTA Group */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="hero-cta-start-session"
            onClick={onStartSession}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer group"
          >
            <Play className="w-5 h-5 fill-white text-white group-hover:translate-x-0.5 transition-transform" />
            <span>Start 2-Hour Session for ₹100</span>
          </button>

          <button
            id="hero-cta-view-plans"
            onClick={onViewPricing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/80 rounded-2xl transition-all cursor-pointer"
          >
            <span>View Pricing & Specs</span>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-y-3 gap-x-6 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Instant HTML5 Stream (No installs)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>5-Min Expiry Alert Notification</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>Extend Anytime with ₹100</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Public Ephemeral Storage Notice</span>
          </div>
        </div>
      </div>

      {/* Interactive Desktop Preview Frame */}
      <div className="mt-12 relative max-w-5xl mx-auto rounded-2xl border border-zinc-700/80 bg-zinc-900/90 shadow-2xl shadow-black/80 overflow-hidden">
        {/* Frame Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="ml-2 font-mono text-zinc-300 font-medium">user@cloud-vm-mumbai-01: ~</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Session Time: 01:54:12</span>
            </div>
            <div className="hidden sm:block text-[11px] font-mono text-zinc-400">
              4 vCPU • 8 GB RAM • 1080p 60fps
            </div>
          </div>
        </div>

        {/* Frame Content Simulation */}
        <div className="bg-zinc-950 p-6 font-mono text-xs text-zinc-300 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[280px]">
          <div className="space-y-2 border border-zinc-800 rounded-xl p-4 bg-black/60 shadow-inner">
            <div className="text-zinc-400 flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-emerald-400 font-bold">$ neofetch --stdout</span>
              <span className="text-[10px] text-zinc-400">bash</span>
            </div>
            <div className="space-y-1 text-zinc-300 text-[11px] leading-relaxed">
              <p><span className="text-blue-400">OS:</span> Ubuntu 24.04.1 LTS x86_64</p>
              <p><span className="text-blue-400">Host:</span> KVM Cloud Virtual Machine</p>
              <p><span className="text-blue-400">Kernel:</span> 6.8.0-45-generic</p>
              <p><span className="text-blue-400">Uptime:</span> 12 mins (Session remaining: 1h 48m)</p>
              <p><span className="text-blue-400">Packages:</span> 1420 (dpkg), 8 (snap)</p>
              <p><span className="text-blue-400">Shell:</span> bash 5.2.21</p>
              <p><span className="text-blue-400">Resolution:</span> 1920x1080 @ 60Hz</p>
              <p><span className="text-blue-400">CPU:</span> Intel Xeon Gold (4) @ 3.392GHz</p>
              <p><span className="text-blue-400">Memory:</span> 2145MiB / 7954MiB (26%)</p>
            </div>
          </div>

          <div className="flex flex-col justify-between border border-zinc-800 rounded-xl p-4 bg-gradient-to-br from-zinc-900 to-zinc-950">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
                <span className="font-semibold text-zinc-200">Session Lifecycle Safeguards</span>
                <span className="text-amber-400">Active Monitoring</span>
              </div>
              <div className="mt-3 space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">Session Standard Rate:</span>
                  <span className="font-bold text-amber-300">₹100 for 2 Hours</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">Auto Warning Alert:</span>
                  <span className="font-bold text-orange-400">At 5m 00s remaining</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">Expiry Behavior:</span>
                  <span className="text-red-400 font-medium">Blur + Freeze overlay</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">Hot-Swap Extension:</span>
                  <span className="text-emerald-400 font-medium">Preserve open apps</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">Ready to code, compile & test</span>
              <button
                onClick={onStartSession}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Launch Now</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
