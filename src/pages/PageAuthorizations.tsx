import { AuthorizationDataTable } from "@/components/workflows/Authorizations";
import { LayoutPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";

export function PageAuthorizations() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["authorizations", "useGetAuthorizations"] });
  };

  return (
    <LayoutPage
      title="Authorizations"
      description="Authorizations define which subjects are permitted to access resources within a federation."
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
      <AuthorizationDataTable />
    </LayoutPage>
  );
}
