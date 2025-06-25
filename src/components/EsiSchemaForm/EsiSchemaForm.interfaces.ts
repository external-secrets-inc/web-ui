export interface UISchemaField {
  id: string;
  label: string;
  type: UISchemaFieldType;
  required: boolean;
  description?: string;
  default?: unknown;
  options?: string[];
  properties?: Record<string, unknown>;
  fields?: UISchemaField[];
  items?: UISchemaField;
  oneOf?: string[];
  visibleWhen?: {
    field: string;
    equals: unknown;
  };
  minProperties?: number;
  maxProperties?: number;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface UISchemaGroup {
  id: string;
  label: string;
  fields: string[];
  visibleWhen?: {
    field: string;
    equals: unknown;
  };
}

export interface UISchema {
  fields: UISchemaField[];
  groups?: UISchemaGroup[];
}

export type UISchemaFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'array'
  | 'object'
  | 'key-value'
  | 'secret-selector'
  | 'service-account-selector'
  | 'one-of'
  | 'json'
  | 'multi-select'
  | 'duration'
  | 'datetime';

export type KubernetesResourceType =
  | 'secretstore'
  | 'clustersecretstore'
  | 'externalsecret'
  | 'pushsecret'
  | 'workflow'
  | 'workflowtemplate'
  | 'workflowrun';

export interface EsiSchemaFormProps {
  resourceType: KubernetesResourceType;
  onSubmit: (manifest: KubernetesManifest) => void;
  onCancel?: () => void;
  initialValues?: Record<string, unknown>;
}

export interface KubernetesManifest {
  apiVersion: string;
  kind: string;
  metadata: {
    name?: string;
    namespace?: string;
    [key: string]: unknown;
  };
  spec: Record<string, unknown>;
}