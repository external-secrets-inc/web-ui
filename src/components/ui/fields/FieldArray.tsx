import type { UISchemaField } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import { Button } from "@/components/ui/button";
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
import { FieldRenderer } from "./FieldRenderer";

export interface FieldArrayProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  field: UISchemaField;
  defaultValue?: unknown[];
  descriptionInline?: boolean;
  disabled?: boolean;
}

export function FieldArray({
  name,
  label,
  description,
  required,
  rules,
  field,
  defaultValue,
  descriptionInline,
  disabled,
}: FieldArrayProps) {
  const { control, getValues, formState } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const error = !!formState.errors[name];

  const itemSchema = field.items || field.fields?.[0];

  // Apply default values when component mounts (if not already set)
  useEffect(() => {
    if (defaultValue && Array.isArray(defaultValue) && fields.length === 0) {
      defaultValue.forEach((item) => append(item));
    }
  }, [defaultValue, name, append, fields.length]);

  const createTemplateItem = () => {
    if (itemSchema?.type === "object") {
      const defaultItem: Record<string, unknown> = {};
      itemSchema.fields?.forEach((subField) => {
        const key = subField.id.replace(`${itemSchema.id}.`, "");
        defaultItem[key] = subField.default ?? getValues(subField.id) ?? "";
      });
      return defaultItem;
    }
    return "";
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
          descriptionInline={descriptionInline}
        />
        <div
          className="p-3 border border-dashed border-border rounded-md gap-6 flex flex-col"
          data-nested-group
        >
          {fields.map((item, index) => (
            <div key={item.id}>
              {itemSchema?.type === "object" ? (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground leading-none">
                    #{index + 1}
                  </span>
                  <div
                    className="border border-border p-3 rounded-md relative"
                    data-nested-group
                  >
                    <div className="space-y-2">
                      <div className="flex-grow space-y-6">
                        {itemSchema.fields?.map((subField) => {
                          const subFieldId = subField.id.replace(
                            `${itemSchema.id}.`,
                            ""
                          );
                          const fieldId = `${name}.${index}.${subFieldId}`;
                          return (
                            <FieldRenderer
                              key={fieldId}
                              field={{
                                ...subField,
                                id: fieldId,
                                readOnly: disabled || subField.readOnly,
                              }}
                            />
                          );
                        })}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={disabled}
                            className="absolute !m-0 -top-px -right-px size-8 text-destructive hover:text-destructive hover:border-destructive/40"
                          >
                            <LucideTrash2 />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove Item</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <FieldRenderer
                    field={{
                      ...(itemSchema || {
                        type: "text",
                        required: false,
                        label: "",
                        id: "",
                      }),
                      id: `${name}.${index}`,
                      label: `#${index + 1}`,
                      readOnly: disabled || itemSchema?.readOnly,
                    }}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={disabled}
                        className="absolute !mt-0.5 top-5 -right-px size-9 text-destructive hover:text-destructive hover:border-destructive/40"
                      >
                        <LucideTrash2 />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove Item</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          ))}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="size-8 self-center [not(:first-of-type):is(:last-child)]:!mt-3"
                onClick={() => append(createTemplateItem())}
                disabled={disabled}
              >
                <LucidePlus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Item</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </>
    </FieldBase>
  );
}
