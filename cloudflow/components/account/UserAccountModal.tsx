'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { UserProfile, BillingTransaction } from '@/types/user';
import { VMSession } from '@/types/workspace';
import {
  X,
  User,
  Shield,
  CreditCard,
  Key,
  Clock,
  Server,
  Receipt,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Zap,
  LogOut,
} from 'lucide-react';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  session: VMSession;
  transactions: BillingTransaction[];
  onOpenExtendPayment: () => void;
}

export function UserAccountModal({
  isOpen,
  onClose,
  user,
  session,
  transactions,
  onOpenExtendPayment,
}: UserAccountModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'session' | 'billing' | 'credentials'>('profile');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatRemainingTime = (secs: number) => {
    if (secs <= 0) return '00:00:00 (Expired)';
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes
      .toString()
      .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s remaining`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="user-account-modal"
        className="relative w-full max-w-3xl rounded-2xl border border-zinc-700/90 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with User Avatar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-lg shadow-indigo-500/20">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">{user.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {user.accountTier}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                <span>{user.email}</span>
                <span>•</span>
                <span>ID: {user.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close account modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-zinc-800 bg-zinc-950/60 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Account</span>
          </button>

          <button
            onClick={() => setActiveTab('session')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'session'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Active VM Session</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'billing'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Billing & Receipts</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'credentials'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>SSH & Remote Access</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Profile & Account Overview */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Quick Stat Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Total Hours</span>
                  </div>
                  <div className="text-xl font-bold text-white font-mono">{user.totalHoursUsed}h</div>
                  <div className="text-[10px] text-zinc-500">Dedicated compute</div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <Receipt className="w-3.5 h-3.5 text-amber-400" />
                    <span>Total Paid</span>
                  </div>
                  <div className="text-xl font-bold text-amber-300 font-mono">₹{user.totalSpentInr}</div>
                  <div className="text-[10px] text-zinc-500">Pay-as-you-go</div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <Server className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sessions</span>
                  </div>
                  <div className="text-xl font-bold text-white font-mono">{user.totalSessionsCompleted}</div>
                  <div className="text-[10px] text-zinc-500">Completed VM pods</div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Account Status</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </div>
                  <div className="text-[10px] text-zinc-500">Tier-IV Active</div>
                </div>
              </div>

              {/* Personal Details Table */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Personal & Subscription Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800/80 flex justify-between items-center">
                    <span className="text-zinc-400">Full Name</span>
                    <span className="font-semibold text-white">{user.name}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800/80 flex justify-between items-center">
                    <span className="text-zinc-400">Primary Email</span>
                    <span className="font-mono text-zinc-200">{user.email}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800/80 flex justify-between items-center">
                    <span className="text-zinc-400">Member Since</span>
                    <span className="text-zinc-300">{user.joinedDate}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800/80 flex justify-between items-center">
                    <span className="text-zinc-400">Default Hourly Rate</span>
                    <span className="font-bold text-amber-300">₹100 for 2 Hours (₹50/h)</span>
                  </div>
                </div>
              </div>

              {/* Security & Audit Info */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Security & Authentication Logs
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80">
                    <span className="text-zinc-400">Last Login IP</span>
                    <span className="font-mono text-zinc-300">{user.security.lastLoginIp} (Mumbai, IN)</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80">
                    <span className="text-zinc-400">Last Authenticated</span>
                    <span className="text-zinc-300">{user.security.lastLoginTime}</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80">
                    <span className="text-zinc-400">Hardware 2FA</span>
                    <span className="text-emerald-400 font-medium">Enabled (TOTP / Authenticator)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Active VM Session Details */}
          {activeTab === 'session' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{session.vmName}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">Session ID: {session.id}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        session.status === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : session.status === 'expired'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      Status: {session.status}
                    </span>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenExtendPayment();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Extend Plan</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-400 block text-[11px]">Remaining Session Clock</span>
                    <span className="text-base font-black text-amber-300 font-mono mt-0.5 block">
                      {formatRemainingTime(session.remainingSeconds)}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-400 block text-[11px]">Active Plan Rate</span>
                    <span className="text-base font-bold text-white mt-0.5 block">
                      ₹{session.plan.priceInr} for {session.plan.durationHours} Hours
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-400 block text-[11px]">Allocated IPv4</span>
                    <span className="text-sm font-mono text-emerald-400 mt-0.5 block">
                      {session.ipAddress}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-400 block text-[11px]">Deployment Datacenter</span>
                    <span className="text-sm text-zinc-200 mt-0.5 block">
                      {session.region}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span>Extensions Applied: <strong>{session.extensionCount} times</strong></span>
                  <span className="text-blue-400">Warning threshold: 5 minutes prior to expiry</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Billing & Invoices */}
          {activeTab === 'billing' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Transaction History & Invoices
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Official tax receipts with GST compliance
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenExtendPayment();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Add Time (+2h ₹100)</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{txn.description}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {txn.date} • {txn.paymentMethod} • Ref: {txn.id}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="font-bold text-amber-300 text-sm">₹{txn.amountInr}</div>
                        <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                          {txn.status}
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`Downloading tax receipt #${txn.invoiceNumber}`)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                        title="Download Tax Receipt"
                      >
                        <Download className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SSH Credentials & API Access */}
          {activeTab === 'credentials' && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Direct SSH & Terminal Access Credentials
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Connect from your local terminal (macOS, Linux, or PowerShell) using your assigned SSH credentials:
                </p>

                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs flex items-center justify-between gap-2">
                  <span className="text-emerald-400">
                    ssh {user.vmCredentials.username}@{user.vmCredentials.assignedIp} -p {user.vmCredentials.sshPort}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `ssh ${user.vmCredentials.username}@${user.vmCredentials.assignedIp} -p {user.vmCredentials.sshPort}`,
                        'ssh-cmd'
                      )
                    }
                    className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                    title="Copy SSH Command"
                  >
                    {copiedField === 'ssh-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">Username</span>
                    <span className="text-zinc-200 font-mono font-medium">{user.vmCredentials.username}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">SSH Port</span>
                    <span className="text-zinc-200 font-mono font-medium">{user.vmCredentials.sshPort}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80 col-span-2">
                    <span className="text-zinc-500 block text-[10px]">Host Key Fingerprint (SHA256)</span>
                    <span className="text-zinc-400 font-mono text-[11px] break-all">
                      {user.vmCredentials.keyFingerprint}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Account synced with Mumbai KVM Cluster</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                signOut();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 font-semibold cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
