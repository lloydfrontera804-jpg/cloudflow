'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PRICING_PLANS, PricingPlan } from '@/config/vm-service';
import { VMSession, SharedFile } from '@/types/workspace';
import { UserProfile, BillingTransaction } from '@/types/user';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { PricingCards } from '@/components/landing/PricingCards';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WarningBanner } from '@/components/workspace/WarningBanner';
import { VMViewerPanel } from '@/components/workspace/VMViewerPanel';
import { SharedFilesPanel } from '@/components/workspace/SharedFilesPanel';
import { ExtendPaymentModal } from '@/components/workspace/ExtendPaymentModal';
import { UserAccountModal } from '@/components/account/UserAccountModal';
import { HardwareDiagnosticsModal } from '@/components/workspace/HardwareDiagnosticsModal';
import {
  fetchSession,
  startSession,
  extendSession,
  fetchTransactions,
  fetchStats,
  fetchTunnelHost,
  debugSession,
} from '@/lib/api';
import { useSession } from 'next-auth/react';
import { AuthModal } from '@/components/auth/AuthModal';
import { MachineSelector } from '@/components/MachineSelector';
import {
  Terminal,
  Shield,
  ArrowRight,
  HardDrive,
  Activity,
} from 'lucide-react';

// UserAccountModal and HardwareDiagnosticsModal (not files I have access to
// edit) both type their session-related props as required/non-nullable —
// left over from the days when `session` was always a hardcoded fake
// object. Real session state can genuinely be null now (no session started
// yet), so this placeholder stands in rather than casting past the type
// checker with `as VMSession`. Ideally these two components' prop types
// should just become optional and handle the "no session" case themselves.
const NO_ACTIVE_SESSION_PLACEHOLDER: VMSession = {
  id: 'no-active-session',
  plan: PRICING_PLANS[0],
  status: 'expired',
  startedAt: 0,
  totalDurationSeconds: 0,
  remainingSeconds: 0,
  extensionCount: 0,
  ipAddress: '',
  region: '',
  vmName: '',
};

// Poll interval for session state. Backend is source of truth now — this
// just refreshes the local mirror of it. 3s keeps the countdown feeling live
// without hammering a free Render instance.
const SESSION_POLL_MS = 3000;

