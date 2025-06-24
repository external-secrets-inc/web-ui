import { SecretStoreDataTable } from "@/components/workflows/SecretStores";
import { LayoutPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";

export function PageSecretStores() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["workflows", "useGetSecretStores"] });
  };

  return (
    <LayoutPage
      title="Secret Stores"
      description="Manage your External Secrets Operator Secret Stores. Secret Stores define how External Secrets can fetch secrets from external systems."
    >
      <LayoutPortalTopbarActions>
        <Button
          variant="secondary"
          onClick={handleRefresh}
        >
          <LucideRefreshCw className="mr-1 h-4 w-4" />
          Refresh Data
        </Button>
      </LayoutPortalTopbarActions>
      <SecretStoreDataTable />
    </LayoutPage>
  );
}