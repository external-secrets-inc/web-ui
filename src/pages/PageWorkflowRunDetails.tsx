import { LayoutPage } from "@/components/layout";
import { useParams } from "react-router-dom";
import { WorkflowRunDetails } from "@/components/workflows/Workflows";

export function PageWorkflowRunDetails() {
  const { workflowRunName } = useParams();

  return (
    <LayoutPage
      title={`${workflowRunName}`}
    >
      <WorkflowRunDetails />
    </LayoutPage>
  );
}
