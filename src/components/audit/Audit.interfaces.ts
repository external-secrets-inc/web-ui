import { z } from "zod";

export type ListenerStatus = "PENDING" | "OFFLINE" | "ACTIVE";

export const filterSchema = z.object({
  providers: z.array(z.string()),
  policyName: z.string().optional(),
  secretName: z.string().optional(),
  policyStatus: z.string().optional(),
  duplicates: z.string().optional(),
  lastAccess: z.string().optional(),
  lastRotation: z.string().optional(),
  accessors: z.string().optional(),
});

export type FilterSchema = z.infer<typeof filterSchema>;

export interface AuditResponseData {
  secretsData: AuditTableData[];
  secretsNames: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }> | undefined;
  }[];
  policiesNames: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }> | undefined;
  }[];
  providersNames: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }> | undefined;
  }[];
}

export interface AuditTableData {
  id: string;
  name: string;
  provider: string;
  providerName: string;
  lastRotation: string | null;
  policiesAmount: string;
  fullCompliant: boolean;
  duplicatesAmount: number;
  lastAccess: string | null;
  accessorsAmount: number;
  duplicates: {
    id: string;
    provider: string;
    name: string;
    providerName: string;
  }[];
  accessors: {
    id: string;
    accessTime: string;
    name: string;
  }[];
  policies: {
    id: string;
    name: string;
    status: "compliant" | "non_compliant" | "error";
  }[];
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

export type TimeUnit = "hour" | "day" | "week" | "month";

export interface TimeRangeOption {
  days: number;
  label: TimeRange;
}

export interface PolicyTableData {
  id: string;
  policyID: string;
  tenantID: string;
  name: string;
  executeOn: string[];
  executeOnAmount: number;
  providers: {
    amount: number;
    items: Array<{
      providerID: string;
      additionalProp1?: string;
      additionalProp2?: string;
      additionalProp3?: string;
    }>;
  };
  engine: string;
  rule: string;
}

export interface CreatePolicyPayload {
  tenantID: string;
  name: string;
  engine: string;
  executeOn: string[];
  rule: string;
}

export type EditPolicyPayload = Omit<CreatePolicyPayload, "tenantID">

export interface PolicyForm {
  name: string;
  engine: string;
  executeOn: string[];
  sample: string;
  rule: string;
}

export interface ProviderTableData {
  _id: string;
  providerID: string;
  listenerID: string;
  tenantID: string;
  name: string;
  backendIdentifier: string;
  backendType: string;
  config: {
    projectID?: string;
    topic?: string;
    subscription?: string;
    [key: string]: string | undefined;
  };
  policies: string[];
  deleted_at?: string;
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
  default?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  maxLength?: number;
  accept?: string;
}

export interface AddProviderFormValues {
  providerName: string;
  providerType: string;
  [key: string]: AddProviderFieldValue;
}

export type AddProviderFieldValue = string | boolean | File | number;

export interface AddProviderFieldProps {
  onChange: (value: AddProviderFieldValue) => void;
  value: AddProviderFieldValue;
  name: string;
}

interface AddProviderTypeSchema {
  [key: string]: AddProviderFieldSchema;
}

export interface AddProviderFormSchema {
  [formType: string]: AddProviderTypeSchema;
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

export type SecretDetails = AuditTableData;
