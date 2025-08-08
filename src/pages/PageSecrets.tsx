import { SecretDataTable } from "@/components/workflows/Secrets";
import { LayoutPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";

export function PageSecrets() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["workflows", "useGetSecrets"] });
  };

  return (
    <LayoutPage
      title="Workflow Secrets"
      description="Manage your External Secrets Operator Secrets. Secrets define how External Secrets can fetch secrets from external systems."
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
      <SecretDataTable />
    </LayoutPage>
  );
}
