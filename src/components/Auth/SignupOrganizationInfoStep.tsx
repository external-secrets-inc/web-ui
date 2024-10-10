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

const SignupOrganizationInfoStep = ({ onSubmit }: { onSubmit: () => void }) => {
  const { handleSubmit, setValue, control } = useFormContext();
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
      <Button type="submit" className="w-full">
        Next
      </Button>
    </form>
  );
};

export default SignupOrganizationInfoStep;