// Eventually when this file grows, just organize into separate files with this index.ts file importing them

export interface Agent {
  id: string;
  name: string;
  current_status: string;
}

export interface Rotator {
  id: string;
  name: string;
  current_status: string;
  enabled: boolean;
  tags: string[];
}

export interface Manifest {
  manifest: string
}

export interface Process {
  process: string
}

export interface ApiWrapperOptions {
  defaultError: string;
  suppressToast?: boolean;
}


export interface ApiHttpError {
  errors: {body: string}
}

export interface IUserData {
  name: string;
  tenant: string;
  tenantId: string;
  email: string;
  userId: string;
  isActive: boolean;
  organizationURL: string;
};

export interface BackendUserData {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

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
