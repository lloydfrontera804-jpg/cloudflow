'use client';

import React, { useState, useEffect } from 'react';
import { PRICING_PLANS, PricingPlan, VM_SERVICE_CONFIG } from '@/config/vm-service';
import { VMSession, SessionStatus, SharedFile } from '@/types/workspace';
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
  Terminal,
  Shield,
  ArrowRight,
  HardDrive,
  Activity,
} from 'lucide-react';

export default function RemoteVMApp() {
  // Navigation view: 'landing' | 'workspace'
  const [currentView, setCurrentView] = useState<'landing' | 'workspace'>('landing');

  // User Account Details State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'usr_c79f4a12',
    name: 'Polite Cyber Gamer',
    email: 'politecybergamer@gmail.com',
    joinedDate: 'September 2026',
    accountTier: 'Tier-IV Dedicated Cloud',
    totalSessionsCompleted: 14,
    totalHoursUsed: 28,
    totalSpentInr: 1400,
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

  // Transaction History State
  const [transactions, setTransactions] = useState<BillingTransaction[]>([
    {
      id: 'TXN-9428B71',
      date: 'Today, 20:52 IST',
      description: 'Starter Workspace (2 Hours @ ₹50/h)',
      amountInr: 100,
      hoursAdded: 2,
      paymentMethod: 'UPI (Google Pay)',
      status: 'completed',
      invoiceNumber: 'INV-2026-09-8812',
    },
    {
      id: 'TXN-7182C40',
      date: 'Yesterday, 18:30 IST',
      description: 'Workspace Extension (2 Hours @ ₹50/h)',
      amountInr: 100,
      hoursAdded: 2,
      paymentMethod: 'Card (Visa ending 8821)',
      status: 'completed',
      invoiceNumber: 'INV-2026-09-8794',
    },
  ]);

  // Account Modal Open State
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Active Session State
  const [session, setSession] = useState<VMSession>(() => {
    const defaultPlan = PRICING_PLANS[0]; // ₹100 for 2 hours
    return {
      id: 'session-live-01',
      plan: defaultPlan,
      status: 'active',
      startedAt: Date.now(),
      totalDurationSeconds: defaultPlan.durationSeconds, // 7200s
      remainingSeconds: defaultPlan.durationSeconds, // 7200s (2 hours)
      extensionCount: 0,
      ipAddress: '143.244.138.92',
      region: 'Mumbai, India (ap-south-1)',
      vmName: 'cloud-vm-mumbai-01',
    };
  });

  // Timer speed multiplier (1x, 10x, 60x for testing)
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isInitialPurchase, setIsInitialPurchase] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan>(PRICING_PLANS[0]);

  // Diagnostics Modal State
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // Disclaimer agreement state
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);

  // Workspace Sidebar Tab: 'files' | 'disclaimer'
  const [sidebarTab, setSidebarTab] = useState<'files' | 'disclaimer'>('files');

  // Shared Ephemeral Files State
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

  // Real-time Session Countdown Tick
  useEffect(() => {
    if (session.remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setSession((prev) => {
        if (prev.remainingSeconds <= 0) {
          if (prev.status !== 'expired') {
            return { ...prev, remainingSeconds: 0, status: 'expired' };
          }
          return prev;
        }

        const nextSeconds = Math.max(0, prev.remainingSeconds - speedMultiplier);
        let nextStatus = prev.status;

        if (nextSeconds === 0) {
          nextStatus = 'expired';
        } else if (nextSeconds <= VM_SERVICE_CONFIG.warningThresholdSeconds) {
          // Exactly 5 minutes (300 seconds) or less
          nextStatus = 'warning';
        } else if (prev.extensionCount > 0) {
          nextStatus = 'extended';
        } else {
          nextStatus = 'active';
        }

        return {
          ...prev,
          remainingSeconds: nextSeconds,
          status: nextStatus,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [speedMultiplier, session.remainingSeconds]);

  // Handlers for Plan Selection and Starting Session
  const handleSelectPlanFromLanding = (plan: PricingPlan) => {
    setPendingPlan(plan);
    setIsInitialPurchase(true);
    setIsPaymentOpen(true);
  };

  const handleStartSessionDirect = () => {
    setPendingPlan(PRICING_PLANS[0]); // ₹100 for 2 hours
    setIsInitialPurchase(true);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (addedSeconds: number, plan: PricingPlan) => {
    setIsPaymentOpen(false);

    setSession((prev) => {
      const isExpiredOrZero = prev.remainingSeconds <= 0;
      const newRemaining = isExpiredOrZero ? addedSeconds : prev.remainingSeconds + addedSeconds;
      const newTotal = isExpiredOrZero ? addedSeconds : prev.totalDurationSeconds + addedSeconds;

      return {
        ...prev,
        plan,
        status: newRemaining <= 300 ? 'warning' : 'extended',
        totalDurationSeconds: newTotal,
        remainingSeconds: newRemaining,
        extensionCount: isInitialPurchase ? prev.extensionCount : prev.extensionCount + 1,
      };
    });

    // Add to transaction log
    const newTxn: BillingTransaction = {
      id: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      date: 'Just now',
      description: `${plan.name} (${plan.durationHours} Hours)`,
      amountInr: plan.priceInr,
      hoursAdded: plan.durationHours,
      paymentMethod: 'UPI / NetBanking',
      status: 'completed',
      invoiceNumber: `INV-2026-09-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // Update user stats
    setUserProfile((prev) => ({
      ...prev,
      totalHoursUsed: prev.totalHoursUsed + plan.durationHours,
      totalSpentInr: prev.totalSpentInr + plan.priceInr,
      totalSessionsCompleted: prev.totalSessionsCompleted + (isInitialPurchase ? 1 : 0),
    }));

    // Enter workspace immediately
    setCurrentView('workspace');
  };

  // Demo Simulation Actions
  const handleSimulateWarning = () => {
    setSession((prev) => ({
      ...prev,
      remainingSeconds: 295, // 4m 55s (under 300s / 5m warning threshold)
      status: 'warning',
    }));
  };

  const handleSimulateExpire = () => {
    setSession((prev) => ({
      ...prev,
      remainingSeconds: 0,
      status: 'expired',
    }));
  };

  const handleResetSession = () => {
    const defaultPlan = PRICING_PLANS[0];
    setSession({
      id: 'session-live-' + Math.random().toString(36).substring(2, 6),
      plan: defaultPlan,
      status: 'active',
      startedAt: Date.now(),
      totalDurationSeconds: defaultPlan.durationSeconds,
      remainingSeconds: defaultPlan.durationSeconds,
      extensionCount: 0,
      ipAddress: '143.244.138.92',
      region: 'Mumbai, India (ap-south-1)',
      vmName: 'cloud-vm-mumbai-01',
    });
    setSpeedMultiplier(1);
  };

  const handleToggleSpeed = () => {
    setSpeedMultiplier((curr) => {
      if (curr === 1) return 10;
      if (curr === 10) return 60;
      return 1;
    });
  };

  // File Handlers
  const handleUploadFile = (file: SharedFile) => {
    setSharedFiles((prev) => [file, ...prev]);
  };

  const handleDeleteFile = (fileId: string) => {
    setSharedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* View Switcher: Landing View vs Workspace View */}
      {currentView === "landing" ? (
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <LandingHeader
            onOpenWorkspace={() => setCurrentView("workspace")}
            onOpenPricing={() => {
              const pricingEl = document.getElementById("pricing");
              pricingEl?.scrollIntoView({ behavior: "smooth" });
            }}
            onOpenDisclaimer={() => {
              const disclaimerEl =
                document.getElementById("disclaimer-section");
              disclaimerEl?.scrollIntoView({ behavior: "smooth" });
            }}
            onOpenAccount={() => setIsAccountOpen(true)}
            user={userProfile}
          />

          {/* Hero Section */}
          <HeroSection
            onStartSession={handleStartSessionDirect}
            onViewPricing={() => {
              const pricingEl = document.getElementById("pricing");
              pricingEl?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          {/* Core Pricing Cards (Featuring ₹100 for 2 Hours) */}
          <PricingCards onSelectPlan={handleSelectPlanFromLanding} />

          {/* Technical Hardware Specs & Features */}
          <FeaturesSection />

          {/* Prominent Mandatory Disclaimers Section */}
          <DisclaimerBanner
            variant="full"
            onAcknowledge={() => setDisclaimerAgreed(!disclaimerAgreed)}
            acknowledged={disclaimerAgreed}
          />

          {/* Landing Footer */}
          <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white">
                  RemoteVM Workspace Service
                </span>
                <span>• ₹100 for 2 Hours Standard Compute</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-zinc-400">
                <button
                  onClick={() => setCurrentView("workspace")}
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
      ) : (
        /* Workspace Active View */
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Workspace Sticky Topbar with Countdown & Actions */}
          <WorkspaceHeader
            session={session}
            speedMultiplier={speedMultiplier}
            onToggleSpeed={handleToggleSpeed}
            onSimulateWarning={handleSimulateWarning}
            onSimulateExpire={handleSimulateExpire}
            onResetSession={handleResetSession}
            onOpenExtendPayment={() => {
              setIsInitialPurchase(false);
              setPendingPlan(PRICING_PLANS[0]);
              setIsPaymentOpen(true);
            }}
            onReturnHome={() => setCurrentView("landing")}
            onOpenAccount={() => setIsAccountOpen(true)}
            user={userProfile}
          />

          {/* Exactly 5-minute warning banner (shown when remaining <= 300s & > 0) */}
          {session.status === "warning" && (
            <WarningBanner
              remainingSeconds={session.remainingSeconds}
              onExtend={() => {
                setIsInitialPurchase(false);
                setPendingPlan(PRICING_PLANS[0]);
                setIsPaymentOpen(true);
              }}
            />
          )}

          {/* Main Workspace Body */}
          <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
            {/* Left/Main Column: The Embedded VM Viewer Panel */}
            <div className="flex-1 flex flex-col space-y-4">
              <VMViewerPanel
                session={session}
                onExtendSession={() => {
                  setIsInitialPurchase(false);
                  setPendingPlan(PRICING_PLANS[0]);
                  setIsPaymentOpen(true);
                }}
                streamUrl={`/novnc/vnc_lite.html?host=${process.env.NEXT_PUBLIC_VNC_HOST}&port=443&encrypt=true&autoconnect=true&password=${process.env.NEXT_PUBLIC_VNC_PASSWORD}&resize=scale`}
              />

              {/* Compact Disclaimer under VM panel for rapid reference */}
              <DisclaimerBanner variant="compact" />
            </div>

            {/* Right Column: Shared Ephemeral Files & Notices Panels */}
            <div className="w-full lg:w-96 flex flex-col space-y-4 shrink-0">
              {/* Tab Selector */}
              <div className="flex items-center bg-zinc-900 rounded-xl p-1 border border-zinc-800 text-xs">
                <button
                  onClick={() => setSidebarTab("files")}
                  className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    sidebarTab === "files"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Public Files</span>
                </button>

                <button
                  onClick={() => setSidebarTab("disclaimer")}
                  className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    sidebarTab === "disclaimer"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Notices</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1">
                {sidebarTab === "files" && (
                  <SharedFilesPanel
                    files={sharedFiles}
                    onUploadFile={handleUploadFile}
                    onDeleteFile={handleDeleteFile}
                  />
                )}

                {sidebarTab === "disclaimer" && (
                  <DisclaimerBanner variant="workspace-sidebar" />
                )}
              </div>

              {/* Node Quick Specs Trigger Card */}
              <div
                onClick={() => setIsDiagnosticsOpen(true)}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 text-zinc-300">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">
                      4 vCPU • 8 GB RAM • 50GB SSD
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Click to inspect node telemetry
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Payment Upgrade & Start Modal */}
      <ExtendPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        initialPlan={pendingPlan}
        isInitialPurchase={isInitialPurchase}
      />

      {/* User Account Details Modal */}
      <UserAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={userProfile}
        session={session}
        transactions={transactions}
        onOpenExtendPayment={() => {
          setIsAccountOpen(false);
          setIsInitialPurchase(false);
          setPendingPlan(PRICING_PLANS[0]);
          setIsPaymentOpen(true);
        }}
      />

      {/* Node Diagnostics Modal */}
      <HardwareDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        vmIp={session.ipAddress}
      />
    </div>
  );
}
