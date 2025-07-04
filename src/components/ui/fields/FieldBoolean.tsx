import { FieldBase } from "@/components/ui/fields";
import { FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  useController,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

export interface FieldBooleanProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Partial<RegisterOptions<FieldValues, string>>;
  defaultValue?: boolean;
  descriptionInline?: boolean;
  disabled?: boolean;
}

export function FieldBoolean({
  name,
  label,
  description,
  required,
  rules = {},
  defaultValue,
  descriptionInline,
  disabled,
}: FieldBooleanProps) {
  // Create custom rules for boolean fields that merge with any passed rules
  const customRules: Partial<RegisterOptions<FieldValues, string>> = {
    // Preserve any custom rules passed in
    ...rules,
    // If required, add custom validation that accepts both true and false
    ...(required && {
      // Override the standard required validation
      required: undefined,
      validate: {
        // Keep any existing validate rules
        ...(typeof rules.validate === 'function'
          ? { customValidate: rules.validate }
          : rules.validate),
        // Add our required validation that handles boolean values correctly
        requiredBoolean: (value: unknown) => {
          // Only fail if the value is undefined or null
          if (value === undefined || value === null) {
            return `${label} is required`;
          }
          return true;
        },
      },
    }),
    // React Hook Form treats false as an "empty" value for required validation,
    // so we use setValueAs to ensure the value is always a boolean
    setValueAs: (value: unknown) => {
      if (value === "true") return true;
      if (value === "false") return false;
      return Boolean(value);
    },
  };

  const { field } = useController({
    name,
    rules: customRules,
    defaultValue: defaultValue ?? false,
  });

  return (
    <FieldBase
      name={name}
      label={label}
      description={description}
      required={required}
      rules={customRules}
      defaultValue={defaultValue ?? false}
      descriptionInline={descriptionInline}
    >
      <FormControl>
        <Switch
          name={field.name}
          checked={field.value}
          onCheckedChange={field.onChange}
          disabled={disabled}
          className="block"
        />
      </FormControl>
    </FieldBase>
  );
}
