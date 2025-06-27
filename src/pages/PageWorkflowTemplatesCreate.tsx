import { LayoutPage } from "@/components/layout";
import { WorkflowTemplateCreate } from "@/components/workflows/Workflows/WorkflowTemplateCreate";

export function PageWorkflowTemplatesCreate() {
  return (
    <LayoutPage
      title="New Workflow Template"
      description="Create a new Workflow Template."
      width="compact"
    >
      <WorkflowTemplateCreate />
    </LayoutPage>
  );
}
