'use client';

import React from 'react';
import { Cpu, HardDrive, Wifi, BellRing, Hourglass, ShieldAlert, Monitor, TerminalSquare, RefreshCw } from 'lucide-react';
import { VM_SERVICE_CONFIG } from '@/config/vm-service';

export function FeaturesSection() {
  const { hardware } = VM_SERVICE_CONFIG;

  const features = [
    {
      icon: <Monitor className="w-6 h-6 text-blue-400" />,
      title: 'Zero Client Installation',
      description: 'Stream directly inside any modern browser using WebRTC/HTML5 canvas. No slow VPNs or heavy RDP clients required.',
    },
    {
      icon: <BellRing className="w-6 h-6 text-amber-400" />,
      title: 'Active 5-Minute Warning Alerts',
      description: 'Never get cut off unexpectedly. An impossible-to-miss alert triggers exactly 5 minutes before expiration to save or extend.',
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-emerald-400" />,
      title: 'Zero-Interruption Extensions',
      description: 'Pay ₹100 to add 2 more hours without rebooting. Your terminals, background tasks, and open files stay intact.',
    },
    {
      icon: <TerminalSquare className="w-6 h-6 text-indigo-400" />,
      title: 'Full Root / Sudo Access',
      description: 'Run Python, Docker, Node.js, C++, GCC compilers, and package managers on Ubuntu 24.04 LTS.',
    },
    {
      icon: <Hourglass className="w-6 h-6 text-rose-400" />,
      title: 'Fair Real-Time Accounting',
      description: 'Session clock ticks down second-by-second with an explicit visual meter, ensuring total transparency of paid time.',
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-orange-400" />,
      title: 'Transparent Public Workspace',
      description: 'Shared ephemeral ecosystem with visible public disclaimers regarding storage, chat visibility, and data loss.',
    },
  ];

  return (
    <section id="specs" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <h2 className="text-3xl font-black text-white tracking-tight">
          Engineered for Heavy Remote Compute
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Every ₹100 session runs on high-grade enterprise virtualization with dedicated thread isolation.
        </p>
      </div>

      {/* Hardware Specifications Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>Processor</span>
          </div>
          <div className="text-sm font-bold text-white">{hardware.vCpu}</div>
          <div className="text-[11px] text-zinc-400">High clock speed compute</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            <span>Memory & NVMe</span>
          </div>
          <div className="text-sm font-bold text-white">{hardware.ram}</div>
          <div className="text-[11px] text-zinc-400">{hardware.storage}</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>Bandwidth</span>
          </div>
          <div className="text-sm font-bold text-white">1 Gbps Symmetric</div>
          <div className="text-[11px] text-zinc-400">Low jitter & zero packet drop</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
            <Monitor className="w-4 h-4 text-amber-400" />
            <span>Operating System</span>
          </div>
          <div className="text-sm font-bold text-white">Ubuntu 24.04 LTS</div>
          <div className="text-[11px] text-zinc-400">XFCE4 GUI + Shell</div>
        </div>
      </div>

      {/* Feature Highlights Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, index) => (
          <div
            key={index}
            className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3"
          >
            <div className="p-3 w-fit rounded-xl bg-zinc-800/80 border border-zinc-700/60">
              {feat.icon}
            </div>
            <h3 className="text-base font-bold text-white">{feat.title}</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {feat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
