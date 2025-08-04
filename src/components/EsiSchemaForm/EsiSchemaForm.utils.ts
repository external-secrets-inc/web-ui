/**
 * TODO[cfviotti]: The fields and dynamic nature of them are kinda coupled with
 * this EsiSchemaForm, but that shouldn't be necessary and could be generic for
 * other purposes as well. Consider refactoring this to be more generic or at
 * least not directly related to EsiSchemaForm.
 *
 * Also, the validation rules are a bit messy and could be improved.
 */

import type {
  UISchemaField,
  KubernetesResourceType,
  KubernetesManifest,
  OneOfApiOption,
  AnyOfApiOption,
  SelectFieldOptions,
  SelectOption,
} from './EsiSchemaForm.interfaces';


// Constants & Configuration
/**
 * Centralized configuration for all Kubernetes resource types.
 * Single source of truth for API versions, kinds, and display names.
 */
const KUBERNETES_RESOURCE_CONFIG: Record<KubernetesResourceType, {
  apiVersion: string;
  kind: string;
  displayName: string;
}> = {
  secretstore: {
    apiVersion: 'external-secrets.io/v1',
    kind: 'SecretStore',
    displayName: 'Secret Store',
  },
  clustersecretstore: {
    apiVersion: 'external-secrets.io/v1',
    kind: 'ClusterSecretStore',
    displayName: 'Cluster Secret Store',
  },
  externalsecret: {
    apiVersion: 'external-secrets.io/v1',
    kind: 'ExternalSecret',
    displayName: 'External Secret',
  },
  pushsecret: {
    apiVersion: 'external-secrets.io/v1',
    kind: 'PushSecret',
    displayName: 'Push Secret',
  },
  generators: {
    apiVersion: 'generators.external-secrets.io/v1alpha1',
    kind: 'Generator',
    displayName: 'Generator',
  },
  targets: {
    apiVersion: 'target.external-secrets.io/v1alpha1',
    kind: 'Target',
    displayName: 'Target',
  },
  workflow: {
    apiVersion: 'eso.external-secrets.io/v1alpha1',
    kind: 'Workflow',
    displayName: 'Workflow',
  },
  workflowtemplate: {
    apiVersion: 'eso.external-secrets.io/v1alpha1',
    kind: 'WorkflowTemplate',
    displayName: 'Workflow Template',
  },
  workflowrun: {
    apiVersion: 'eso.external-secrets.io/v1alpha1',
    kind: 'WorkflowRun',
    displayName: 'Workflow Run',
  },
  workflowruntemplate: {
    apiVersion: 'workflows.external-secrets.io/v1alpha1',
    kind: 'WorkflowRunTemplate',
    displayName: 'Run Template',
  },
};


// Kubernetes Resource Utilities
export function getApiVersionFromResourceType(
  resourceType: KubernetesResourceType
): string {
  return KUBERNETES_RESOURCE_CONFIG[resourceType].apiVersion;
}

export function getKindFromResourceType(
  resourceType: KubernetesResourceType
): string {
  return KUBERNETES_RESOURCE_CONFIG[resourceType].kind;
}

/**
 * Gets the complete resource configuration for a given resource type.
 * @param resourceType - The Kubernetes resource type.
 * @returns The complete configuration object with apiVersion, kind, and displayName.
 */
export function getResourceConfig(resourceType: KubernetesResourceType) {
  return KUBERNETES_RESOURCE_CONFIG[resourceType];
}

/**
 * Generates a success message based on the resource type.
 * @param resourceType - The Kubernetes resource type.
 * @returns A formatted success message.
 */
export function getSuccessMessage(resourceType: KubernetesResourceType): string {
  return `${KUBERNETES_RESOURCE_CONFIG[resourceType].displayName} created successfully`;
}


// Field Validation Utilities
type ApiOptionLike = OneOfApiOption | AnyOfApiOption;

/**
 * Common utilities for working with option arrays that may contain API options.
 * Works with both oneOf and anyOf since they share the same API option structure.
 */
