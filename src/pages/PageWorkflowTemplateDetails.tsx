import { LayoutPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { WorkflowRunTemplateDataTable } from "@/components/workflows/Workflows/WorkflowRunTemplateDataTable";
import { useParams } from "react-router-dom";

export function PageWorkflowTemplateDetails() {
  const queryClient = useQueryClient();
  const { templateNamespace, templateName } = useParams();

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: [
        "workflows",
        "useGetWorkflowRunTemplates",
        `useGetWorkflowRunTemplates${templateNamespace}/${templateName}`,
      ],
    });
  };

  return (
    <LayoutPage
      title={`${templateNamespace}/${templateName}`}
      description="Manage your External Secrets Operator Workflow Run Templates."
    >
      <LayoutPortalTopbarActions>
        <Button variant="secondary" onClick={handleRefresh}>
          <LucideRefreshCw className="mr-1 h-4 w-4" />
          Refresh Data
        </Button>
      </LayoutPortalTopbarActions>
      <WorkflowRunTemplateDataTable />
    </LayoutPage>
  );
}
