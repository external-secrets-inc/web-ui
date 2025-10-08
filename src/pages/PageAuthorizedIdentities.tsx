import { LayoutPage } from "@/components/layout";
import { AuthorizedIdentitiesList } from "@/components/workflows/AuthorizedIdentities";

export function PageAuthorizedIdentities() {
  return (
    <LayoutPage
      title="Authorized Identities"
      description="Track credential leases and access per identity. View which clients obtained credentials from SecretStores or dynamically generated via Generators."
    >
      <AuthorizedIdentitiesList />
    </LayoutPage>
  );
}