export const OptionUtils = {
  /**
   * Checks if an option is an API option (has href and labelRef properties).
   */
  isApiOption(option: unknown): option is ApiOptionLike {
    return typeof option === 'object' && option !== null &&
      'href' in option && 'labelRef' in option &&
      typeof (option as Record<string, unknown>).href === 'string' &&
      typeof (option as Record<string, unknown>).labelRef === 'string';
  },

  /**
   * Extracts API option configuration from a field's oneOf array.
   * Returns the first API option found, or null if none exist.
   */
  getOneOfApiOptions(field: UISchemaField): OneOfApiOption[] {
    if (!field.oneOf || !Array.isArray(field.oneOf) || field.oneOf.length === 0) {
      return [];
    }

    const apiOptions = field.oneOf.filter(this.isApiOption);
    return apiOptions.length > 0 ? (apiOptions as OneOfApiOption[]) : [];
  },

  /**
   * Extracts API option configuration from a field's anyOf array.
   * Returns the first API option found, or null if none exist.
   */
  getAnyOfApiOptions(field: UISchemaField): AnyOfApiOption[] {
    if (!field.anyOf || !Array.isArray(field.anyOf) || field.anyOf.length === 0) {
      return [];
    }

    const apiOptions = field.anyOf.filter(this.isApiOption);
    return apiOptions.length > 0 ? (apiOptions as AnyOfApiOption[]) : [];
  },
};

/**
 * Helper function to normalize options to string values for validation.
 * Handles both simple string arrays and rich SelectOption objects.
 */
function getOptionValues(options: SelectFieldOptions): string[] {
  return options
    .map(opt => (typeof opt === 'string' ? opt : opt.value))
    .filter((v): v is string => typeof v === 'string');
}

/**
 * Creates validation rules for a field based on its schema definition.
 * Returns an object compatible with react-hook-form's validation rules.
 */
