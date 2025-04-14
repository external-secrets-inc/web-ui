import { z } from "zod";

export type ListenerStatus = "pending" | "offline" | "active";

export const filterSchema = z.object({
  providerIDs: z.array(z.string()),
  policyIDs: z.array(z.string()),
  secretIDs: z.array(z.string()),
  duplicateIDs: z.array(z.string()),
  accessorNames: z.array(z.string()),
  search: z.string().optional(),
  policyStatus: z.string().optional(),
  accessors: z.string().optional(),
  duplicates: z.string().optional(),
  startLastAccess: z.string().optional(),
  endLastAccess: z.string().optional(),
  startLastRotation: z.string().optional(),
  endLastRotation: z.string().optional(),
});

export type FilterSchema = z.infer<typeof filterSchema>;

export interface AuditSecretTableData {
  id: string;
  name: string;
  provider: string;
  providerName: string;
  lastRotation: string | null;
  compliantPoliciesAmount: number;
  policiesAmount: number;
  fullCompliant: boolean;
  duplicatesAmount: number;
  lastAccess: string | null;
  accessorsAmount: number;
}

export interface AuditSecretData {
  id: string;
  name: string;
  providerID: string;
  providerName: string;
  duplicates: {
    id: string;
    name: string;
    providerID: string;
    providerName: string;
  }[];
  accessors: {
    id: string;
    name: string;
    accessTime: string;
  }[];
  policies: {
    id: string;
    name: string;
    status: "compliant" | "non_compliant" | "error";
  }[];
  lastAccess: string | null;
  lastRotation: string | null;
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

export interface PolicyTriggerTableData {
  id: string
  destinationIdentifiers: string[];
  condition: string;
  waitForCycles: number;
}

export type PolicyTrigger = Omit<PolicyTriggerTableData, "id">

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
  triggers: PolicyTriggerTableData[];
}

export interface CreatePolicyPayload {
  tenantID: string;
  name: string;
  engine: string;
  executeOn: string[];
  rule: string;
  triggers: PolicyTrigger[];
}

export type EditPolicyPayload = Omit<CreatePolicyPayload, "tenantID">

export interface PolicyForm {
  name: string;
  engine: string;
  executeOn: string[];
  sample: string;
  rule: string;
  triggers: PolicyTriggerTableData[];
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

export type EditProviderPayload = Omit<CreateProviderPayload, "listenerID" | "tenantID">;

export interface CreateTenantListenerPayload {
  name: string;
  tags?: {
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
  backendIdentifier: string;
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

export type SecretDetails = AuditSecretTableData;

export interface LineageNode {
  secretID: string;
  secretName: string;
  providerID: string;
  providerName: string;
  createdAt: string;
}

export interface LineageNodeData extends Omit<LineageNode, 'secretID'> {
  active: boolean;
  sourcePosition?: boolean;
  targetPosition?: boolean;
}

export interface LineageLink {
  fromSecret: string;
  toSecret: string;
  createdAt: string;
}

export interface LineageData {
  nodes: LineageNode[];
  links: LineageLink[];
}

export interface PolicyDetails {
  secretID: string;
  policyID: string;
  name: string;
  status: "non_compliant" | "compliant" | "error";
  timestamp: string;
}

export interface SecretPolicies {
  [key: string]: PolicyDetails[];
}

export interface AccessorDetails {
  secretID: string;
  accessorID: string;
  name: string;
  timestamp: string;
}

export interface SecretAccessors {
  [key: string]: AccessorDetails[];
}

export interface DestinationsDataTable {
  _id: string;
  tenantID: string;
  destinationID: string;
  name: string;
  identifier: string;
  type: string;
  config: {
    [key: string]: string | undefined;
  };
  deleted_at?: string;
}
