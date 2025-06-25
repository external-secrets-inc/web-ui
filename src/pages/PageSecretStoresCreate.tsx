import { LayoutPage } from "@/components/layout";
import { SecretStoreCreateForm } from "@/components/workflows/SecretStores";

export function PageSecretStoresCreate() {
  return (
    <LayoutPage
      title="New Secret Store"
      description="Create a new Workflow Secret Store."
      width="compact"
    >
      <SecretStoreCreateForm />
    </LayoutPage>
  );
}