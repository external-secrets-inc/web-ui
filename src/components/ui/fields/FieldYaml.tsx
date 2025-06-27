import { FieldBase } from './FieldBase';
import { CodeTextarea } from '@/components/ui/CodeTextarea';
import { useController } from 'react-hook-form';
import YAML from 'yaml';

export interface FieldYamlProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  defaultValue?: unknown;
  placeholder?: string;
  className?: string;
  descriptionInline?: boolean;
}

export function FieldYaml({
  name,
  label,
  description,
  required,
  rules,
  defaultValue,
  placeholder = "# Enter YAML content here",
  className,
  descriptionInline
}: FieldYamlProps) {
    const { field } = useController({
    name,
    rules: {
      ...(rules || {}),
      validate: (value: string) => {
        if (!value && required) {
          return "This field is required";
        }
        if (!value) {
          return true;
        }

        // Basic YAML syntax validation
        try {
          const doc = YAML.parseDocument(value, { strict: true, logLevel: "silent" });

          if (doc.errors.length > 0) {
            const firstError = doc.errors[0];
            const line = firstError.linePos?.[0]?.line ?? "YAML";
            return `YAML syntax error near line ${line}: ${firstError.message}`;
          }

          // If there's a custom validate function in rules, run it after YAML parsing
          if (rules?.validate && typeof rules.validate === 'function') {
            const customResult = rules.validate(value);
            if (customResult !== true && customResult) {
              return customResult;
            }
          }

          return true;
        } catch (e) {
          return e instanceof Error ? `YAML parse error: ${e.message}` : "Invalid YAML format";
        }
      }
    },
    defaultValue: defaultValue ?? ""
  });

  return (
    <FieldBase
      name={name}
      label={label}
      description={description}
      required={required}
      rules={rules}
      defaultValue={defaultValue ?? ""}
      descriptionInline={descriptionInline}
    >
      <CodeTextarea
        language="yaml"
        placeholder={placeholder}
        className={className}
        value={field.value || ''}
        onChange={(e) => {
          // Always store as string to preserve formatting and cursor position
          field.onChange(e.target.value);
        }}
        onBlur={field.onBlur}
      />
    </FieldBase>
  );
}