export type ListenerStatus = 'PENDING_INSTALLATION' | 'OFFLINE';

export interface FilterState {
  provider: string[]; // GCP, Amazon, Azure
  policy?: string | undefined;
  secretName?: string | undefined;
  policyStatus?: string | undefined; // compliant or non-compliant
  duplicates?: string | undefined; // contains or not
  lastAccess?: string | undefined; // ascending, descending, or date
  lastRotation?: string | undefined; // ascending, descending, or date
  accessors?: string | undefined; // contains or not
}

export interface AuditTableData {
  id: string;
  secret: string;
  provider: string;
  lastRotation: string;
  policiesAmount: string;
  fullCompliant: boolean;
  duplicatesAmount: number;
  lastAccess: string;
  accessorsAmount: number;
}

export interface Listener {
  id: string;
  status: ListenerStatus;
}
