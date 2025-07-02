import { LayoutPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { useParams } from "react-router-dom";
import { WorkflowTemplateDetails } from "@/components/workflows/Workflows";

export function PageWorkflowTemplateDetails() {
  const queryClient = useQueryClient();
  const { templateNamespace, templateName } = useParams();

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: [
        "workflows",
        "useGetWorkflowRunTemplates",
        `useGetWorkflowRunTemplates/${templateNamespace}/${templateName}`,
      ],
    });

    queryClient.invalidateQueries({
      queryKey: [
        "workflows",
        "useGetWorkflowTemplate",
        `useGetWorkflowTemplate/${templateNamespace}/${templateName}`,
      ],
    });
  };

  return (
    <LayoutPage
      title={`${templateName}`}
      description={`Namespace: ${templateNamespace}`}
    >
      <LayoutPortalTopbarActions>
        <Button variant="secondary" onClick={handleRefresh}>
          <LucideRefreshCw />
          Refresh Data
        </Button>
      </LayoutPortalTopbarActions>
      <WorkflowTemplateDetails />
    </LayoutPage>
  );
}
