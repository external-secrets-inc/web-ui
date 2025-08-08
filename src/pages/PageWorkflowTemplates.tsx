import { WorkflowTemplateDataTable } from "@/components/workflows/Workflows";
import { LayoutPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";

export function PageWorkflowTemplates() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["workflows", "useGetWorkflowTemplates"] });
  };

  return (
    <LayoutPage
      title="Workflows"
      description="Standardize automated procedures for triggering secret generation, rotation, and distribution."
    >
      <LayoutPortalTopbarActions>
        <Button variant="secondary" onClick={handleRefresh}>
          <LucideRefreshCw />
          Refresh Data
        </Button>
      </LayoutPortalTopbarActions>
      <WorkflowTemplateDataTable />
    </LayoutPage>
  );
}