export default function RemoteVMApp() {
  const [currentView, setCurrentView] = useState<'landing' | 'machine-select' | 'workspace'>('landing');

  // Real Google/email identity — see auth.ts. `authStatus` is
  // 'loading' | 'authenticated' | 'unauthenticated'.
  const { data: authData, status: authStatus } = useSession();
  const isSignedIn = authStatus === 'authenticated' && !!authData?.user?.email;
  const userEmail = authData?.user?.email;

  // Which physical laptop the classmate is currently renting. Everything
  // session/tunnel-related below is now scoped to this — null means "no
  // machine chosen yet," which routes to the MachineSelector screen.
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);

  // Email/password sign-in requires actual typed input, unlike a redirect
  // flow — there's nothing to programmatically trigger. Instead, open the
  // real AuthModal so whoever tried to start a session without signing in
  // can do so right there.
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const promptSignIn = () => setIsAuthModalOpen(true);

  // name/email below now get overwritten by the real signed-in identity once
  // available (see the useEffect further down). joinedDate/accountTier/
  // security/vmCredentials are still decorative placeholders — real
  // per-user tracking of those specifically hasn't been built.
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'usr_c79f4a12',
    name: 'Polite Cyber Gamer',
    email: 'politecybergamer@gmail.com',
    joinedDate: 'September 2026',
    accountTier: 'Tier-IV Dedicated Cloud',
    totalSessionsCompleted: 0,
    totalHoursUsed: 0,
    totalSpentInr: 0,
    security: {
      twoFactorEnabled: true,
      sshKeyConfigured: true,
      lastLoginIp: '143.244.138.92',
      lastLoginTime: 'Today at 21:18 IST',
    },
    vmCredentials: {
      username: 'developer',
      sshPort: 2222,
      assignedIp: '143.244.138.92',
      keyFingerprint: 'SHA256:4QzFp9wLxN0gE3yM8vTbV+rU2eS5kY1hD9cW4zJ7lA0',
    },
  });

  // Once a real signed-in identity exists, overwrite the placeholder name/email
  // and dismiss the auth modal if it happened to be open.
  useEffect(() => {
    if (authData?.user?.email) {
      setUserProfile((prev) => ({
        ...prev,
        name: authData.user.name || prev.name,
        email: authData.user.email,
      }));
      setIsAuthModalOpen(false);
    }
  }, [authData]);

  // Transaction history now comes from the backend (real log of actual
  // start/extend calls) instead of a hardcoded fake array. Still no real
  // payment gateway behind it — see roadmap item 2 — but it's no longer
  // fictional data disconnected from what actually happened.
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);

  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Session now lives on the backend. null = no session yet (fresh visitor).
  const [session, setSession] = useState<VMSession | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Where the real laptop's VNC tunnel currently lives. Fetched at runtime
  // from the backend (see /api/tunnel-host) rather than baked into a
  // NEXT_PUBLIC_ build-time env var, since that can't change without a
  // full redeploy and the tunnel hostname can rotate.
  const [vncHost, setVncHost] = useState<string | null>(null);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isInitialPurchase, setIsInitialPurchase] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan>(PRICING_PLANS[0]);

  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'files' | 'disclaimer'>('files');

  // Shared files remain local/fake for now — out of scope for this pass.
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([
    {
      id: 'file-init-1',
      name: 'setup_environment.sh',
      sizeBytes: 1420,
      uploadedAt: '20:30',
      uploadedBy: 'User #312',
      type: 'text/x-shellscript',
    },
    {
      id: 'file-init-2',
      name: 'fastapi_benchmark.py',
      sizeBytes: 4280,
      uploadedAt: '20:41',
      uploadedBy: 'User #805',
      type: 'text/x-python',
    },
  ]);

  const refreshSession = useCallback(async () => {
    if (!selectedMachineId) {
      setIsSessionLoading(false);
      return;
    }
    try {
      const { session: s } = await fetchSession(selectedMachineId);
      setSession(s);
    } catch (err) {
      console.error('Failed to fetch session', err);
    } finally {
      setIsSessionLoading(false);
    }
  }, [selectedMachineId]);

  const refreshTransactionsAndStats = useCallback(async () => {
    try {
      const [{ transactions: txns }, stats] = await Promise.all([
        fetchTransactions(userEmail),
        fetchStats(userEmail),
      ]);
      setTransactions(txns);
      setUserProfile((prev) => ({
        ...prev,
        totalSessionsCompleted: stats.totalSessionsCompleted,
        totalHoursUsed: stats.totalHoursUsed,
        totalSpentInr: stats.totalSpentInr,
      }));
    } catch (err) {
      console.error('Failed to fetch transactions/stats', err);
    }
  }, [userEmail]);

  // Initial load + whenever the selected machine changes.
  useEffect(() => {
    refreshSession();
    refreshTransactionsAndStats();
    if (selectedMachineId) {
      fetchTunnelHost(selectedMachineId)
        .then(({ host }) => setVncHost(host))
        .catch((err) => console.error('Failed to fetch tunnel host', err));
    } else {
      setVncHost(null);
    }
  }, [refreshSession, refreshTransactionsAndStats, selectedMachineId]);

  // Poll the backend for session state. This replaces the old local
  // setInterval that decremented remainingSeconds in the browser — the
  // backend now owns the countdown via a stored expiresAt timestamp, and
  // the frontend just mirrors it. Paused entirely while no machine is
  // selected — nothing to poll yet.
  useEffect(() => {
    if (!selectedMachineId) return;
    const interval = setInterval(refreshSession, SESSION_POLL_MS);
    return () => clearInterval(interval);
  }, [refreshSession, selectedMachineId]);

  // Starting or extending now requires a real, allow-listed sign-in AND a
  // chosen machine. The backend enforces both too (401 without a valid
  // session, 400 without a machineId) — this client-side check just avoids
  // opening a payment modal for someone about to get rejected anyway.
  const handleSelectPlanFromLanding = (plan: PricingPlan) => {
    if (!isSignedIn) return promptSignIn();
    setPendingPlan(plan);
    setIsInitialPurchase(true);
    if (!selectedMachineId) {
      setCurrentView('machine-select');
      return;
    }
    setIsPaymentOpen(true);
  };

  const handleStartSessionDirect = () => {
    if (!isSignedIn) return promptSignIn();
    setPendingPlan(PRICING_PLANS[0]);
    setIsInitialPurchase(true);
    if (!selectedMachineId) {
      setCurrentView('machine-select');
      return;
    }
    setIsPaymentOpen(true);
  };

  // Called once a machine is actually picked, whether that happened via the
  // "no machine yet" redirect above, or from the explicit "Switch machine"
  // button in the workspace.
  const handleMachineSelected = (machineId: string) => {
    setSelectedMachineId(machineId);
    setIsSessionLoading(true);
    if (isInitialPurchase) {
      // Was on the way to starting a NEW session — proceed to payment now
      // that a machine is chosen.
      setIsPaymentOpen(true);
      setCurrentView('workspace');
    } else {
      // Was just switching machines to check on/manage an existing rental.
      setCurrentView('workspace');
    }
  };

  // Payment is still simulated (no real gateway wired in yet — roadmap item
  // 2) but the *session and transaction effects* of a "successful" payment
  // are now real backend calls instead of local state mutation, so at least
  // the timer and transaction log reflect the truth — and now reflect who
  // actually did it, since the backend stamps the signed-in user's email.
  const handlePaymentSuccess = async (_addedSeconds: number, plan: PricingPlan) => {
    if (!isSignedIn) {
      setIsPaymentOpen(false);
      return promptSignIn();
    }
    if (!selectedMachineId) {
      setIsPaymentOpen(false);
      setCurrentView('machine-select');
      return;
    }
    setIsPaymentOpen(false);
    try {
      const { session: s } = isInitialPurchase
        ? await startSession(selectedMachineId, plan.id)
        : await extendSession(selectedMachineId, plan.id);
      setSession(s);
      await refreshTransactionsAndStats();
      setCurrentView('workspace');
    } catch (err) {
      console.error('Payment success handler failed to reach backend', err);
      // Surface this rather than silently pretending it worked — a classmate
      // should know if the backend call actually failed.
      alert('Could not update the session on the server. Please try again.');
    }
  };

  // Dev-only debug controls. These now mutate the real backend row (guarded
  // there by NODE_ENV !== 'production') instead of local state, so they
  // don't get silently overwritten by the next poll tick. The old
  // "speed multiplier" (1x/10x/60x) control has been removed entirely: it
  // has no sane server-side equivalent without continuously rewriting
  // expiresAt, and keeping a UI control that no longer does anything would
  // be exactly the kind of decorative-fake element this pass is trying to
  // remove. If WorkspaceHeader.tsx still has a speed-toggle button wired to
  // onToggleSpeed, remove that button and prop there too.
  const handleSimulateWarning = async () => {
    if (!selectedMachineId) return;
    try {
      const { session: s } = await debugSession(selectedMachineId, 'warning');
      setSession(s);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateExpire = async () => {
    if (!selectedMachineId) return;
    try {
      const { session: s } = await debugSession(selectedMachineId, 'expire');
      setSession(s);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetSession = async () => {
    if (!selectedMachineId) return;
    try {
      const { session: s } = await debugSession(selectedMachineId, 'reset');
      setSession(s);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadFile = (file: SharedFile) => {
    setSharedFiles((prev) => [file, ...prev]);
  };

  const handleDeleteFile = (fileId: string) => {
    setSharedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Build the noVNC URL from the runtime-fetched host rather than a
  // build-time NEXT_PUBLIC_VNC_HOST. Password still travels client-side for
  // now — see roadmap item 4 (moving it server-side is a separate, bigger
  // change involving a backend-issued short-lived connection token).
  const streamUrl = vncHost
    ? `/novnc/vnc_lite.html?host=${vncHost}&port=443&encrypt=true&autoconnect=true&password=${process.env.NEXT_PUBLIC_VNC_PASSWORD}&resize=scale`
    : undefined;

  if (isSessionLoading && currentView === 'workspace') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-sm text-zinc-400">Loading session…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {currentView === 'landing' ? (
        <main className="flex-1 flex flex-col">
          <LandingHeader
            onOpenWorkspace={() => setCurrentView('workspace')}
            onOpenPricing={() => {
              const pricingEl = document.getElementById('pricing');
              pricingEl?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenDisclaimer={() => {
              const disclaimerEl = document.getElementById('disclaimer-section');
              disclaimerEl?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenAccount={() => (isSignedIn ? setIsAccountOpen(true) : setIsAuthModalOpen(true))}
            user={userProfile}
            isSignedIn={isSignedIn}
          />

          <HeroSection
            onStartSession={handleStartSessionDirect}
            onViewPricing={() => {
              const pricingEl = document.getElementById('pricing');
              pricingEl?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <PricingCards onSelectPlan={handleSelectPlanFromLanding} />
          <FeaturesSection />

          <DisclaimerBanner
            variant="full"
            onAcknowledge={() => setDisclaimerAgreed(!disclaimerAgreed)}
            acknowledged={disclaimerAgreed}
          />

          <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white">RemoteVM Workspace Service</span>
                <span>• ₹100 for 2 Hours Standard Compute</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-zinc-400">
                <button
                  onClick={() => setCurrentView('workspace')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Direct Workspace Access
                </button>
                <span>•</span>
                <span>Public Disclaimers Apply</span>
              </div>
            </div>
          </footer>
        </main>
      ) : currentView === 'machine-select' ? (
        <main className="flex-1 flex flex-col">
          <MachineSelector onSelect={handleMachineSelected} />
        </main>
      ) : !session ? (
        // No session yet on this backend — send them back to start one
        // instead of rendering a workspace around a null session.
        <main className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-zinc-300">No active session yet.</p>
          <button
            onClick={handleStartSessionDirect}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
          >
            Start a Session
          </button>
        </main>
      ) : (
        <main className="flex-1 flex flex-col min-h-screen">
          <div className="px-4 py-1.5 bg-zinc-900 border-b border-zinc-800 flex justify-end">
            <button
              onClick={() => {
                setSelectedMachineId(null);
                setCurrentView('machine-select');
              }}
              className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
            >
              Switch machine
            </button>
          </div>
          <WorkspaceHeader
            session={session}
            // TEMPORARY stub props: WorkspaceHeader.tsx still requires these
            // from the old local-only speed-toggle feature. They're
            // deliberately disconnected from anything real now — clicking
            // this button (if it's even still visible) changes a number
            // nobody reads. The correct fix is deleting the speed-toggle
            // button and these two props from WorkspaceHeader.tsx directly;
            // this stub only exists to unblock the TypeScript build until
            // you do that.
            speedMultiplier={1}
            onToggleSpeed={() => {}}
            onSimulateWarning={handleSimulateWarning}
            onSimulateExpire={handleSimulateExpire}
            onResetSession={handleResetSession}
            onOpenExtendPayment={() => {
              setIsInitialPurchase(false);
              setPendingPlan(PRICING_PLANS[0]);
              setIsPaymentOpen(true);
            }}
            onReturnHome={() => setCurrentView('landing')}
            onOpenAccount={() => setIsAccountOpen(true)}
            user={userProfile}
          />

          {session.status === 'warning' && (
            <WarningBanner
              remainingSeconds={session.remainingSeconds}
              onExtend={() => {
                setIsInitialPurchase(false);
                setPendingPlan(PRICING_PLANS[0]);
                setIsPaymentOpen(true);
              }}
            />
          )}

          <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col space-y-4">
              <VMViewerPanel
                session={session}
                onExtendSession={() => {
                  setIsInitialPurchase(false);
                  setPendingPlan(PRICING_PLANS[0]);
                  setIsPaymentOpen(true);
                }}
                streamUrl={streamUrl}
              />
              <DisclaimerBanner variant="compact" />
            </div>

            <div className="w-full lg:w-96 flex flex-col space-y-4 shrink-0">
              <div className="flex items-center bg-zinc-900 rounded-xl p-1 border border-zinc-800 text-xs">
                <button
                  onClick={() => setSidebarTab('files')}
                  className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    sidebarTab === 'files'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Public Files</span>
                </button>

                <button
                  onClick={() => setSidebarTab('disclaimer')}
                  className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    sidebarTab === 'disclaimer'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Notices</span>
                </button>
              </div>

              <div className="flex-1">
                {sidebarTab === 'files' && (
                  <SharedFilesPanel
                    files={sharedFiles}
                    onUploadFile={handleUploadFile}
                    onDeleteFile={handleDeleteFile}
                  />
                )}

                {sidebarTab === 'disclaimer' && <DisclaimerBanner variant="workspace-sidebar" />}
              </div>

              <div
                onClick={() => setIsDiagnosticsOpen(true)}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 text-zinc-300">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">4 vCPU • 8 GB RAM • 50GB SSD</div>
                    <div className="text-[11px] text-zinc-400">Click to inspect node telemetry</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          </div>
        </main>
      )}

      <ExtendPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        initialPlan={pendingPlan}
        isInitialPurchase={isInitialPurchase}
      />

      <UserAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={userProfile}
        session={session ?? NO_ACTIVE_SESSION_PLACEHOLDER}
        transactions={transactions}
        onOpenExtendPayment={() => {
          setIsAccountOpen(false);
          setIsInitialPurchase(false);
          setPendingPlan(PRICING_PLANS[0]);
          setIsPaymentOpen(true);
        }}
      />

      <HardwareDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        vmIp={session?.ipAddress ?? ''}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
  
}
