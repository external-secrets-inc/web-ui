import { AuthCommonFieldOrganizationURL, SignupData } from "@/components/Auth";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createSlug } from "@/utils/slugify";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

export function AuthSignupStepOrganizationInfo() {
  const { control, setValue } = useFormContext<SignupData>();
  const orgURLRef = useRef<HTMLInputElement | null>(null);
  const [isURLManuallyEdited, setIsURLManuallyEdited] = useState(false);

  const handleOrganizationNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setValue("organizationName", value);
    if (!isURLManuallyEdited) {
      setValue("organizationURL", createSlug(value));
    }
  };

  const handleOrganizationURLFocus = () => {
    setIsURLManuallyEdited(true);
  };

  return (
    <>
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
                tabIndex={1}
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
                tabIndex={2}
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

      <AuthCommonFieldOrganizationURL
        control={control}
        name="organizationURL"
        label="Create an Organization URL"
        inputRef={orgURLRef}
        onFocus={handleOrganizationURLFocus}
        tabIndex={3}
      />
    </>
  );
}
