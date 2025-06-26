import { LayoutPage } from "@/components/layout";
import { WorkflowRunTemplateCreate } from "@/components/workflows/Workflows/WorkflowRunTemplateCreate";

export function PageWorkflowRunTemplatesCreate() {
  return (
    <LayoutPage
      title="New Workflow Run Template"
      description="Create a new Workflow Run Template."
      width="compact"
    >
      <WorkflowRunTemplateCreate />
    </LayoutPage>
  );
}
