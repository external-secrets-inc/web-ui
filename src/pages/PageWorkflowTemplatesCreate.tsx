import { LayoutPage } from "@/components/layout";
import { WorkflowTemplateCreateForm } from "@/components/workflows/Workflows/WorkflowTemplateCreateForm";

export function PageWorkflowTemplatesCreate() {
  return (
    <LayoutPage
      title="New Workflow Template"
      description="Create a new Workflow Template."
      width="compact"
    >
      <WorkflowTemplateCreateForm />
    </LayoutPage>
  );
}
