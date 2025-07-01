import { FieldBase } from "@/components/ui/fields";
import {
  FormControl,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useController } from "react-hook-form";


export interface FieldBooleanProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  defaultValue?: boolean;
  descriptionInline?: boolean;
  disabled?: boolean;
}

export function FieldBoolean({
  name,
  label,
  description,
  required,
  rules,
  defaultValue,
  descriptionInline,
  disabled,
}: FieldBooleanProps) {
  const { field } = useController({
    name,
    rules,
    defaultValue: defaultValue ?? false
  });

  return (
    <FieldBase
      name={name}
      label={label}
      description={description}
      required={required}
      rules={rules}
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
