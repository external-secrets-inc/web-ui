import { z } from 'zod';

export type ListenerStatus = 'PENDING_INSTALLATION' | 'OFFLINE';

export const filterSchema = z.object({
  provider: z.array(z.string()),
  policy: z.string().optional(),
  secretName: z.string().optional(),
  policyStatus: z.string().optional(),
  duplicates: z.string().optional(),
  lastAccess: z.string().optional(),
  lastRotation: z.string().optional(),
  accessors: z.string().optional(),
});

export type FilterSchema = z.infer<typeof filterSchema>;

export interface AuditResponseData {
  secretData: AuditTableData[];
  secretsNames: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[]
  policiesNames: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  providers: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
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

export type TimeRange = "Now" | "7D" | "30D" | "90D" | null;

export interface TimeRangeOption {
  days: number;
  label: TimeRange;
}

