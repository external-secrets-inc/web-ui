import { FederationDataTable } from "@/components/workflows/Federations";
import { LayoutPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";

export function PageFederations() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["federations", "useGetFederations"] });
  };

  return (
    <LayoutPage
      title="Identity Providers"
      description="Identity Providers establish trusted connections between different clusters or trust domains, enabling secure sharing and validation of secrets across environments."
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
      <FederationDataTable />
    </LayoutPage>
  );
}
