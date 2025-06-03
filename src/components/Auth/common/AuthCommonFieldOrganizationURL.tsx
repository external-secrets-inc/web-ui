import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { APP_DOMAIN_STRIPPED } from "@/constants";
import { cn } from "@/lib/utils";
import mergeRefs from "merge-refs";
import { InputHTMLAttributes, RefObject, useRef } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

interface AuthCommonFieldOrganizationURLProps<T extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type"> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  inputRef?: RefObject<HTMLInputElement>;
  placeholder?: string;
}

export function AuthCommonFieldOrganizationURL<T extends FieldValues>({
  control,
  name,
  label = "Enter your Organization URL",
  inputRef,
  placeholder = "acme-inc",
  className = "",
  ...props
}: AuthCommonFieldOrganizationURLProps<T>) {
  const internalRef = useRef<HTMLInputElement>(null);
  const prefix = APP_DOMAIN_STRIPPED;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div
              className={cn(
                "border-input hover:border-input-accent transition-colors border rounded-md flex items-baseline focus-within:ring-ring focus-within:ring-1",
                className
              )}
              onClick={() => internalRef.current?.focus()}
              role="presentation"
            >
              {prefix && (
                <span
                  className="pl-3 text-sm text-muted-foreground/50 select-none"
                  aria-hidden="true"
                >
                  {prefix}/
                </span>
              )}
              <Input
                type="text"
                autoCapitalize="none"
                spellCheck={false}
                className={cn(
                  prefix ? "pl-0" : "pl-3",
                  "flex-1 min-w-0 border-none focus-visible:ring-0 h-auto py-2",
                )}
                {...props}
                value={String(field.value || "")}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                disabled={field.disabled}
                placeholder={placeholder}
                ref={mergeRefs(internalRef, inputRef, field.ref)}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
