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
      title="Workflow Templates"
      description="Manage your External Secrets Operator Workflow Templates."
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
      <WorkflowTemplateDataTable />
    </LayoutPage>
  );
}
