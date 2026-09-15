import { PRICING_PLANS, VM_SERVICE_CONFIG, PricingPlan } from '@/config/vm-service';

export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.id === planId);
}

const WARNING_THRESHOLD_SECONDS = VM_SERVICE_CONFIG.warningThresholdSeconds;

export interface SessionDoc {
  _id: string;
  machineId: string;
  planId: string;
  planName: string;
  planPriceInr: number;
  planDurationHours: number;
  status: 'active' | 'warning' | 'extended' | 'expired';
  startedAt: number;
  expiresAt: number;
  extensionCount: number;
  ipAddress: string | null;
  region: string | null;
  vmName: string | null;
  updatedAt: number;
  // Who actually started/last-extended this session — the real per-user
  // attribution "user accounts" needs. Every classmate shares the one
  // physical laptop (TightVNC only allows one connection at a time), so
  // there's never ambiguity about who a given session's usage belongs to.
  startedByEmail: string;
  startedByName: string | null;
  lastActedByEmail: string;
}

export interface TransactionDoc {
  _id: string;
  sessionId: string;
  machineId: string;
  kind: 'start' | 'extend';
  planName: string;
  amountInr: number;
  hoursAdded: number;
  createdAt: number;
  userEmail: string;
  userName: string | null;
}

export function computeStatus(
  remainingSeconds: number,
  extensionCount: number
): 'active' | 'warning' | 'extended' | 'expired' {
  if (remainingSeconds <= 0) return 'expired';
  if (remainingSeconds <= WARNING_THRESHOLD_SECONDS) return 'warning';
  if (extensionCount > 0) return 'extended';
  return 'active';
}

export function docToSession(doc: SessionDoc) {
  const now = Date.now();
  const remainingSeconds = Math.max(0, Math.round((doc.expiresAt - now) / 1000));
  const status = computeStatus(remainingSeconds, doc.extensionCount);
  const plan =
    getPlanById(doc.planId) ||
    ({
      id: doc.planId,
      name: doc.planName,
      durationHours: doc.planDurationHours,
      durationSeconds: doc.planDurationHours * 3600,
      priceInr: doc.planPriceInr,
      features: [],
    } as PricingPlan);

  return {
    id: doc._id,
    machineId: doc.machineId,
    plan,
    status,
    startedAt: doc.startedAt,
    totalDurationSeconds: Math.round((doc.expiresAt - doc.startedAt) / 1000),
    remainingSeconds,
    extensionCount: doc.extensionCount,
    ipAddress: doc.ipAddress,
    region: doc.region,
    vmName: doc.vmName,
    startedByEmail: doc.startedByEmail,
    startedByName: doc.startedByName,
  };
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