export function createFieldValidation(field: UISchemaField) {
  const rules: Record<string, unknown> = {};

  // Required validation
  if (field.required) {
    rules.required = `${field.label || field.id} is required`;
  }

  // Type-specific validations
  switch (field.type) {
    case 'checkbox': {
      // Checkbox validation is handled directly in the FieldBoolean component
      // to properly handle the edge case where React Hook Form treats false as "empty"
      // for required validation
      break;
    }
    case 'text':
    case 'textarea': {
      if (field.minLength !== undefined) {
        rules.minLength = {
          value: field.minLength,
          message: `${field.label || field.id} must be at least ${field.minLength} characters`,
        };
      }
      if (field.maxLength !== undefined) {
        rules.maxLength = {
          value: field.maxLength,
          message: `${field.label || field.id} must be at most ${field.maxLength} characters`,
        };
      }
      if (field.pattern) {
        rules.pattern = {
          value: new RegExp(field.pattern),
          message: `Invalid format for ${field.label || field.id}`,
        };
      }
      break;
    }
    case 'number': {
      rules.valueAsNumber = true;
      if (field.minimum !== undefined) {
        rules.min = {
          value: field.minimum,
          message: `${field.label || field.id} must be at least ${field.minimum}`,
        };
      }
      if (field.maximum !== undefined) {
        rules.max = {
          value: field.maximum,
          message: `${field.label || field.id} must be no more than ${field.maximum}`,
        };
      }
      break;
    }
    case 'array': {
      if (field.required) {
        rules.validate = (value: unknown[]) => {
          if (!Array.isArray(value) || value.length === 0) {
            return `${field.label || field.id} must have at least one item`;
          }
          return true;
        };
      }
      break;
    }
    case 'key-value': {
      if (field.required) {
        rules.validate = (value: unknown) => {
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return `${field.label || field.id} must have at least one item`;
            }
            // Check each item has key and value
            for (let i = 0; i < value.length; i++) {
              const item = value[i];
              if (!item || typeof item !== 'object') continue;
              const typedItem = item as Record<string, unknown>;
              if (!typedItem.key || typeof typedItem.key !== 'string' || typedItem.key.trim() === '') {
                return `Item ${i + 1} key is required`;
              }
              if (!typedItem.value || typeof typedItem.value !== 'string' || typedItem.value.trim() === '') {
                return `Item ${i + 1} value is required`;
              }
            }
          }
          return true;
        };
      }
      break;
    }
    case 'select': {
      if (field.options && field.options.length > 0) {
        rules.validate = (value: string) => {
          if (field.required && (!value || value === '')) {
            return `${field.label || field.id} is required`;
          }
          if (value && field.options) {
            const validValues = getOptionValues(field.options);
            if (!validValues.includes(value)) {
              return `Invalid option for ${field.label || field.id}`;
            }
          }
          return true;
        };
      }
      break;
    }
    case 'object': {
      if (field.required) {
        rules.validate = (value: unknown) => {
          if (!value || (typeof value === 'object' && Object.keys(value as object).length === 0)) {
            return `${field.label || field.id} is required`;
          }
          return true;
        };
      }
      // Handle validation for oneOf constraint (like provider selection)
      if (field.oneOf && field.oneOf.length > 0 && field.required) {
        rules.validate = (value: string) => {
          if (!value || value === '') {
            return `${field.label || field.id} is required`;
          }
          // Check if the value matches any static option id
          const isValidOption = field.oneOf!.some(option =>
            'id' in option && typeof option.id === 'string' && option.id === value
          );
          if (!isValidOption) {
            return `Invalid option for ${field.label || field.id}`;
          }
          return true;
        };
      }
      break;
    }
    case 'one-of': {
      if (field.required) {
        rules.validate = (value: string) => {
          if (!value || value === '') {
            return `${field.label || field.id} is required`;
          }
          return true;
        };
      }
      break;
    }
    case 'multi-select': {
      if (field.required) {
        rules.validate = (value: string[] | string) => {
          // Check if this field uses API options
          const isApiOption = OptionUtils.getAnyOfApiOptions(field).length > 0;

          // Handle both array (static options) and comma-separated string (API options) formats
          // TODO[cfviotti]: In the future, API options for anyOf should store proper arrays instead of comma-separated strings
          const normalizedValue = Array.isArray(value)
            ? value
            : (typeof value === 'string' ? value.split(',').filter(Boolean) : []);

          if (normalizedValue.length === 0) {
            return `${field.label || field.id} must have at least one selection`;
          }

          // Validate that all values are from the allowed options (only for static options, not API options)
          if (!isApiOption && field.options && field.options.length > 0) {
            const validValues = getOptionValues(field.options);
            const invalidOptions = normalizedValue.filter(v => !validValues.includes(v));
            if (invalidOptions.length > 0) {
              return `Invalid options: ${invalidOptions.join(', ')}`;
            }
          }
          return true;
        };
      }
      break;
    }
    case 'secret-selector': {
      if (field.required) {
        rules.validate = (value: { name?: string; key?: string }) => {
          if (!value || typeof value !== 'object') {
            return `${field.label || field.id} is required`;
          }
          if (!value.name || value.name.trim() === '') {
            return `${field.label || field.id} name is required`;
          }
          if (!value.key || value.key.trim() === '') {
            return `${field.label || field.id} key is required`;
          }
          return true;
        };
      }
      break;
    }
    case 'duration': {
      if (field.required) {
        rules.required = `${field.label || field.id} is required`;
      }
      // Duration pattern validation
      rules.pattern = {
        value: /^(\d+[dhms])+$/,
        message: 'Invalid duration format. Use format like 1d2h30m15s (days, hours, minutes, seconds)'
      };
      break;
    }
    case 'datetime': {
      if (field.required) {
        rules.required = `${field.label || field.id} is required`;
      }
      break;
    }
    case 'json': {
      if (field.required) {
        rules.required = `${field.label || field.id} is required`;
      }
      // JSON validation: ensure it's valid JSON if provided
      rules.validate = (value: string) => {
        if (!value || value.trim() === '') {
          return field.required ? `${field.label || field.id} is required` : true;
        }
        try {
          JSON.parse(value);
          return true;
        } catch {
          return 'Invalid JSON format';
        }
      };
      break;
    }
  }

  return rules;
}

