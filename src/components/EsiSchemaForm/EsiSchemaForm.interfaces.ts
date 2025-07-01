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
  oneOf?: OneOfOption[];
  anyOf?: AnyOfOption[];
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
  allowEmpty?: boolean;
  readOnly?: boolean;
}

/**
 * Represents the different types of oneOf options supported in UI schemas.
 *
 * Static options use an 'id' field that references existing field definitions,
 * while API options use 'href' to fetch data from an API endpoint and
 * 'labelRef' to specify which property to use as the display label.
 */
export type OneOfOption = OneOfStaticOption | OneOfApiOption;

/**
 * Static oneOf option that references a field by its id.
 * Used for predefined field choices that don't require API calls.
 */
export interface OneOfStaticOption {
  id: string;
}

/**
 * API oneOf option that fetches choices from an API endpoint.
 * The API should return an array of objects, and labelRef specifies
 * which property to use as the display label.
 */
export interface OneOfApiOption {
  href: string;
  labelRef: string;
}

/**
 * Represents the different types of anyOf options supported in UI schemas.
 * anyOf is used for multi-select scenarios where multiple values can be selected.
 *
 * Static options provide predefined choices,
 * while API options fetch data from an API endpoint and use
 * 'labelRef' to specify which property to use as the display label.
 */
export type AnyOfOption = AnyOfStaticOption | AnyOfApiOption;

/**
 * Static anyOf option with predefined choices.
 * Used for multi-select fields with fixed options.
 */
export interface AnyOfStaticOption {
  label: string;
  value: string;
}

/**
 * API anyOf option that fetches choices from an API endpoint.
 * The API should return an array of objects, and labelRef specifies
 * which property to use as the display label.
 */
export interface AnyOfApiOption {
  href: string;
  labelRef: string;
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