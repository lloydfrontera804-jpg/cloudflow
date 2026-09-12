'use client';

import React from 'react';
import { X, Cpu, HardDrive, Wifi, Server, Activity, ShieldCheck } from 'lucide-react';
import { VM_SERVICE_CONFIG } from '@/config/vm-service';

interface HardwareDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vmIp: string;
}

export function HardwareDiagnosticsModal({ isOpen, onClose, vmIp }: HardwareDiagnosticsModalProps) {
  if (!isOpen) return null;
  const { hardware } = VM_SERVICE_CONFIG;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">Node Diagnostics & Specs</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center">
            <span className="text-zinc-400">VM Host IPv4:</span>
            <span className="font-mono text-emerald-400 font-bold">{vmIp}</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center">
            <span className="text-zinc-400">Processor:</span>
            <span className="text-zinc-200 font-medium">{hardware.vCpu}</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center">
            <span className="text-zinc-400">Allocated RAM:</span>
            <span className="text-zinc-200 font-medium">{hardware.ram}</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center">
            <span className="text-zinc-400">Root Storage:</span>
            <span className="text-zinc-200 font-medium">{hardware.storage}</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center">
            <span className="text-zinc-400">Stream Protocol:</span>
            <span className="text-blue-400 font-mono">WebRTC over WSS (H.264/VP9)</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center">
            <span className="text-zinc-400">Datacenter:</span>
            <span className="text-zinc-300 font-medium">{hardware.datacenter}</span>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-semibold cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