/**
 * Simple form validation - just validates required metadata.name
 * Individual fields handle their own validation via createFieldValidation
 */
export function createSchemaResolver() {
  return undefined; // No resolver needed - fields validate themselves
}


// Data Transformation Utilities
/**
 * Recursively removes all UI state fields from a data structure.
 * This ensures no internal UI state leaks into the final manifest.
 */
/**
 * Resolves internal form fields by applying specific processing rules.
 *
 * This function handles two types of internal fields:
 * 1. `__ui_state` fields: Completely removed from the final data (used for UI state management)
 * 2. `__skip_nesting` fields: Removed but their values are promoted up one level in the object structure
 *
 * This enables post-processing transformation of form data to produce clean, flattened
 * manifest structures without unwanted nested keys.
 *
 *
 * @example
 * // Input with UI state and skip nesting fields
 * {
 *   sourceLocation: {
 *     "__ui_state": "baz-bing",
 *     "__skip_nesting": {
 *       apiVersion: "externalsecrets.io/v1",
 *       kind: "SecretStore"
 *     }
 *   }
 * }
 *
 * // Output after processing
 * {
 *   sourceLocation: {
 *     apiVersion: "externalsecrets.io/v1",
 *     kind: "SecretStore"
 *   }
 * }
 */
function resolveInternalFields(obj: unknown): unknown {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveInternalFields(item));
  }

  const result: Record<string, unknown> = {};
  const objValue = obj as Record<string, unknown>;

  for (const key in objValue) {
    if (Object.prototype.hasOwnProperty.call(objValue, key)) {
      if (key.includes('__ui_state')) {
        // Regular UI state fields - skip them completely
        continue;
      }

      // Special handling for skip nesting fields - promote the value up one level
      if (key.includes('__skip_nesting')) {
        return resolveInternalFields(objValue[key]);
      }
      result[key] = resolveInternalFields(objValue[key]);
    }
  }

  return result;
}

/**
 * Recursively removes undefined, null, NaN, and empty values from an object or array.
 * This prevents these values from appearing in the final YAML output.
 * Respects the allowEmpty flag from schema fields to preserve empty values when explicitly allowed.
 */
function cleanEmptyValues(
  obj: unknown,
  schemaMap?: Map<string, UISchemaField>,
  currentPath = ''
): unknown {
  if (obj === null || obj === undefined || Number.isNaN(obj)) {
    return undefined;
  }

  const currentField = schemaMap?.get(currentPath);

  if (Array.isArray(obj)) {
    const cleaned = obj
      .map((item, index) => cleanEmptyValues(item, schemaMap, `${currentPath}[${index}]`))
      .filter(item => item !== undefined);

    // If allowEmpty is true for this array field, preserve empty arrays
    if (cleaned.length === 0 && currentField?.allowEmpty) {
      return [];
    }

    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof obj === 'object' && obj !== null) {
    const cleaned: Record<string, unknown> = {};
    let hasValidProperties = false;

    for (const [key, value] of Object.entries(obj)) {
      const childPath = currentPath ? `${currentPath}.${key}` : key;
      const cleanedValue = cleanEmptyValues(value, schemaMap, childPath);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
        hasValidProperties = true;
      }
    }

    // If allowEmpty is true for this object field, preserve empty objects
    if (!hasValidProperties && currentField?.allowEmpty) {
      return {};
    }

    return hasValidProperties ? cleaned : undefined;
  }

  // For primitive values, handle each type appropriately
  if (typeof obj === 'boolean') {
    // Always preserve boolean values (both true and false) as they represent meaningful states
    return obj;
  } else if (typeof obj === 'string' && obj.trim() === '') {
    // If allowEmpty is true for this string field, preserve empty strings
    if (currentField?.allowEmpty) {
      return obj;
    }
    return undefined;
  }

  return obj;
}

