'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert, FileWarning, Lock } from 'lucide-react';
import { VM_SERVICE_CONFIG } from '@/config/vm-service';

interface DisclaimerBannerProps {
  variant?: 'compact' | 'full' | 'workspace-sidebar';
  onAcknowledge?: () => void;
  acknowledged?: boolean;
}

export function DisclaimerBanner({ variant = 'full', onAcknowledge, acknowledged }: DisclaimerBannerProps) {
  const { items } = VM_SERVICE_CONFIG.disclaimerNotice;

  const iconMap: Record<string, React.ReactNode> = {
    'disc-data-loss': <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />,
    'disc-file-storage': <FileWarning className="w-5 h-5 text-amber-400 shrink-0" />,
    'disc-no-sensitive-data': <Lock className="w-5 h-5 text-red-400 shrink-0" />,
  };

  if (variant === 'compact') {
    return (
      <div
        id="compact-disclaimer-banner"
        className="w-full bg-amber-950/40 border border-amber-600/40 rounded-xl p-3.5 text-amber-200 text-xs flex items-start gap-3 shadow-sm backdrop-blur-sm"
      >
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] block">
            Critical Disclaimers & Shared Storage Notice
          </span>
          <p className="text-zinc-300 leading-relaxed">
            Uploaded files on this shared ephemeral system are <strong>visible to other users</strong> and{' '}
            <strong>may be subject to deletion</strong>. We are not responsible for any data loss or data leaks. Do not
            upload sensitive or confidential information.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'workspace-sidebar') {
    return (
      <div
        id="workspace-sidebar-disclaimer"
        className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3 text-xs"
      >
        <div className="flex items-center gap-2 text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Security & Privacy Notice</span>
        </div>
        <ul className="space-y-2 text-zinc-300">
          <li className="flex items-start gap-2">
            <span className="text-red-400 font-bold">•</span>
            <span className="text-red-200">We are not responsible for any data loss or data leaks.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span>Uploaded files stored on the shared system are accessible to active users.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400 font-bold">•</span>
            <span className="text-red-200 font-medium">
              Users should not upload sensitive, private, or confidential information.
            </span>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <section id="disclaimer-section" className="w-full max-w-5xl mx-auto my-12 px-4">
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-zinc-900/90 shadow-2xl backdrop-blur-md p-6 sm:p-8">
        {/* Ambient warning subtle backlight */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
                  Mandatory Service & Data Privacy Disclaimers
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Please review these operational policies carefully before launching your remote VM workspace.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold self-start sm:self-center">
              <ShieldAlert className="w-3.5 h-3.5" />
              Public Environment
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                id={`disclaimer-card-${item.id}`}
                className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all ${
                  item.severity === 'alert'
                    ? 'border-red-500/30 bg-red-950/15 hover:border-red-500/50'
                    : 'border-amber-500/25 bg-amber-950/15 hover:border-amber-500/40'
                }`}
              >
                {iconMap[item.id] || <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-zinc-200">{item.title}</h4>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      item.severity === 'alert' ? 'text-red-200 font-medium' : 'text-zinc-300'
                    }`}
                  >
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {onAcknowledge && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800">
              <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm text-zinc-300 select-none">
                <input
                  type="checkbox"
                  id="disclaimer-acknowledge-checkbox"
                  checked={acknowledged}
                  onChange={onAcknowledge}
                  className="w-4 h-4 rounded border-zinc-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-900 bg-zinc-800 cursor-pointer"
                />
                <span>I acknowledge that storage is ephemeral, subject to deletion, and I will not store private data.</span>
              </label>
              <div className="text-[11px] text-zinc-400 text-right">Updated for Public Compliance</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
