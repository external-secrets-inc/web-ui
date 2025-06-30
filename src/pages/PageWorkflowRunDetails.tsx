import { LayoutPage } from "@/components/layout";
import { useParams } from "react-router-dom";
import { WorkflowRunDetails } from "@/components/workflows/Workflows";

export function PageWorkflowRunDetails() {
  const { workflowRunNamespace, workflowRunName } = useParams();

  return (
    <LayoutPage
      title={`${workflowRunName}`}
      description={`Namespace: ${workflowRunNamespace}`}
    >
      <WorkflowRunDetails />
    </LayoutPage>
  );
}
