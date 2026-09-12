"use client";

import React, { useState, useRef, useEffect } from "react";
import { SessionStatus, VMSession } from "@/types/workspace";
import {
  Monitor,
  Maximize2,
  Minimize2,
  Terminal,
  RefreshCw,
  Sliders,
  Volume2,
  VolumeX,
  Keyboard,
  Lock,
  Zap,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Play,
  RotateCcw,
  Check,
  Cpu,
  HardDrive,
  Copy,
  Layers,
} from "lucide-react";

interface VMViewerPanelProps {
  session: VMSession;
  onExtendSession: () => void;
  streamUrl?: string;
}

export function VMViewerPanel({
  session,
  onExtendSession,
  streamUrl,
}: VMViewerPanelProps) {
  const isExpired = session.status === "expired";
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeView, setActiveView] = useState<
    "desktop" | "terminal" | "stream"
  >(streamUrl ? "stream" : "desktop");
  const [resolution, setResolution] = useState<"1080p" | "720p" | "fit">("fit");
  const [isMuted, setIsMuted] = useState(false);
  const [keyComboSent, setKeyComboSent] = useState<string | null>(null);
  const [clipboardCopied, setClipboardCopied] = useState(false);

  // Terminal interactive state
  const [terminalHistory, setTerminalHistory] = useState<
    Array<{ type: "input" | "output"; text: string }>
  >([
    {
      type: "output",
      text: "Ubuntu 24.04 LTS (GNU/Linux 6.8.0-45-generic x86_64)",
    },
    {
      type: "output",
      text: "Welcome to RemoteVM Cloud Workspace. Authenticated user: developer.",
    },
    {
      type: "output",
      text: "System load: 0.18, 0.12, 0.08 | Memory: 2.1 GB / 8.0 GB",
    },
    {
      type: "output",
      text: 'Type "help" or run Linux commands (ls, uname -a, htop, neofetch, free, date, whoami).',
    },
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll terminal
  useEffect(() => {
    if (activeView === "terminal") {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalHistory, activeView]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommand.trim() || isExpired) return;

    const cmd = currentCommand.trim();
    const newHistory = [
      ...terminalHistory,
      { type: "input" as const, text: `$ ${cmd}` },
    ];

    const lower = cmd.toLowerCase();
    if (lower === "clear") {
      setTerminalHistory([]);
      setCurrentCommand("");
      return;
    } else if (lower === "help") {
      newHistory.push({
        type: "output",
        text: "Available commands: ls, uname -a, neofetch, htop, free, df -h, date, whoami, python3, ping, clear, exit",
      });
    } else if (lower === "ls" || lower === "ls -la") {
      newHistory.push({
        type: "output",
        text: "drwxr-xr-x 4 developer developer 4096 Sep 11 20:45 .\ndrwxr-xr-x 3 root      root      4096 Sep 11 20:40 ..\n-rw-r--r-- 1 developer developer  220 Sep 11 20:41 .bashrc\ndrwxr-xr-x 2 developer developer 4096 Sep 11 20:42 projects\n-rw-r--r-- 1 developer developer 1024 Sep 11 20:43 app.py\n-rw-r--r-- 1 developer developer  512 Sep 11 20:44 shared_notice.txt",
      });
    } else if (lower === "uname -a") {
      newHistory.push({
        type: "output",
        text: "Linux remote-vm-mumbai-01 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC Thu Aug 15 16:30:22 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux",
      });
    } else if (lower === "neofetch") {
      newHistory.push({
        type: "output",
        text:
          `        .-.          OS: Ubuntu 24.04.1 LTS x86_64
       oo|           Host: RemoteVM Cloud KVM
      /` +
          "`" +
          `|\\          Kernel: 6.8.0-45-generic
     (\\ _)           Uptime: 14 mins
                     Packages: 1420 (dpkg)
                     Shell: bash 5.2.21
                     Terminal: /dev/pts/1
                     CPU: Intel Xeon Gold 6338 (4) @ 3.400GHz
                     Memory: 2154MiB / 7954MiB`,
      });
    } else if (lower.startsWith("python3") || lower.startsWith("python")) {
      newHistory.push({
        type: "output",
        text: "Python 3.12.3 (main, Jul 31 2024, 17:43:48) [GCC 13.2.0] on linux\nScript executed successfully. Output: [RemoteVM session is active. Pricing: ₹100 for 2h]",
      });
    } else if (lower === "free" || lower === "free -h" || lower === "free -m") {
      newHistory.push({
        type: "output",
        text: "               total        used        free      shared  buff/cache   available\nMem:           7.8Gi       2.1Gi       4.5Gi        18Mi       1.2Gi       5.4Gi\nSwap:          2.0Gi          0B       2.0Gi",
      });
    } else if (lower === "whoami") {
      newHistory.push({
        type: "output",
        text: "developer (uid=1000 gid=1000 [sudo])",
      });
    } else if (lower === "date") {
      newHistory.push({ type: "output", text: new Date().toUTCString() });
    } else if (lower === "htop") {
      newHistory.push({
        type: "output",
        text: "Tasks: 84, 126 thr; 1 running\nCPU[||||||                  18.4%]   Tasks: 84\nMem[||||||||||||            2.1G/7.8G] Swp[                    0K/2.0G]",
      });
    } else {
      newHistory.push({
        type: "output",
        text: `bash: ${cmd}: command executed in simulated cloud sandbox. Type "help" for a list of demo commands.`,
      });
    }

    setTerminalHistory(newHistory);
    setCurrentCommand("");
  };

  const handleSendKey = (combo: string) => {
    setKeyComboSent(combo);
    setTimeout(() => setKeyComboSent(null), 1800);
  };

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
        {/* Left: Resolution & View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-950 rounded-lg p-0.5 border border-zinc-800">
            <button
              onClick={() => setActiveView("desktop")}
              className={`px-2.5 py-1 rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeView === "desktop"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop GUI</span>
            </button>
            <button
              onClick={() => setActiveView("terminal")}
              className={`px-2.5 py-1 rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeView === "terminal"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Linux Shell</span>
            </button>
            {streamUrl && (
              <button
                onClick={() => setActiveView("stream")}
                className={`px-2.5 py-1 rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeView === "stream"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>External VNC</span>
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
            <span>Scale:</span>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as any)}
              className="bg-transparent text-zinc-200 outline-none cursor-pointer"
            >
              <option value="fit" className="bg-zinc-900">
                Auto Fit
              </option>
              <option value="1080p" className="bg-zinc-900">
                1080p (1920x1080)
              </option>
              <option value="720p" className="bg-zinc-900">
                720p (1280x720)
              </option>
            </select>
          </div>
        </div>

        {/* Center: Keys & Status feedback */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          {keyComboSent && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono animate-pulse">
              Sent: {keyComboSent}
            </span>
          )}
          <button
            onClick={() => handleSendKey("Ctrl+Alt+Del")}
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 hover:text-white font-mono text-[11px] cursor-pointer"
            title="Send Ctrl+Alt+Del to VM"
          >
            Ctrl+Alt+Del
          </button>
          <button
            onClick={() => handleSendKey("Ctrl+C")}
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 hover:text-white font-mono text-[11px] cursor-pointer"
            title="Send interrupt"
          >
            Ctrl+C
          </button>
          <button
            onClick={handleCopyClipboard}
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 hover:text-white text-[11px] cursor-pointer flex items-center gap-1"
            title="Sync host & VM clipboard"
          >
            {clipboardCopied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>Clipboard</span>
          </button>
        </div>

        {/* Right: Sound, Fullscreen, Diagnostics */}
        <div className="flex items-center gap-2">
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
        {/* Underlay Stream / Simulated Desktop */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isExpired ? "blur-md brightness-40 pointer-events-none filter" : ""
          }`}
        >
          {activeView === "desktop" && (
            <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-zinc-900 to-zinc-950 text-zinc-200 font-sans relative overflow-hidden">
              {/* Desktop Wallpaper Texture & Watermark */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute bottom-12 right-6 pointer-events-none opacity-25 text-right font-mono text-xs">
                <p className="font-bold text-white">Ubuntu 24.04 LTS (XFCE4)</p>
                <p>RemoteVM Dedicated KVM Session</p>
                <p>Host: ap-south-1.mumbai.internal</p>
              </div>

              {/* Desktop Top Menu Bar (Ubuntu/XFCE style) */}
              <div className="h-7 bg-zinc-900/90 border-b border-zinc-800/80 px-3 flex items-center justify-between text-xs backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-blue-400 flex items-center gap-1">
                    <Monitor className="w-3.5 h-3.5" /> Applications
                  </span>
                  <span className="text-zinc-400 hidden sm:inline">Places</span>
                  <span className="text-zinc-400 hidden sm:inline">System</span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Cpu className="w-3 h-3" />
                    <span>CPU: 18%</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-400">
                    <HardDrive className="w-3 h-3" />
                    <span>RAM: 2.1 GB / 8.0 GB</span>
                  </div>
                  <span className="text-zinc-200 font-mono">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>

              {/* Desktop Body / Open Windows */}
              <div className="flex-1 p-6 relative">
                {/* Desktop Icons */}
                <div className="flex flex-col gap-5 w-20 text-center text-xs">
                  <div
                    onClick={() => setActiveView("terminal")}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-emerald-400 shadow-md">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <span className="text-zinc-300 text-[11px]">Terminal</span>
                  </div>

                  <div
                    onClick={() => {}}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-blue-400 shadow-md">
                      <HardDrive className="w-6 h-6" />
                    </div>
                    <span className="text-zinc-300 text-[11px]">
                      Files (50GB)
                    </span>
                  </div>

                  <div
                    onClick={() => {}}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-amber-400 shadow-md">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <span className="text-zinc-300 text-[11px]">Monitor</span>
                  </div>
                </div>

                {/* Floating Interactive Window preview */}
                <div className="absolute top-8 left-28 right-8 bottom-8 rounded-xl border border-zinc-700/80 bg-zinc-950/95 shadow-2xl flex flex-col overflow-hidden">
                  <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="font-mono text-zinc-300">
                        bash — 80x24
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      Status: Running
                    </span>
                  </div>

                  <div className="flex-1 p-4 font-mono text-xs text-zinc-300 overflow-y-auto space-y-1.5 bg-black/80">
                    <p className="text-zinc-400">
                      Welcome to Ubuntu 24.04.1 LTS (RemoteVM Enterprise Node)
                    </p>
                    <p className="text-zinc-400">
                      * Documentation: https://help.ubuntu.com
                    </p>
                    <p className="text-zinc-400">
                      * Management: https://landscape.canonical.com
                    </p>
                    <p className="text-emerald-400 pt-2">
                      developer@remote-vm:~${" "}
                      <span className="text-white">uptime</span>
                    </p>
                    <p className="text-zinc-300">
                      {" "}
                      20:50:12 up 15 min, 1 user, load average: 0.08, 0.12, 0.10
                    </p>
                    <p className="text-emerald-400 pt-1">
                      developer@remote-vm:~${" "}
                      <span className="text-white">cat /etc/issue</span>
                    </p>
                    <p className="text-zinc-300">Ubuntu 24.04 LTS \n \l</p>
                    <p className="text-blue-400 pt-2 text-[11px]">
                      Tip: Switch to the &quot;Linux Shell&quot; tab in the
                      header above to execute your own interactive commands!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "terminal" && (
            <div className="flex-1 flex flex-col bg-black font-mono text-xs text-zinc-200 p-4">
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
                {terminalHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`whitespace-pre-wrap leading-relaxed ${
                      item.type === "input"
                        ? "text-emerald-400 font-bold"
                        : "text-zinc-300 font-normal"
                    }`}
                  >
                    {item.text}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Interactive command input */}
              <form
                onSubmit={handleCommandSubmit}
                className="mt-3 pt-2 border-t border-zinc-800 flex items-center gap-2"
              >
                <span className="text-emerald-400 font-bold shrink-0">
                  developer@cloud-vm:~$
                </span>
                <input
                  type="text"
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  disabled={isExpired}
                  placeholder={
                    isExpired
                      ? "Session expired - extend to resume"
                      : "Type Linux command (e.g. ls, uname -a, htop, neofetch)..."
                  }
                  className="flex-1 bg-transparent text-white outline-none border-none font-mono text-xs placeholder:text-zinc-600 disabled:opacity-50"
                  autoFocus
                />
              </form>
            </div>
          )}

          {activeView === "stream" && streamUrl && (
            <div className="flex-1 bg-zinc-950 flex items-center justify-center">
              <iframe
                src={streamUrl}
                title="Remote Desktop Stream"
                className="w-full h-full border-none"
                allow="fullscreen; clipboard-read; clipboard-write"
              />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CRITICAL REQUIREMENT: Centered Session-Ended Overlay with Blur & Dim */}
        {/* ========================================================================= */}
        {isExpired && (
          <div
            id="session-ended-overlay"
            className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="relative max-w-md w-full rounded-2xl border-2 border-rose-500/60 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 sm:p-8 shadow-2xl shadow-rose-950/50 text-center space-y-6">
              {/* Glowing ring icon */}
              <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20">
                <Lock className="w-8 h-8 text-rose-400 animate-pulse" />
              </div>

              {/* Headline & status */}
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

              {/* Summary of next pricing option */}
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

              {/* Upgrade / Extend Action Buttons */}
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
            WebRTC HTML5 Stream
          </span>
          <span className="text-zinc-600">|</span>
          <span>Latency: 18ms</span>
          <span className="text-zinc-600">|</span>
          <span>FPS: 60</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Encryption: TLS 1.3 AES-256</span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono text-zinc-400">Container: kvm-pod-01</span>
        </div>
      </div>
    </div>
  );
}
