/**
 * Simple string-based option for select fields.
 * Used when the value and display label are the same.
 */
export type SimpleSelectOptions = string[];

/**
 * Rich option object for select fields with separate value and label.
 * Used when the internal value differs from what users should see.
 */
export interface SelectOption {
  value: string | Record<string, unknown>;
  label: string;
}

/**
 * Array of rich option objects for select fields.
 * Provides better UX by showing user-friendly labels while storing technical values.
 */
export type RichSelectOptions = SelectOption[];

/**
 * Union type for all possible select field option formats.
 * The UI components automatically handle both formats:
 * - Simple strings are converted to {value: string, label: string} format
 * - Rich objects are used as-is
 * - For simple cases where value === label, use string array
 * - For user-friendly labels with technical values, use SelectOption array
 * - Not used for fields with oneOf/anyOf (those have their own option systems)
 *
 * Prefer RichSelectOptions for better UX when values differ from labels.
 * Use SimpleSelectOptions only when value === label for all options.
 */
export type SelectFieldOptions = SimpleSelectOptions | RichSelectOptions;

export interface UISchemaField {
  id: string;
  label: string;
  type: UISchemaFieldType;
  required: boolean;
  description?: string;
  default?: unknown;
  options?: SelectFieldOptions;
  properties?: Record<string, unknown>;
  fields?: UISchemaField[];
  items?: UISchemaField;
  oneOf?: OneOfOption[];
  anyOf?: AnyOfOption[];
  visibleWhen?: UISchemaVisibleWhen[];
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

export interface UISchemaVisibleWhen {
  field: string;
  equal: unknown;
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
  skipNesting?: boolean;
}

/**
 * API oneOf option that fetches choices from an API endpoint.
 * The API should return an array of objects, and labelRef specifies
 * which property to use as the display label.
 */
export interface OneOfApiOption {
  href: string;
  labelRef: string;
  valueRef?:
  | string
  | { [key: string]: string };
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
  valueRef?:
  | string
  | { [key: string]: string };
}

export interface UISchemaGroup {
  id: string;
  label: string;
  fields: string[];
  visibleWhen?: UISchemaVisibleWhen[];
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
  | 'generators'
  | 'targets'
  | 'workflow'
  | 'workflowtemplate'
  | 'workflowrun'
  | 'workflowruntemplate';

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
