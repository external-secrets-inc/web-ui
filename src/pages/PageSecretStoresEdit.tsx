import { LayoutPage } from "@/components/layout";
import { SecretStoreEdit } from "@/components/workflows/SecretStores";

export function PageSecretStoresEdit() {
  return (
    <LayoutPage
      title="Edit Secret Store"
      description="Edit a Workflow Secret Store."
      width="compact"
    >
      <SecretStoreEdit />
    </LayoutPage>
  );
}
