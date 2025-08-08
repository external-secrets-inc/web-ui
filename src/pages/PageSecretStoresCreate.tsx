import { LayoutPage } from "@/components/layout";
import { SecretStoreCreate } from "@/components/workflows/SecretStores";

export function PageSecretStoresCreate() {
  return (
    <LayoutPage
      title="New Secret Store"
      description="Create a new Secret Store."
      width="compact"
    >
      <SecretStoreCreate />
    </LayoutPage>
  );
}