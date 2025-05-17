import { AuthCommonSection, AuthSignupForm } from "@/components/Auth";
export function AuthSignup() {
  return (
    <AuthCommonSection
      title="Create an Organization"
      description="Unlock the full potential of External Secrets in your Kubernetes cluster"
      ariaLabel="Create an Organization"
    >
      <AuthSignupForm />
    </AuthCommonSection>
  );
}
