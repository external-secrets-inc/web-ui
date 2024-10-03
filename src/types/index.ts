// Eventually when this file grows, just organize into separate files with this index.ts file importing them

export interface Agent {
  id: string;
  name: string;
  current_status: string;
}

export interface ApiWrapperOptions {
  defaultError: string;
  suppressToast?: boolean;
}

export interface IUserData {
  name: string;
  tenant: string;
  tenantId: string;
  userId: string;
};

export interface Feature {
  name: string;
  description: string;
}

export interface Subscription {
  id: string;
  name: string;
  maxLimit: number;
  expiryDate: string;
  features: Feature[];
}

// Segment Analytics
declare global {
  interface Window {
    analytics: SegmentAnalytics.AnalyticsJS;
  }
}

// Ensure this file is treated as a module for TS and actually make the global declaration work
export {};