/**
 * Transforms the raw form data into a Kubernetes manifest structure.
 * Uses schema information to determine proper data transformations.
 */
export function transformData(
  data: Record<string, unknown>,
  schema?: UISchemaField[]
): Record<string, unknown> {
  if (!data || typeof data !== 'object') {
    return {};
  }

  // Resolve all internal fields first - this handles all __ui_state and __skip_nesting processing in one place
  const cleanData = resolveInternalFields(data) as Record<string, unknown>;

  // If no schema provided, return cleaned data as-is (no allowEmpty support)
  if (!schema || !Array.isArray(schema)) {
    return cleanEmptyValues(cleanData) as Record<string, unknown> ?? {};
  }

  /**
   * Recursively transforms data based on schema field types
   */
  function transformValue(value: unknown, fieldSchema?: UISchemaField): unknown {
    if (!fieldSchema) {
      return value;
    }

    // Transform key-value arrays to objects
    if (fieldSchema.type === 'key-value' && Array.isArray(value)) {
      return value.reduce((acc, item) => {
        if (item && typeof item === 'object' && 'key' in item && 'value' in item) {
          const { key, value: val } = item as { key: string; value: string };
          if (key && typeof key === 'string' && key.trim() !== '') {
            acc[key] = val;
          }
        }
        return acc;
      }, {} as Record<string, string>);
    }

    // Recursively transform any object, regardless of schema type (for robustness)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const result: Record<string, unknown> = {};
      const objValue = value as Record<string, unknown>;

      for (const key in objValue) {
        if (Object.prototype.hasOwnProperty.call(objValue, key)) {
          const childSchema = fieldSchema.fields?.find(f => f?.id === key || f?.id?.endsWith(`.${key}`));
          result[key] = transformValue(objValue[key], childSchema);
        }
      }
      return result;
    }

    // Recursively transform array items
    if (fieldSchema.type === 'array' && Array.isArray(value)) {
      return value.map(item => transformValue(item, fieldSchema.items));
    }

    return value;
  }

  // Create a flat map of field paths to schemas for easy lookup
  const schemaMap = new Map<string, UISchemaField>();

  function buildSchemaMap(fields: UISchemaField[], prefix = '') {
    for (const field of fields) {
      if (!field?.id) continue;

      const fieldPath = prefix ? `${prefix}.${field.id.split('.').pop()}` : field.id;
      schemaMap.set(fieldPath, field);
      schemaMap.set(field.id, field);

      if (field.fields) {
        buildSchemaMap(field.fields, fieldPath);
      }
      if (field.items?.fields) {
        buildSchemaMap(field.items.fields, fieldPath);
      }
    }
  }

  buildSchemaMap(schema);

  // Transform the root data
  const result: Record<string, unknown> = {};

  for (const key in cleanData) {
    if (Object.prototype.hasOwnProperty.call(cleanData, key)) {
      const fieldSchema = schemaMap.get(key);
      result[key] = transformValue(cleanData[key], fieldSchema);
    }
  }

  // Clean empty values from the final result, respecting allowEmpty flags
  return cleanEmptyValues(result, schemaMap) as Record<string, unknown> ?? {};
}

/**
 * Assembles the final Kubernetes manifest from form data.
 * @param formData - The validated data from the form.
 * @param resourceType - The type of Kubernetes resource.
 * @param schema - The UI schema describing the field structure.
 * @returns A complete Kubernetes manifest.
 */
