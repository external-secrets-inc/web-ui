export interface FilterState {
  provider: string[]; // GCP, Amazon, Azure
  policy: string[];
  secretName: string[];
  policyStatus: boolean | null; // compliant or non-compliant
  duplicates: boolean | null; // contains or not
  lastAccess: string | null; // ascending, descending, or date
  lastRotation: string | null; // ascending, descending, or date
  accessors: boolean | null; // contains or not
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
