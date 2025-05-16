import { AuthCommonSection, AuthSignupForm } from "@/components/Auth";
import { useState } from "react";

export function AuthSignup() {
  const [currentStep, setCurrentStep] = useState<string>("organizationInfo");

  const description =
    currentStep === "organizationInfo"
      ? "Unlock the full potential of External Secrets in your Kubernetes cluster"
      : "Create your administrator account";

  return (
    <AuthCommonSection
      title="Create an Organization"
      description={description}
      ariaLabel="Create an Organization"
    >
      <AuthSignupForm onStepChange={setCurrentStep} />
    </AuthCommonSection>
  );
}
