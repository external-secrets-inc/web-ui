import { FindingsDataTable } from "@/components/workflows/Findings";
import { LayoutPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";

export function PageFindings() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["findings", "useGetFindings"] });
  };

  return (
    <LayoutPage
      title="Secrets Findings"
      description="Review groups of duplicate secrets found across your stores. Select a group to see details and consolidate them with a workflow."
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
      <FindingsDataTable />
    </LayoutPage>
  );
}