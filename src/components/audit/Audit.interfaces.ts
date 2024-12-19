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
  tenant_id: string;
  status: ListenerStatus;
}

export type TimeRange = "Now" | "7D" | "30D" | "90D" | null;

export interface TimeRangeOption {
  days: number;
  label: TimeRange;
}

export interface PolicyTableData {
  id: string;
  name: string;
  executeOn: string[];
  providers: string[];
}

export interface CreatePolicyPayload {
  tenantID: string;
  name: string;
  engine: string;
  executeOn: string[];
  rule: string;
}

export type AddPolicyFieldType = 'string' | 'strArray' | 'textArea';

export interface AddPolicyFieldSchema {
  type: AddPolicyFieldType;
  required: boolean;
  maxLength?: number;
  accept?: string;
}

interface AddPolicyType {
  [key: string]: AddPolicyFieldSchema;
}

export interface AddPolicyFormSchema {
  [formType: string]: AddPolicyType;
}

export interface ProviderTableData {
  id: string;
  name: string;
  type: string;
}

export interface CreateProviderPayload {
  listenerID: string;
  tenantID: string;
  name: string;
  backendIdentifier: string;
  backendType: string;
  config: {
    [key: string]: string;
  };
}

export type AddProviderFieldType = 'string' | 'date' | 'file' | 'number' | 'boolean';

export interface AddProviderFieldSchema {
  type: AddProviderFieldType;
  required: boolean;
  maxLength?: number;
  accept?: string;
}

interface AddProviderType {
  [key: string]: AddProviderFieldSchema;
}

export interface AddProviderFormSchema {
  [formType: string]: AddProviderType;
}

export interface AuditMetric {
  kind: string;
  amount: number;
  label: string;
  tooltipLabel?: string;
}

export interface AuditTimelineEntry {
  date: string;
  stats: AuditMetric[];
}
