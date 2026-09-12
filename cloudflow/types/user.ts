export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  joinedDate: string;
  accountTier: string;
  totalSessionsCompleted: number;
  totalHoursUsed: number;
  totalSpentInr: number;
  security: {
    twoFactorEnabled: boolean;
    sshKeyConfigured: boolean;
    lastLoginIp: string;
    lastLoginTime: string;
  };
  vmCredentials: {
    username: string;
    sshPort: number;
    assignedIp: string;
    keyFingerprint: string;
  };
}

export interface BillingTransaction {
  id: string;
  date: string;
  description: string;
  amountInr: number;
  hoursAdded: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  invoiceNumber: string;
}
