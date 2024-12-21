import { z } from "zod";

export type ListenerStatus = "PENDING" | "OFFLINE" | "ACTIVE";

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
  }[];
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

export interface AuditListener {
  listenerID: string;
  tenantID: string;
  status: ListenerStatus;
}

export interface CreateAuditListenerPayload {
  listenerID: string;
  tenantID: string;
}

export interface TenantListener {
  id: string;
  name: string;
  enabled: boolean;
  tags: {
    [key: string]: string;
  };
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

export interface PolicyForm {
  name: string;
  engine: string;
  executeOn: string[];
  sample: string;
  rule: string;
}

export interface ProviderTableData {
  id: string;
  providerID: string;
  name: string;
  backendType: string;
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

export interface CreateTenantListenerPayload {
  name: string;
  tags: {
    [key: string]: string;
  };
}

export type AddProviderFieldType =
  | "string"
  | "date"
  | "file"
  | "number"
  | "boolean";

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
