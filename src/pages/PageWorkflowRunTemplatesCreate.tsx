import { LayoutPage } from "@/components/layout";
import { WorkflowRunTemplateCreate } from "@/components/workflows/Workflows/WorkflowRunTemplateCreate";
import { useParams } from "react-router-dom";

export function PageWorkflowRunTemplatesCreate() {
  return (
    <LayoutPage
      title="New Run Template"
      description={
        <>
            Create a new Run Template to associate with the{" "}
            <b>
              {useParams().templateName}
            </b>{" "}
            Template
        </>
      }
      width="compact"
    >
      <WorkflowRunTemplateCreate />
    </LayoutPage>
  );
}
