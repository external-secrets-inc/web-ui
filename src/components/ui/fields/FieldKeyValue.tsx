import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucidePlus, LucideTrash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FieldBase } from "./FieldBase";
import { FieldHeader } from "./FieldHeader";
import { FieldText } from "./FieldText";

export interface FieldKeyValueProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  defaultValue?: Array<{ key: string; value: string }>;
}

export function FieldKeyValue({
  name,
  label,
  description,
  required,
  rules,
  defaultValue,
}: FieldKeyValueProps) {
  const { control, formState } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const error = !!formState.errors[name];

  // Apply default values when component mounts (if not already set)
  useEffect(() => {
    if (defaultValue && Array.isArray(defaultValue) && fields.length === 0) {
      defaultValue.forEach((item) => append(item));
    }
  }, [defaultValue, name, append, fields.length]);

  const addItem = () => {
    append({ key: "", value: "" });
  };

  return (
    <FieldBase
      name={name}
      rules={rules}
      defaultValue={defaultValue ?? []}
      renderCustomLayout
    >
      <>
        <FieldHeader
          label={label}
          description={description}
          required={required}
          error={error}
          labelAsText
        />
        <FormControl>
          <div
            className="p-3 border border-dashed border-border rounded-md gap-6 flex flex-col"
            data-nested-group
          >
            {fields.map((item, index) => (
              <div key={item.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <FieldText
                    name={`${name}.${index}.key`}
                    label="Key"
                    required
                    rules={{ required: "Key is required" }}
                    placeholder="Enter key"
                  />
                </div>
                <div className="flex-1">
                  <FieldText
                    name={`${name}.${index}.value`}
                    label="Value"
                    required
                    rules={{ required: "Value is required" }}
                    placeholder="Enter value"
                  />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(index)}
                      className="size-9 text-destructive hover:text-destructive hover:border-destructive/40 mt-auto"
                    >
                      <LucideTrash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove Key-Value Pair</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="size-8 self-center [not(:first-of-type)]:!mt-3"
                  onClick={addItem}
                >
                  <LucidePlus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Key-Value Pair</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </FormControl>
      </>
    </FieldBase>
  );
}
