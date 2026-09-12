export interface PricingPlan {
  id: string;
  name: string;
  durationHours: number;
  durationSeconds: number;
  priceInr: number;
  isPopular?: boolean;
  savingsBadge?: string;
  features: string[];
}

export interface DisclaimerItem {
  id: string;
  title: string;
  text: string;
  severity: 'warning' | 'alert' | 'info';
}

export interface VMConfig {
  defaultPlanId: string;
  warningThresholdSeconds: number; // Exactly 5 minutes (300 seconds)
  streamType: 'interactive-simulator' | 'vnc-webrtc' | 'iframe';
  streamUrl?: string;
  hardware: {
    os: string;
    vCpu: string;
    ram: string;
    storage: string;
    network: string;
    datacenter: string;
  };
  disclaimerNotice: {
    bannerHeading: string;
    items: DisclaimerItem[];
    strictCheckRequired: boolean;
  };
}

export const VM_SERVICE_CONFIG: VMConfig = {
  defaultPlanId: 'plan-2h-100',
  warningThresholdSeconds: 300, // Exactly 5 minutes
  streamType: 'interactive-simulator',
  hardware: {
    os: 'Ubuntu 24.04 LTS (Cloud Desktop XFCE / HTML5)',
    vCpu: '4 vCPU Intel Xeon @ 3.4 GHz',
    ram: '8 GB DDR4 ECC RAM',
    storage: '50 GB High-Speed NVMe SSD',
    network: '1 Gbps Symmetric Uplink (Low Latency)',
    datacenter: 'Mumbai (Asia-South1, Tier-IV)',
  },
  disclaimerNotice: {
    bannerHeading: 'CRITICAL USAGE & DATA PRIVACY DISCLAIMER',
    strictCheckRequired: true,
    items: [
      {
        id: 'disc-data-loss',
        title: 'No Data Liability',
        text: 'We are not responsible for any data loss or data leaks.',
        severity: 'alert',
      },
      {
        id: 'disc-file-storage',
        title: 'Shared Ephemeral Storage',
        text: 'The same rules apply to uploaded files stored on the system.',
        severity: 'warning',
      },
      {
        id: 'disc-no-sensitive-data',
        title: 'Strict Confidentiality Prohibition',
        text: 'Users should not upload sensitive, private, or confidential information.',
        severity: 'alert',
      },
    ],
  },
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'plan-2h-100',
    name: 'Starter Workspace',
    durationHours: 2,
    durationSeconds: 2 * 3600, // 7200 seconds (2 hours)
    priceInr: 100, // Pricing rule: ₹100 for 2 hours by default
    isPopular: true,
    savingsBadge: 'Default Plan',
    features: [
      '₹100 for 2 full hours (₹50/hr)',
      '4 vCPU + 8 GB RAM + 50 GB NVMe',
      'Instant browser-based remote desktop',
      'Active countdown with 5-min warning',
      'Seamless extension before or on expiry',
    ],
  },
  {
    id: 'plan-4h-190',
    name: 'Extended Workflow',
    durationHours: 4,
    durationSeconds: 4 * 3600,
    priceInr: 190,
    savingsBadge: 'Save 5%',
    features: [
      '₹190 for 4 hours (₹47.5/hr)',
      'Same high-performance specs',
      'Hot-swap extension without reboot',
      'Priority streaming pipeline',
      'Ephemeral workspace persistence',
    ],
  },
  {
    id: 'plan-8h-350',
    name: 'Full Day Intensive',
    durationHours: 8,
    durationSeconds: 8 * 3600,
    priceInr: 350,
    savingsBadge: 'Best Value • Save 12%',
    features: [
      '₹350 for 8 hours (₹43.7/hr)',
      'Continuous remote desktop session',
      'Ideal for heavy compile or batch jobs',
      'Dedicated egress bandwidth',
      'Early warning notifications',
    ],
  },
];
