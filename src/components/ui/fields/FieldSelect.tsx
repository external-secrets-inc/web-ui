import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldBase } from "./FieldBase";
import { FormControl } from "@/components/ui/form";
import { useController } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { LucideX } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldHeader } from "./FieldHeader";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader } from "@/components/ui/Loader";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldSelectProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  options?: string[] | SelectOption[];
  placeholder?: string;
  defaultValue?: string;
  allowClear?: boolean;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  customContent?: React.ReactNode;
  onValueChange?: (value: string) => void;
}

export function FieldSelect({
  name,
  label,
  description,
  required,
  rules,
  options = [],
  placeholder = "Select an option...",
  defaultValue,
  allowClear = true,
  loading = false,
  error = null,
  emptyMessage = "No options available",
  customContent,
  onValueChange,
}: FieldSelectProps) {
  const { field } = useController({
    name,
    rules,
    defaultValue: defaultValue ?? "",
  });

  // Normalize options to SelectOption format
  const normalizedOptions: SelectOption[] = Array.isArray(options)
    ? options.map((option) => {
        if (typeof option === "string") {
          return { value: option, label: option };
        }
        return option;
      }).filter(
        (option) =>
          option &&
          option.value !== null &&
          option.value !== undefined &&
          typeof option.value === "string" &&
          option.value.trim() !== "" // Empty strings are invalid for Radix UI Select
      )
    : [];

  const handleClear = () => {
    field.onChange("");
    onValueChange?.("");
  };

  const handleValueChange = (value: string) => {
    field.onChange(value);
    onValueChange?.(value);
  };

  const showClearButton = allowClear && field.value && field.value !== "";

  const renderSelectContent = () => {
    if (customContent) {
      return customContent;
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
          <Loader />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-4 text-sm text-destructive">
          {error}
        </div>
      );
    }

    if (normalizedOptions.length === 0) {
      return (
        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    return normalizedOptions.map((option) => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ));
  };

  return (
    <FieldBase
      name={name}
      rules={rules}
      defaultValue={defaultValue ?? ""}
      renderCustomLayout
    >
      <>
        <FieldHeader
          label={label}
          description={description}
          required={required}
        />
        <div className="relative">
          <Select
            name={field.name}
            value={field.value || ""}
            onValueChange={handleValueChange}
          >
            <FormControl>
              <SelectTrigger
                className={cn(showClearButton && "[&>svg]:opacity-0")}
                ref={field.ref}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {renderSelectContent()}
            </SelectContent>
          </Select>
          {allowClear && (
            <div className="absolute right-0 top-0 overflow-clip">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-hidden={!showClearButton}
                    disabled={!showClearButton}
                    className={cn(
                      "transition-opacity",
                      !showClearButton
                        ? "animate-out !slide-out-to-right fade-out-0 fill-mode-forwards"
                        : "animate-in slide-in-from-right fade-in-0"
                    )}
                    onClick={handleClear}
                  >
                    <LucideX />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear selection</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </>
    </FieldBase>
  );
}
