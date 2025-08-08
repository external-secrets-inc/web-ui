import { LayoutPage } from "@/components/layout";
import { WorkflowTemplateCreate } from "@/components/workflows/Workflows/WorkflowTemplateCreate";

export function PageWorkflowTemplatesCreate() {
  return (
    <LayoutPage
      title="New Workflow"
      description="Create a new Workflow."
      width="compact"
    >
      <WorkflowTemplateCreate />
    </LayoutPage>
  );
}
