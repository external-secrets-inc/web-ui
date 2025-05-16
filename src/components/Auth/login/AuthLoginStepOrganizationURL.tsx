import { AuthCommonFieldOrganizationURL } from "@/components/Auth";
import { useFormContext } from "react-hook-form";

export function AuthLoginStepOrganizationURL() {
  const { control } = useFormContext();

  return (
    <AuthCommonFieldOrganizationURL
      control={control}
      name="organizationURL"
      label="Enter your Organization URL"
      placeholder="your-organization"
      tabIndex={1}
      autoFocus
    />
  );
}
