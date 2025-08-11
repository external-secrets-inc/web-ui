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
      description="Define Secret Stores (provider configs) that External Secrets reference."
    >
      <LayoutPortalTopbarActions>
        <Button variant="secondary" onClick={handleRefresh}>
          <LucideRefreshCw />
          Refresh Data
        </Button>
      </LayoutPortalTopbarActions>
      <SecretStoreDataTable />
    </LayoutPage>
  );
}