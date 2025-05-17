import {
  AuthCommonFieldOrganizationURL,
  AuthCommonSubmitButton,
  useAuthLoginFormContext,
} from "@/components/Auth";
import { useFormContext } from "react-hook-form";

export function AuthLoginStepOrganizationURL() {
  const { control } = useFormContext();
  const { isProcessing } = useAuthLoginFormContext();

  return (
    <>
      <AuthCommonFieldOrganizationURL
        control={control}
        name="organizationURL"
        label="Enter your Organization URL"
        placeholder="your-organization"
        tabIndex={1}
        autoFocus
      />
      <AuthCommonSubmitButton
        isLoading={isProcessing}
        text="Next"
        tabIndex={2}
      />
    </>
  );
}
