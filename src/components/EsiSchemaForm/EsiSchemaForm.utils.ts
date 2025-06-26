/**
 * TODO[cfviotti]: The fields and dynamic nature of them are kinda coupled with
 * this EsiSchemaForm, but that shouldn't be necessary and could be generic for
 * other purposes as well. Consider refactoring this to be more generic or at
 * least not directly related to EsiSchemaForm.
 *
 * Also, the validation rules are a bit messy and could be improved.
 */

import type { UISchemaField, KubernetesResourceType, KubernetesManifest } from './EsiSchemaForm.interfaces';

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
          if (value && !field.options!.includes(value)) {
            return `Invalid option for ${field.label || field.id}`;
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
          if (!field.oneOf!.includes(value)) {
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
        rules.validate = (value: string[]) => {
          if (!Array.isArray(value) || value.length === 0) {
            return `${field.label || field.id} must have at least one selection`;
          }
          // Validate that all values are from the allowed options
          if (field.options && field.options.length > 0) {
            const invalidOptions = value.filter(v => !field.options!.includes(v));
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

/**
 * Recursively removes undefined, null, NaN, and empty values from an object or array.
 * This prevents these values from appearing in the final YAML output.
 */
function cleanEmptyValues(obj: unknown): unknown {
  if (obj === null || obj === undefined || Number.isNaN(obj)) {
    return undefined;
  }

  if (Array.isArray(obj)) {
    const cleaned = obj
      .map(item => cleanEmptyValues(item))
      .filter(item => item !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof obj === 'object' && obj !== null) {
    const cleaned: Record<string, unknown> = {};
    let hasValidProperties = false;

    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanEmptyValues(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
        hasValidProperties = true;
      }
    }

    return hasValidProperties ? cleaned : undefined;
  }

  // For primitive values (string, number, boolean), return as-is unless they're empty strings
  if (typeof obj === 'string' && obj.trim() === '') {
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

  // If no schema provided, return data as-is
  if (!schema || !Array.isArray(schema)) {
    return cleanEmptyValues(data) as Record<string, unknown> ?? {};
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

    // Recursively transform object fields
    if (fieldSchema.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
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

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // Skip internal UI state fields
      if (key.includes('.__selection')) {
        continue;
      }

      const fieldSchema = schemaMap.get(key);
      result[key] = transformValue(data[key], fieldSchema);
    }
  }

  // Clean empty values from the final result
  return cleanEmptyValues(result) as Record<string, unknown> ?? {};
}

export function getApiVersionFromResourceType(
  resourceType: KubernetesResourceType
): string {
  switch (resourceType) {
    case 'secretstore':
    case 'clustersecretstore':
    case 'externalsecret':
    case 'pushsecret':
      return 'external-secrets.io/v1';
    case 'workflow':
    case 'workflowtemplate':
    case 'workflowrun':
      return 'eso.external-secrets.io/v1alpha1';
    default:
      return '';
  }
}

export function getKindFromResourceType(
  resourceType: KubernetesResourceType
): string {
  switch (resourceType) {
    case 'secretstore':
      return 'SecretStore';
    case 'clustersecretstore':
      return 'ClusterSecretStore';
    case 'externalsecret':
      return 'ExternalSecret';
    case 'pushsecret':
      return 'PushSecret';
    case 'workflow':
      return 'Workflow';
    case 'workflowtemplate':
      return 'WorkflowTemplate';
    case 'workflowrun':
      return 'WorkflowRun';
    default:
      return '';
  }
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

/**
 * Checks if a field should be visible based on dependencies.
 * @param visibleWhen - The visibility condition from the schema.
 * @param formValues - The current values in the form.
 * @returns True if the field should be visible, false otherwise.
 */
export function isFieldVisible(
  visibleWhen: { field: string; equals: unknown } | undefined,
  formValues: Record<string, unknown>
): boolean {
  if (!visibleWhen) {
    return true;
  }
  const { field, equals } = visibleWhen;
  return formValues[field] === equals;
}