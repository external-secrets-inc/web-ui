import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import slugify from "slugify";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { APP_DOMAIN_STRIPPED } from "@/constants";
import { AxiosError } from "axios";
import { LucideCheckCircle2, LucideXCircle } from "lucide-react";

interface SignupOrganizationInfoStepProps {
  onSubmit: () => void;
  disabled: boolean;
  tenantValidationState: {
    isChecking: boolean;
    isAvailable: boolean | undefined;
    error: AxiosError | null;
  };
}

const SignupOrganizationInfoStep = ({ onSubmit, disabled, tenantValidationState }: SignupOrganizationInfoStepProps) => {
  const { handleSubmit, setValue, control, formState: { isValid, errors } } = useFormContext();
  const orgURLRef = useRef<HTMLInputElement | null>(null);
  const [isURLManuallyEdited, setIsURLManuallyEdited] = useState(false);

  const handleOrganizationNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setValue("organizationName", value);
    if (!isURLManuallyEdited) {
      let slugifiedValue = slugify(value, { lower: true, strict: true });
      slugifiedValue = slugifiedValue.replace(/[_\s]/g, "-");
      setValue("organizationURL", slugifiedValue);
    }
  };

  const handleOrganizationURLChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsURLManuallyEdited(true);
    setValue("organizationURL", e.target.value);
  };

  return (
    <form
      id="signup-organization-info-form"
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4"
    >
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Your Full Name</FormLabel>
            <FormControl>
              <Input
                autoFocus
                id="name"
                placeholder="Jane Doe"
                autoComplete="name"
                autoCapitalize="words"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="organizationName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organization Name</FormLabel>
            <FormControl>
              <Input
                id="organizationName"
                placeholder="Acme Inc."
                autoComplete="off"
                {...field}
                onChange={(e) => {
                  handleOrganizationNameChange(e);
                  field.onChange(e);
                }}
              />
            </FormControl>
            {tenantValidationState.isChecking && (
              <p className="text-sm text-muted-foreground">Checking availability...</p>
            )}
            {tenantValidationState.isAvailable && (
              <p className="text-sm text-success flex items-center gap-1">
                <LucideCheckCircle2 className="h-4 w-4" />
                Organization name is available!
              </p>
            )}
            {tenantValidationState.isAvailable === false && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <LucideXCircle className="h-4 w-4" />
                Organization name is already taken
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="organizationURL"
        render={({ field }) => {
          const { ref, onChange, ...restField } = field;
          return (
            <FormItem>
              <FormLabel>Create an Organization URL</FormLabel>
              <FormControl>
                <div
                  onClick={() => orgURLRef.current?.focus()}
                  className="border-input border rounded-md flex items-baseline focus-within:ring-ring focus-within:ring-1"
                >
                  <span className="pl-3 text-sm text-muted-foreground/50">
                    {APP_DOMAIN_STRIPPED}/
                  </span>
                  <Input
                    ref={(e) => {
                      ref(e); // Assign to react-hook-form ref
                      orgURLRef.current = e; // Assign to local ref
                    }}
                    className="border-none pl-0 focus-visible:ring-0"
                    id="organizationURL"
                    placeholder="acme-inc"
                    autoCapitalize="none"
                    autoComplete="off"
                    onChange={(e) => {
                      handleOrganizationURLChange(e);
                      onChange(e);
                    }}
                    {...restField}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <Button 
        type="submit" 
        className="w-full"
        disabled={disabled || !isValid || Object.keys(errors).length > 0}
      >
        Next
      </Button>
    </form>
  );
};

export default SignupOrganizationInfoStep;