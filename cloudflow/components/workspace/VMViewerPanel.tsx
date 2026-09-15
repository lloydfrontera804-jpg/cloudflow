"use client";

import React, { useState, useRef } from "react";
import { VMSession } from "@/types/workspace";
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Zap,
  ArrowRight,
  Lock,
  Copy,
  Check,
} from "lucide-react";

interface VMViewerPanelProps {
  session: VMSession;
  onExtendSession: () => void;
  streamUrl?: string;
}

// NOTE: This component used to have "Desktop GUI" and "Linux Shell" tabs
// that simulated a fake Ubuntu desktop and a fake terminal (pattern-matching
// typed commands to canned output). Those were removed entirely per project
// decision — they risked making a classmate believe they had real shell
// access to a cloud VM when the only real connection is the VNC stream
// below to the actual Windows laptop. If streamUrl isn't set yet (backend
// hasn't reported a tunnel host), show a plain "connecting" state instead of
// a fallback demo view.
export function VMViewerPanel({
  session,
  onExtendSession,
  streamUrl,
}: VMViewerPanelProps) {
  const isExpired = session.status === "expired";
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [clipboardCopied, setClipboardCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopyClipboard = () => {
    navigator.clipboard?.writeText(
      "https://remotedesktop.local/session/" + session.id,
    );
    setClipboardCopied(true);
    setTimeout(() => setClipboardCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      id="embedded-vm-viewer-panel"
      className="relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden min-h-[580px] lg:min-h-[640px]"
    >
      {/* VM Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-300 gap-2 z-10">
        <div className="flex items-center gap-2 text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-semibold">External VNC — Live Laptop</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyClipboard}
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 hover:text-white text-[11px] cursor-pointer flex items-center gap-1"
            title="Copy session link"
          >
            {clipboardCopied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>Copy Link</span>
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
            title={isMuted ? "Unmute VM Audio" : "Mute VM Audio"}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-zinc-200" />
            )}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main VM Display Surface */}
      <div className="relative flex-1 flex flex-col bg-black overflow-hidden select-none">
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isExpired ? "blur-md brightness-40 pointer-events-none filter" : ""
          }`}
        >
          {streamUrl ? (
            <div className="flex-1 bg-zinc-950 flex items-center justify-center">
              <iframe
                src={streamUrl}
                title="Remote Desktop Stream"
                className="w-full h-full border-none"
                allow="fullscreen; clipboard-read; clipboard-write"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">
              Waiting for the laptop's tunnel to come online…
            </div>
          )}
        </div>

        {isExpired && (
          <div
            id="session-ended-overlay"
            className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="relative max-w-md w-full rounded-2xl border-2 border-rose-500/60 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 sm:p-8 shadow-2xl shadow-rose-950/50 text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20">
                <Lock className="w-8 h-8 text-rose-400 animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Time Limit Reached
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Session Ended
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Your remote virtual machine session duration has elapsed.
                  Interaction with the VM viewer is disabled until you extend
                  the session.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Recommended Extension
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Hot-Swap (Zero Loss)
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="font-bold text-white text-base">
                      Standard 2-Hour Extension
                    </div>
                    <div className="text-xs text-zinc-400">
                      Preserves memory state & terminal sessions
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-300">
                      ₹100
                    </span>
                    <span className="text-xs text-zinc-400"> / 2h</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <button
                  id="overlay-extend-payment-btn"
                  onClick={onExtendSession}
                  className="w-full py-4 px-6 rounded-xl font-extrabold text-base text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-indigo-600/30 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                >
                  <Zap className="w-5 h-5 text-amber-300 fill-amber-300 group-hover:scale-110 transition-transform" />
                  <span>Extend Session for ₹100</span>
                  <ArrowRight className="w-5 h-5 text-zinc-200" />
                </button>

                <p className="text-[11px] text-zinc-400">
                  Instant resumption • Secure UPI & Card checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VM Bottom Status Footer */}
      <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            VNC over Cloudflare Tunnel
          </span>
        </div>
      </div>
    </div>
  );
}
