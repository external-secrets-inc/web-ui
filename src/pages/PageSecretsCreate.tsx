import { LayoutPage } from "@/components/layout";
import { SecretCreate } from "@/components/workflows/Secrets";

export function PageSecretsCreate() {
  return (
    <LayoutPage
      title="New Secret"
      description="Create a new Workflow Secret."
      width="compact"
    >
      <SecretCreate />
    </LayoutPage>
  );
}
