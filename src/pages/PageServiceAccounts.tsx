import { ServiceAccountDataTable } from "@/components/workflows/ServiceAccounts";
import { LayoutPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";

export function PageServiceAccounts() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["workflows", "useGetServiceAccounts"] });
  };

  return (
    <LayoutPage
      title="Service Accounts"
      description="Manage Service Accounts that define identity and permissions for External Secrets to fetch secrets from external providers."
    >
      <LayoutPortalTopbarActions>
        <Button variant="secondary" onClick={handleRefresh}>
          <LucideRefreshCw />
          Refresh Data
        </Button>
      </LayoutPortalTopbarActions>
      <ServiceAccountDataTable />
    </LayoutPage>
  );
}