export function assembleManifest(
  formData: Record<string, unknown>,
  resourceType: KubernetesResourceType,
  schema?: UISchemaField[]
): KubernetesManifest {
  const transformedData = transformData(formData, schema);

  const manifest: KubernetesManifest = {
    apiVersion: getApiVersionFromResourceType(resourceType),
    kind: getKindFromResourceType(resourceType),
    metadata: {
      name: '',
      labels: {},
    },
    spec: {},
  };

  // Merge transformed data into the manifest
  for (const key in transformedData) {
    if (Object.prototype.hasOwnProperty.call(transformedData, key)) {
      if (key === 'metadata' && transformedData[key] && typeof transformedData[key] === 'object') {
        Object.assign(manifest.metadata, transformedData[key]);
      } else if (key === 'spec' && transformedData[key] && typeof transformedData[key] === 'object') {
        Object.assign(manifest.spec, transformedData[key]);
      } else {
        (manifest as unknown as Record<string, unknown>)[key] = transformedData[key];
      }
    }
  }

  return manifest;
}


// Form/UI Utilities
/**
 * Checks if a field should be visible based on dependencies.
 * @param visibleWhen - The visibility condition from the schema.
 * @param formValues - The current values in the form.
 * @returns True if the field should be visible, false otherwise.
 */
export function isFieldVisible(
  visibleWhen: { field: string; equal: unknown }[] | undefined,
  formValues: Record<string, unknown>
): boolean {
  if (!visibleWhen || visibleWhen.length === 0) {
    return true;
  }

  const isVisible = visibleWhen.some(condition => {
    const { field, equal } = condition;
    const value = getNestedValue(formValues, field);
    return value === equal;
  })

  return isVisible
}

/**
 * Safely accesses nested properties in an object using dot notation.
 * @param obj The object to access properties from.
 * @param path The dot-separated path to the property (e.g., "user.profile.name").
 * @returns The value at the path, or undefined if the path doesn't exist.
 *
 * @example
 * const data = {
 *   name: "fake2",
 *   remoteRef: { key: "/baz/bing", property: "" }
 * };
 * getNestedValue(data, "remoteRef.key") // Returns "/baz/bing"
 * getNestedValue(data, "remoteRef.property") // Returns ""
 * getNestedValue(data, "name") // Returns "fake2"
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  }, obj as unknown);
}

/**
 * Interpolates a string with values from a data object.
 * Replaces placeholders like `${key}` or `${user.profile.name}` with the corresponding value from the object.
 * Supports dot notation for nested property access.
 * @param template The string template to interpolate.
 * @param data The object containing values for interpolation.
 * @returns The interpolated string.
 *
 * TODO[cfviotti]: Future enhancements to consider:
 * - Array access: ${items[0].name}
 * - Default values: ${name|default}, ${name|"fallback value"}
 * - Basic transformations: ${name|upper}, ${name|lower}, ${name|trim}
 * - Conditional logic: ${name ? name : 'Unknown'}
 * - Escaping support: \${literal} for literal ${} text
 * - Input sanitization: prevent XSS, HTML escaping
 * - Better error handling: strict vs lenient modes, validation
 * - Debugging support: highlight missing properties, detailed logging
 */
export function interpolateValueRefString(template: string, data: Record<string, unknown>): string {
  return template.replace(/\$\{([a-zA-Z0-9_.-]+)\}/g, (_, path: string): string => {
    const value = getNestedValue(data, path);
    return value !== undefined ? String(value) : '';
  });
}

/**
 * Recursively processes a valueRef object and interpolates string values with data.
 * @param valueRef The valueRef object or string to process.
 * @param data The data object containing values for interpolation.
 * @returns The processed value with interpolated strings.
 */
function processValueRef(
  valueRef: unknown,
  data: Record<string, unknown>
): unknown {
  if (typeof valueRef === 'string') {
    return interpolateValueRefString(valueRef, data);
  }

  if (typeof valueRef === 'object' && valueRef !== null) {
    const result: Record<string, unknown> = {};

    for (const key in valueRef) {
      const value = (valueRef as Record<string, unknown>)[key];
      result[key] = processValueRef(value, data);
    }

    return result;
  }

  return valueRef;
}

/**
 * Processes API responses to generate select options.
 * @param apiOptions The API option configurations from the schema.
 * @param responses The array of responses from the API calls.
 * @returns An array of SelectOption objects.
 */
