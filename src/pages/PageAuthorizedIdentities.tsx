import { LayoutPage } from "@/components/layout";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Button } from "@/components/ui/button";
import { AuthorizedIdentitiesList } from "@/components/workflows/AuthorizedIdentities";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";

export function PageAuthorizedIdentities() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["authorizedidentities", "useGetAuthorizedIdentities"] });
  };

  return (
    <LayoutPage
      title="Authorized Identities"
      description="Track credential leases and access per identity. View which clients obtained credentials from SecretStores or dynamically generated via Generators."
    >
      <LayoutPortalTopbarActions>
        <Button
          variant="secondary"
          onClick={handleRefresh}
        >
          <LucideRefreshCw />
          Refresh Data
        </Button>
      </LayoutPortalTopbarActions>
      <AuthorizedIdentitiesList />
    </LayoutPage>
  );
}
