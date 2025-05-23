import { AuthCommonSection, AuthLoginForm } from "@/components/Auth";
import { APP_DOMAIN_STRIPPED } from "@/constants";
import { useState } from "react";

export function AuthLogin() {
  const [stepId, setStepId] = useState<string>("organizationURL");
  const [orgUrl, setOrgUrl] = useState<string>("");

  const handleStepChange = (newStepId: string) => {
    setStepId(newStepId);
  };

  const handleOrganizationURLChange = (newOrgUrl: string) => {
    setOrgUrl(newOrgUrl);
  };

  const title =
    stepId === "credentials" && orgUrl ? (
      <>You're logging in on</>
    ) : (
      <>Log in to an Organization</>
    );

  const description =
    stepId === "credentials" && orgUrl ? (
      <span className="text-pretty text-sm text-muted-foreground [overflow-wrap:anywhere]">
        {APP_DOMAIN_STRIPPED}/
        <strong className="text-foreground">{orgUrl}</strong>
      </span>
    ) : (
      <>Welcome back!</>
    );

  return (
    <AuthCommonSection
      title={title}
      description={description}
      ariaLabel="Log in to an Organization"
    >
      <AuthLoginForm
        onStepChange={handleStepChange}
        onOrganizationURLChange={handleOrganizationURLChange}
      />
    </AuthCommonSection>
  );
}