export function processApiResponses(
  apiOptions: (OneOfApiOption | AnyOfApiOption)[],
  responses: { data?: unknown }[]
): SelectOption[] {
  const selectOptions: SelectOption[] = [];

  responses.forEach((response, index) => {
    const apiOption = apiOptions[index];

    const responseData = response?.data;
    let data: Record<string, unknown>[] | undefined;

    // Type guard to ensure we're working with an object
    if (typeof responseData !== 'object' || responseData === null) {
      // If the response is not an object (e.g., HTML error page), skip it.
      return;
    }

    if (Array.isArray(responseData)) {
      data = responseData as Record<string, unknown>[];
    } else if (
      'items' in responseData &&
      Array.isArray((responseData as { items?: unknown[] }).items)
    ) {
      data = (responseData as { items: Record<string, unknown>[] }).items;
    } else {
      // Handle responses with nested data under specific keys (e.g., "generators", "secretstores")
      const responseObj = responseData as Record<string, unknown>;
      for (const key in responseObj) {
        if (Array.isArray(responseObj[key])) {
          data = responseObj[key] as Record<string, unknown>[];
          break;
        }
      }
    }

    if (data) {
      data.forEach((item: Record<string, unknown>) => {
        const label = String(item[apiOption.labelRef]);
        let value: string | Record<string, unknown>;

        if (typeof apiOption.valueRef === 'object') {
          const processedValue = processValueRef(apiOption.valueRef, item);
          value = typeof processedValue === 'string' || typeof processedValue === 'object'
            ? processedValue as string | Record<string, unknown>
            : item;
        } else if (typeof apiOption.valueRef === 'string') {
          value = String(item[apiOption.valueRef]);
        } else {
          // Default behavior if valueRef is not provided, returns the whole object
          value = item;
        }

        const group = apiOption.groupBy ? String(item[apiOption.groupBy]) : undefined;

        selectOptions.push({ label, value, group });
      });
    }
  });

  return selectOptions;
}


// Error Handling Utilities
/**
 * Extracts a user-friendly error message from API error responses.
 * This function handles various error formats, including plain text responses
 * and common JSON error structures.
 * @param error - The error object from the API response.
 * @returns A formatted error message string.
 */
export function extractErrorMessage(error: unknown): string {
  const defaultMessage = 'An unknown error occurred while processing the request.';

  if (typeof error === 'object' && error !== null && 'response' in error) {
    const errorData = (error as { response?: { data?: unknown } }).response?.data;

    if (!errorData) {
      return defaultMessage;
    }

    let potentialObject = errorData;
    let message: string | null = null;

    if (typeof errorData === 'string' && errorData.length > 0) {
      try {
        const parsed = JSON.parse(errorData);
        if (typeof parsed === 'object' && parsed !== null) {
          potentialObject = parsed;
        } else {
          message = errorData;
        }
      } catch {
        message = errorData;
      }
    }

    if (typeof potentialObject === 'object' && potentialObject !== null) {
      const data = potentialObject as Record<string, unknown>;

      if (typeof data.message === 'string' && data.message) {
        message = data.message;
      } else if (typeof data.error === 'string' && data.error) {
        message = data.error;
      } else if (typeof data.detail === 'string' && data.detail) {
        message = data.detail;
      } else if (Array.isArray(data.errors) && data.errors.length > 0) {
        if (typeof data.errors[0] === 'string') {
          message = data.errors[0];
        } else if (typeof data.errors[0]?.message === 'string') {
          message = data.errors[0].message;
        }
      } else if (typeof data.errors === 'object' && data.errors !== null) {
        const errorsObj = data.errors as Record<string, unknown>;
        if (typeof errorsObj.body === 'string') {
          message = errorsObj.body;
        } else if (typeof errorsObj.error === 'string') {
          message = errorsObj.error;
        }
      }
    }

    if (message) {
      return message.replace(/\\n/g, '\n');
    }
  }

  if (error instanceof Error) {
    return error.message.replace(/\\n/g, '\n');
  }

  return defaultMessage;
}
