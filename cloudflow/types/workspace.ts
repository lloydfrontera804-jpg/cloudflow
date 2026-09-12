import { PricingPlan } from '@/config/vm-service';

export type SessionStatus = 'idle' | 'provisioning' | 'active' | 'warning' | 'expired' | 'extended';

export interface VMSession {
  id: string;
  plan: PricingPlan;
  status: SessionStatus;
  startedAt: number;
  totalDurationSeconds: number;
  remainingSeconds: number;
  extensionCount: number;
  ipAddress: string;
  region: string;
  vmName: string;
}

export interface SharedFile {
  id: string;
  name: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  type: string;
}

export interface PaymentDetails {
  planId: string;
  method: 'upi' | 'card' | 'netbanking';
  upiId?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  bank?: string;
}
