import { TargetDataTable } from "@/components/workflows/Targets";
import { LayoutPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";

export function PageTargets() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["workflows", "useGetTargets"] });
  };

  return (
    <LayoutPage
      title="Workflow Targets"
      description="Manage your External Secrets Operator Targets. Targets represent Virtual Machines and other resources that can receive secrets."
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
      <TargetDataTable />
    </LayoutPage>
  );
}