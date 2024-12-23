import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { useRef } from "react";
import { APP_DOMAIN_STRIPPED } from "@/constants";

interface LoginOrganizationURLStepProps {
  onSubmit: () => void;
}

export function LoginOrganizationURLStep({ onSubmit }: LoginOrganizationURLStepProps) {
  const { control, handleSubmit } = useFormContext();
  const orgURLref = useRef<HTMLInputElement>(null);

  return (
    <form
      id="login-organization-url-form"
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4"
    >
      <FormField
        control={control}
        name="organizationURL"
        render={({ field }) => {
          const { ref, ...restField } = field; // eslint-disable-line @typescript-eslint/no-unused-vars
          return (
            <FormItem>
              <FormLabel>Enter your Organization URL</FormLabel>
              <FormControl>
                <div
                  onClick={() => orgURLref.current?.focus()}
                  className="border-input border rounded-md flex items-baseline focus-within:ring-ring focus-within:ring-1"
                >
                  <span className="pl-3 text-sm text-muted-foreground/50">
                    {APP_DOMAIN_STRIPPED}/
                  </span>
                  <Input
                    ref={orgURLref}
                    autoFocus
                    className="border-none pl-0 focus-visible:ring-0"
                    autoCapitalize="none"
                    id="organizationURL"
                    placeholder="your-organization"
                    {...restField}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <Button type="submit" className="w-full">
        Next
      </Button>
    </form>
  );
}
