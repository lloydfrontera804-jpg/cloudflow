import crypto from 'crypto';

export interface MachineDoc {
  _id: string;
  name: string;
  status: 'active' | 'disabled';
  tunnelHost: string | null;
  tunnelHostUpdatedAt: number | null;
  // Each machine gets its OWN report key, not a shared global one. The
  // laptop-side reporter script identifies itself purely by this key — no
  // separate machineId needs to be configured on the laptop, and revoking
  // one machine's key (e.g. it's decommissioned) can't affect any other
  // machine.
  tunnelReportKey: string;
  createdAt: number;
  createdByEmail: string;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export function newMachineId(): string {
  return 'machine-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export function newTunnelReportKey(): string {
  return crypto.randomBytes(24).toString('hex');
}
